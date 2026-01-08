import os
from decimal import Decimal, ROUND_HALF_UP

import pymysql
import requests
from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)


# ----------------------------
# DB Helper (Raw SQL via PyMySQL)
# ----------------------------
def get_conn():
    host = os.getenv("MYSQLHOST")
    user = os.getenv("MYSQLUSER")
    password = os.getenv("MYSQLPASSWORD")
    database = os.getenv("MYSQLDATABASE")
    port = int(os.getenv("MYSQLPORT", "3306"))

    if not all([host, user, password, database]):
        raise RuntimeError("Missing MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE (Railway MySQL vars)")

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
