import os
from decimal import Decimal, ROUND_HALF_UP
from datetime import timedelta
import hashlib
import secrets
from urllib.parse import urlparse, unquote

import pymysql
import requests
import bcrypt
from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)

SESSION_COOKIE_NAME = os.getenv("SESSION_COOKIE_NAME", "np_session")
SESSION_TTL_DAYS = int(os.getenv("SESSION_TTL_DAYS", "30"))


# ----------------------------
# DB Helper (Raw SQL via PyMySQL)
# ----------------------------
def get_conn():
    host = os.getenv("MYSQLHOST")
    user = os.getenv("MYSQLUSER")
    password = os.getenv("MYSQLPASSWORD")
    database = os.getenv("MYSQLDATABASE")
    port = int(os.getenv("MYSQLPORT", "3306"))

    # Fallback: Railway gibt oft nur MYSQL_URL/MYSQL_PUBLIC_URL (oder DATABASE_URL) mit.
    if not all([host, user, password, database]):
        url = (os.getenv("MYSQL_URL") or os.getenv("MYSQL_PUBLIC_URL") or os.getenv("DATABASE_URL") or "").strip()
        if url:
            # SQLAlchemy-Style URLs tolerieren
            if url.startswith("mysql+pymysql://"):
                url = url.replace("mysql+pymysql://", "mysql://", 1)
            parsed = urlparse(url)
            if parsed.scheme.startswith("mysql"):
                host = parsed.hostname or host
                user = unquote(parsed.username) if parsed.username else user
                password = unquote(parsed.password) if parsed.password else password
                db_from_path = (parsed.path or "").lstrip("/")
                database = db_from_path or database
                port = parsed.port or port

    if not all([host, user, password, database]):
        raise RuntimeError(
            "Missing MySQL connection vars. Provide either MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE "
            "or MYSQL_URL/MYSQL_PUBLIC_URL."
        )

    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def money(v) -> Decimal:
    return Decimal(str(v or "0")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def require_field(obj: dict, name: str) -> str:
    val = (obj.get(name) or "").strip()
    if not val:
        raise ValueError(f"Missing field: {name}")
    return val


def normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def token_sha256(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def ensure_auth_tables(conn):
    """
    Lightweight 'migration': stellt sicher, dass die Sessions-Tabelle existiert.
    (Railway/MySQL: keine Migration-Tooling im Repo)
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS user_sessions (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL,
              token_hash CHAR(64) NOT NULL UNIQUE,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              revoked_at DATETIME NULL,
              ip VARCHAR(45) NULL,
              user_agent VARCHAR(255) NULL,
              CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
              INDEX idx_us_user (user_id),
              INDEX idx_us_active (revoked_at, last_seen_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        )


def set_session_cookie(resp, token: str):
    secure = (os.getenv("COOKIE_SECURE") or "").strip().lower() in (
        "1",
        "true",
        "yes",
        "on",
        # tolerant (falls jemand DE-Werte setzt)
        "ja",
        "treu",
        "wahr",
    )
    cookie_samesite = (os.getenv("COOKIE_SAMESITE") or "").strip()
    # Für getrennte Frontend/Backend-Domains (Railway) braucht es oft SameSite=None + Secure
    if cookie_samesite:
        s = cookie_samesite.strip().lower()
        if s == "none":
            samesite = "None"
        elif s == "lax":
            samesite = "Lax"
        elif s == "strict":
            samesite = "Strict"
        else:
            # ungewohnter Wert: unverändert durchreichen (kann dann von Werkzeug abgelehnt werden)
            samesite = cookie_samesite
    else:
        samesite = "None" if secure else "Lax"
    max_age = int(timedelta(days=SESSION_TTL_DAYS).total_seconds())
    resp.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        max_age=max_age,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path="/",
    )
    return resp


def clear_session_cookie(resp):
    resp.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return resp


def get_request_meta():
    ip = (request.headers.get("X-Forwarded-For") or request.remote_addr or "").split(",")[0].strip() or None
    ua = (request.headers.get("User-Agent") or "").strip()[:255] or None
    return ip, ua


def get_current_user(conn):
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        return None, None

    ensure_auth_tables(conn)
    th = token_sha256(token)

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT s.id AS session_id, s.user_id, u.email, u.first_name, u.last_name, u.department_id, u.is_owner, u.is_active,
                   d.name AS department_name
            FROM user_sessions s
            JOIN users u ON u.id = s.user_id
            LEFT JOIN departments d ON d.id = u.department_id
            WHERE s.token_hash = %s AND s.revoked_at IS NULL
            LIMIT 1
            """,
            (th,),
        )
        row = cur.fetchone()

    if not row:
        return None, None

    if int(row.get("is_active") or 0) != 1:
        return None, None

    # touch session
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE user_sessions SET last_seen_at = NOW() WHERE id = %s",
            (row["session_id"],),
        )

    user = {
        "id": row["user_id"],
        "email": row["email"],
        "firstName": row.get("first_name"),
        "lastName": row.get("last_name"),
        "departmentId": row.get("department_id"),
        "departmentName": row.get("department_name"),
        "isOwner": bool(row.get("is_owner")),
        "isActive": bool(row.get("is_active")),
    }

    return user, row["session_id"]


def get_user_permissions(conn, user_id: int) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT p.key_name
            FROM users u
            JOIN department_permissions dp ON dp.department_id = u.department_id
            JOIN permissions p ON p.id = dp.permission_id
            WHERE u.id = %s
            ORDER BY p.key_name
            """,
            (user_id,),
        )
        rows = cur.fetchall() or []
    return [r["key_name"] for r in rows if r.get("key_name")]


def require_owner(conn):
    user, _sid = get_current_user(conn)
    if not user:
        return None, (jsonify({"error": "unauthorized"}), 401)
    if not user.get("isOwner"):
        return None, (jsonify({"error": "forbidden"}), 403)
    return user, None


def require_admin(conn):
    user, _sid = get_current_user(conn)
    if not user:
        return None, (jsonify({"error": "unauthorized"}), 401)
    if user.get("isOwner"):
        return user, None

    perms = get_user_permissions(conn, user["id"]) if user.get("departmentId") else []
    if "admin_panel" not in perms:
        return None, (jsonify({"error": "forbidden"}), 403)

    return user, None


# ----------------------------
# Shopify (wie bisher)
# ----------------------------
def shopify_graphql(query: str, variables: dict | None = None):
    domain = os.getenv("SHOPIFY_STORE_DOMAIN")
    token = os.getenv("SHOPIFY_STOREFRONT_TOKEN")

    if not domain or not token:
        raise RuntimeError("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN")

    url = f"https://{domain}/api/2024-07/graphql.json"
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
    }

    resp = requests.post(
        url,
        json={"query": query, "variables": variables or {}},
        headers=headers,
        timeout=20,
    )
    resp.raise_for_status()
    payload = resp.json()

    if "errors" in payload:
        raise RuntimeError(payload["errors"])

    return payload["data"]


def map_shopify_product(node: dict) -> dict:
    v_edges = node.get("variants", {}).get("edges", [])
    v = v_edges[0]["node"] if v_edges else {}

    return {
        "id": node.get("id", ""),
        "title": node.get("title", ""),
        "sku": v.get("sku") or "",
        "ean": v.get("barcode") or "",
        "price": float((v.get("price") or {}).get("amount") or 0),
        "description": node.get("description") or "",
        "image": (node.get("featuredImage") or {}).get("url") or "",
    }


@api_bp.get("/products")
def list_products():
    query = """
    query Products($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            description
            featuredImage { url }
            variants(first: 1) {
              edges {
                node {
                  sku
                  barcode
                  price { amount }
                }
              }
            }
          }
        }
      }
    }
    """
    data = shopify_graphql(query, {"first": 20})
    items = [map_shopify_product(edge["node"]) for edge in data["products"]["edges"]]
    return jsonify({"items": items})


@api_bp.get("/products/search")
def search_products():
    q = (request.args.get("q") or "").strip()
    first = int(request.args.get("first") or 20)
    after = request.args.get("after")

    first = max(1, min(first, 50))

    query = """
    query Products($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id
            title
            description
            featuredImage { url }
            variants(first: 1) {
              edges {
                node {
                  sku
                  barcode
                  price { amount }
                }
              }
            }
          }
        }
      }
    }
    """

    data = shopify_graphql(query, {"first": first, "after": after, "query": q if q else None})
    products = data["products"]
    items = [map_shopify_product(edge["node"]) for edge in products["edges"]]
    return jsonify({"items": items, "pageInfo": products["pageInfo"]})


# ----------------------------
# Orders API (Raw SQL)
# ----------------------------
@api_bp.get("/db-health")
def db_health():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 AS ok")
            row = cur.fetchone()
        conn.commit()
        return jsonify({"db": "ok", "result": row})
    finally:
        conn.close()


@api_bp.post("/orders")
def create_order():
    """
    Erwartetes JSON (Beispiel):
    {
      "items": [{ "productId": "...", "title": "...", "sku": "...", "ean": "...", "qty": 2, "unitPrice": 12.34 }],
      "address": { "salutation":"Herr", "firstName":"Max", "lastName":"Mustermann", "company":"", "street":"...", "number":"1", "zip":"12345", "city":"...", "country":"de", "email":"...", "phone":"..." },
      "notes": "..."
    }
    """
    payload = request.get_json(silent=True) or {}
    items = payload.get("items") or []
    address = payload.get("address") or {}
    notes = payload.get("notes")

    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "items must be a non-empty list"}), 400

    try:
        salutation = require_field(address, "salutation")
        last_name = require_field(address, "lastName")
        street = require_field(address, "street")
        number = require_field(address, "number")
        zip_code = require_field(address, "zip")
        city = require_field(address, "city")
        country = (address.get("country") or "de").strip().lower()
        email = require_field(address, "email")

        first_name = (address.get("firstName") or "").strip() or None
        company = (address.get("company") or "").strip() or None
        phone = (address.get("phone") or "").strip() or None

        total = Decimal("0.00")
        normalized_items = []

        for idx, it in enumerate(items):
            qty = int(it.get("qty") or 0)
            if qty <= 0:
                raise ValueError(f"Invalid qty at items[{idx}]")
            unit_price = money(it.get("unitPrice"))
            total += unit_price * qty

            normalized_items.append(
                {
                    "product_id": it.get("productId"),
                    "title": it.get("title"),
                    "sku": it.get("sku"),
                    "ean": it.get("ean"),
                    "qty": qty,
                    "unit_price": unit_price,
                }
            )

        total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        conn = get_conn()
        try:
            with conn.cursor() as cur:
                # 1) orders
                cur.execute(
                    """
                    INSERT INTO orders (currency, notes, total_price)
                    VALUES (%s, %s, %s)
                    """,
                    ("EUR", notes, str(total)),
                )
                order_id = cur.lastrowid

                # 2) order_items
                for it in normalized_items:
                    cur.execute(
                        """
                        INSERT INTO order_items
                          (order_id, product_id, title, sku, ean, qty, unit_price)
                        VALUES
                          (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            order_id,
                            it["product_id"],
                            it["title"],
                            it["sku"],
                            it["ean"],
                            it["qty"],
                            str(it["unit_price"]),
                        ),
                    )

                # 3) order_addresses
                cur.execute(
                    """
                    INSERT INTO order_addresses
                      (order_id, salutation, first_name, last_name, company,
                       street, number, zip, city, country, email, phone)
                    VALUES
                      (%s, %s, %s, %s, %s,
                       %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        order_id,
                        salutation,
                        first_name,
                        last_name,
                        company,
                        street,
                        number,
                        zip_code,
                        city,
                        country,
                        email,
                        phone,
                    ),
                )

            conn.commit()

            return jsonify(
                {
                    "id": order_id,
                    "totalPrice": str(total),
                    "currency": "EUR",
                }
            ), 201

        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # in prod lieber ohne detail
        return jsonify({"error": "internal_error", "detail": str(e)}), 500


@api_bp.get("/orders")
def list_orders():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, created_at, total_price, currency
                FROM orders
                ORDER BY id DESC
                LIMIT 50
                """
            )
            rows = cur.fetchall()

        return jsonify({"items": rows})
    finally:
        conn.close()


# ----------------------------
# Auth (Register/Login/Logout + Sessions in DB)
# ----------------------------
@api_bp.get("/auth/me")
def auth_me():
    conn = get_conn()
    try:
        user, _session_id = get_current_user(conn)
        if not user:
            return jsonify({"user": None}), 200

        perms = get_user_permissions(conn, user["id"]) if user.get("departmentId") else []
        conn.commit()
        return jsonify({"user": user, "permissions": perms}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/auth/register")
def auth_register():
    allow = (os.getenv("AUTH_ALLOW_REGISTRATION") or "true").strip().lower() in ("1", "true", "yes", "on")
    if not allow:
        return jsonify({"error": "registration_disabled"}), 403

    payload = request.get_json(silent=True) or {}
    try:
        email = normalize_email(require_field(payload, "email"))
        password = require_field(payload, "password")
        first_name = (payload.get("firstName") or "").strip() or None
        last_name = (payload.get("lastName") or "").strip() or None
        department_id = payload.get("departmentId")
        department_id = int(department_id) if department_id not in (None, "", 0, "0") else None

        if not (6 <= len(password) <= 128):
            return jsonify({"error": "password_policy", "detail": "Passwort muss 6-128 Zeichen haben."}), 400
        if not email or "@" not in email:
            return jsonify({"error": "email_invalid"}), 400

        pw_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        conn = get_conn()
        try:
            ensure_auth_tables(conn)

            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (email, password_hash, first_name, last_name, department_id, is_owner, is_active)
                    VALUES (%s, %s, %s, %s, %s, 0, 1)
                    """,
                    (email, pw_hash, first_name, last_name, department_id),
                )
                user_id = cur.lastrowid

            # Auto-login: Session erstellen
            token = secrets.token_urlsafe(32)
            th = token_sha256(token)
            ip, ua = get_request_meta()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_sessions (user_id, token_hash, ip, user_agent)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (user_id, th, ip, ua),
                )
                cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (user_id,))

            conn.commit()

            resp = jsonify({"ok": True})
            return set_session_cookie(resp, token), 201

        except pymysql.err.IntegrityError:
            conn.rollback()
            return jsonify({"error": "email_exists"}), 409
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    except ValueError as e:
        return jsonify({"error": "bad_request", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "internal_error", "detail": str(e)}), 500


@api_bp.post("/auth/login")
def auth_login():
    payload = request.get_json(silent=True) or {}
    try:
        email = normalize_email(require_field(payload, "email"))
        password = require_field(payload, "password")

        conn = get_conn()
        try:
            ensure_auth_tables(conn)
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, email, password_hash, is_active
                    FROM users
                    WHERE email = %s
                    LIMIT 1
                    """,
                    (email,),
                )
                row = cur.fetchone()

            if not row or int(row.get("is_active") or 0) != 1:
                return jsonify({"error": "invalid_credentials"}), 401

            if not bcrypt.checkpw(password.encode("utf-8"), (row["password_hash"] or "").encode("utf-8")):
                return jsonify({"error": "invalid_credentials"}), 401

            token = secrets.token_urlsafe(32)
            th = token_sha256(token)
            ip, ua = get_request_meta()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO user_sessions (user_id, token_hash, ip, user_agent)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (row["id"], th, ip, ua),
                )
                cur.execute("UPDATE users SET last_login_at = NOW() WHERE id = %s", (row["id"],))
            conn.commit()

            resp = jsonify({"ok": True})
            return set_session_cookie(resp, token), 200
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    except ValueError as e:
        return jsonify({"error": "bad_request", "detail": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "internal_error", "detail": str(e)}), 500


@api_bp.post("/auth/logout")
def auth_logout():
    conn = get_conn()
    try:
        user, session_id = get_current_user(conn)
        if session_id:
            with conn.cursor() as cur:
                cur.execute("UPDATE user_sessions SET revoked_at = NOW() WHERE id = %s", (session_id,))
            conn.commit()

        resp = jsonify({"ok": True, "user": user})
        return clear_session_cookie(resp), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


# ----------------------------
# Admin (Owner-only): Users / Departments / Permissions
# ----------------------------
@api_bp.get("/admin/departments")
def admin_list_departments():
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT d.id, d.name, d.created_at, COUNT(u.id) AS user_count
                FROM departments d
                LEFT JOIN users u ON u.department_id = d.id
                GROUP BY d.id, d.name, d.created_at
                ORDER BY d.name
                """
            )
            rows = cur.fetchall() or []
        conn.commit()
        return jsonify({"items": rows}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/departments")
def admin_create_department():
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        try:
            name = require_field(payload, "name")
        except ValueError as e:
            return jsonify({"error": "bad_request", "detail": str(e)}), 400

        if not (2 <= len(name) <= 100):
            return jsonify({"error": "bad_request", "detail": "name must be 2-100 chars"}), 400

        with conn.cursor() as cur:
            cur.execute("INSERT INTO departments (name) VALUES (%s)", (name,))
            dep_id = cur.lastrowid
            cur.execute("SELECT id, name, created_at FROM departments WHERE id=%s LIMIT 1", (dep_id,))
            dep = cur.fetchone()

        conn.commit()
        return jsonify({"item": dep}), 201
    except pymysql.err.IntegrityError:
        conn.rollback()
        return jsonify({"error": "department_exists"}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.get("/admin/permissions")
def admin_list_permissions():
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        with conn.cursor() as cur:
            cur.execute("SELECT id, key_name, label, created_at FROM permissions ORDER BY key_name")
            rows = cur.fetchall() or []
        conn.commit()
        return jsonify({"items": rows}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.get("/admin/departments/<int:department_id>/permissions")
def admin_get_department_permissions(department_id: int):
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM departments WHERE id=%s LIMIT 1", (department_id,))
            dep = cur.fetchone()
            if not dep:
                return jsonify({"error": "not_found"}), 404

            cur.execute(
                """
                SELECT p.key_name, p.label
                FROM department_permissions dp
                JOIN permissions p ON p.id = dp.permission_id
                WHERE dp.department_id = %s
                ORDER BY p.key_name
                """,
                (department_id,),
            )
            perms = cur.fetchall() or []

        conn.commit()
        return jsonify({"department": dep, "permissions": perms}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/departments/<int:department_id>/permissions")
def admin_set_department_permissions(department_id: int):
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        keys = payload.get("permissionKeys")
        if not isinstance(keys, list):
            return jsonify({"error": "bad_request", "detail": "permissionKeys must be an array"}), 400

        keys = [str(k).strip() for k in keys if str(k).strip()]

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM departments WHERE id=%s LIMIT 1", (department_id,))
            if not cur.fetchone():
                return jsonify({"error": "not_found"}), 404

            if keys:
                placeholders = ",".join(["%s"] * len(keys))
                cur.execute(f"SELECT id, key_name FROM permissions WHERE key_name IN ({placeholders})", tuple(keys))
                perm_rows = cur.fetchall() or []
                key_to_id = {r["key_name"]: r["id"] for r in perm_rows}
                missing = [k for k in keys if k not in key_to_id]
                if missing:
                    return jsonify({"error": "bad_request", "detail": f"Unknown permission keys: {missing}"}), 400
                perm_ids = [key_to_id[k] for k in keys]
            else:
                perm_ids = []

            # replace set
            cur.execute("DELETE FROM department_permissions WHERE department_id=%s", (department_id,))
            if perm_ids:
                cur.executemany(
                    "INSERT INTO department_permissions (department_id, permission_id) VALUES (%s, %s)",
                    [(department_id, pid) for pid in perm_ids],
                )

        conn.commit()
        return jsonify({"ok": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.get("/admin/users")
def admin_list_users():
    conn = get_conn()
    try:
        ensure_auth_tables(conn)
        _user, err = require_admin(conn)
        if err:
            return err

        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                  u.id, u.email, u.first_name, u.last_name,
                  u.department_id, d.name AS department_name,
                  u.is_owner, u.is_active,
                  u.created_at, u.last_login_at,
                  (
                    SELECT COUNT(*)
                    FROM user_sessions s
                    WHERE s.user_id = u.id AND s.revoked_at IS NULL
                  ) AS active_sessions
                FROM users u
                LEFT JOIN departments d ON d.id = u.department_id
                ORDER BY u.id DESC
                LIMIT 500
                """
            )
            rows = cur.fetchall() or []

        conn.commit()
        return jsonify({"items": rows}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/users")
def admin_create_user():
    conn = get_conn()
    try:
        ensure_auth_tables(conn)
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        try:
            email = normalize_email(require_field(payload, "email"))
        except ValueError as e:
            return jsonify({"error": "bad_request", "detail": str(e)}), 400

        first_name = (payload.get("firstName") or "").strip() or None
        last_name = (payload.get("lastName") or "").strip() or None
        department_id = payload.get("departmentId")
        department_id = int(department_id) if department_id not in (None, "", 0, "0") else None

        is_owner = 1 if str(payload.get("isOwner") or "").strip().lower() in ("1", "true", "yes", "on", "ja") else 0
        is_active = 0 if str(payload.get("isActive") or "true").strip().lower() in ("0", "false", "no", "off", "nein") else 1

        if not email or "@" not in email or len(email) > 255:
            return jsonify({"error": "email_invalid"}), 400

        provided_password = (payload.get("password") or "").strip()
        generated_password = None
        if provided_password:
            new_password = provided_password
        else:
            generated_password = secrets.token_urlsafe(10)
            new_password = generated_password

        if not (6 <= len(new_password) <= 128):
            return jsonify({"error": "password_policy"}), 400

        if department_id is not None:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM departments WHERE id=%s LIMIT 1", (department_id,))
                if not cur.fetchone():
                    return jsonify({"error": "bad_request", "detail": "Unknown departmentId"}), 400

        pw_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (email, password_hash, first_name, last_name, department_id, is_owner, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (email, pw_hash, first_name, last_name, department_id, is_owner, is_active),
            )
            user_id = cur.lastrowid

            cur.execute(
                """
                SELECT
                  u.id, u.email, u.first_name, u.last_name,
                  u.department_id, d.name AS department_name,
                  u.is_owner, u.is_active,
                  u.created_at, u.last_login_at,
                  0 AS active_sessions
                FROM users u
                LEFT JOIN departments d ON d.id = u.department_id
                WHERE u.id = %s
                LIMIT 1
                """,
                (user_id,),
            )
            user_row = cur.fetchone()

        conn.commit()
        return jsonify({"item": user_row, "temporaryPassword": generated_password}), 201
    except pymysql.err.IntegrityError:
        conn.rollback()
        return jsonify({"error": "email_exists"}), 409
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/users/<int:user_id>/department")
def admin_set_user_department(user_id: int):
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        department_id = payload.get("departmentId")
        department_id = int(department_id) if department_id not in (None, "", 0, "0") else None

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE id=%s LIMIT 1", (user_id,))
            if not cur.fetchone():
                return jsonify({"error": "not_found"}), 404

            if department_id is not None:
                cur.execute("SELECT id FROM departments WHERE id=%s LIMIT 1", (department_id,))
                if not cur.fetchone():
                    return jsonify({"error": "bad_request", "detail": "Unknown departmentId"}), 400

            cur.execute("UPDATE users SET department_id=%s WHERE id=%s", (department_id, user_id))

        conn.commit()
        return jsonify({"ok": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/users/<int:user_id>/active")
def admin_set_user_active(user_id: int):
    conn = get_conn()
    try:
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        is_active = payload.get("isActive")
        is_active = 1 if str(is_active).strip().lower() in ("1", "true", "yes", "on", "ja") else 0

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE id=%s LIMIT 1", (user_id,))
            if not cur.fetchone():
                return jsonify({"error": "not_found"}), 404

            cur.execute("UPDATE users SET is_active=%s WHERE id=%s", (is_active, user_id))
            if is_active == 0:
                # revoke sessions if user is disabled
                ensure_auth_tables(conn)
                cur.execute("UPDATE user_sessions SET revoked_at = NOW() WHERE user_id=%s AND revoked_at IS NULL", (user_id,))

        conn.commit()
        return jsonify({"ok": True}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()


@api_bp.post("/admin/users/<int:user_id>/reset-password")
def admin_reset_password(user_id: int):
    conn = get_conn()
    try:
        ensure_auth_tables(conn)
        _user, err = require_admin(conn)
        if err:
            return err

        payload = request.get_json(silent=True) or {}
        provided = (payload.get("password") or "").strip()
        if provided:
            new_password = provided
        else:
            # einmalig anzeigen – danach nur noch Hash in DB
            new_password = secrets.token_urlsafe(10)

        if not (6 <= len(new_password) <= 128):
            return jsonify({"error": "password_policy"}), 400

        pw_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE id=%s LIMIT 1", (user_id,))
            if not cur.fetchone():
                return jsonify({"error": "not_found"}), 404

            cur.execute("UPDATE users SET password_hash=%s WHERE id=%s", (pw_hash, user_id))
            # revoke sessions (force re-login)
            cur.execute("UPDATE user_sessions SET revoked_at = NOW() WHERE user_id=%s AND revoked_at IS NULL", (user_id,))

        conn.commit()
        return jsonify({"ok": True, "temporaryPassword": new_password if not provided else None}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "internal_error", "detail": str(e)}), 500
    finally:
        conn.close()
