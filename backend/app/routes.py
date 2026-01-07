import os
import requests
from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.get("/health")
def health():
    return {"status": "ok"}

def shopify_graphql(query: str, variables: dict | None = None):
    domain = os.getenv("SHOPIFY_STORE_DOMAIN")
    token = os.getenv("SHOPIFY_STOREFRONT_TOKEN")

    if not domain or not token:
        return None

    url = f"https://{domain}/api/2024-07/graphql.json"
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
    }

    response = requests.post(
        url,
        json={"query": query, "variables": variables or {}},
        headers=headers,
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["data"]

@api_bp.get("/products")
def products():
    query = """
    query {
      products(first: 20) {
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

    data = shopify_graphql(query)
    if not data:
        return {"error": "Shopify ENV missing"}, 500

    items = []
    for edge in data["products"]["edges"]:
        p = edge["node"]
        v = p["variants"]["edges"][0]["node"] if p["variants"]["edges"] else {}

        items.append({
            "id": p["id"],
            "title": p["title"],
            "sku": v.get("sku", ""),
            "ean": v.get("barcode", ""),
            "price": float(v.get("price", {}).get("amount", 0)),
            "description": p.get("description", ""),
            "image": (p.get("featuredImage") or {}).get("url", ""),
        })

    return jsonify({"items": items})


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
        timeout=15,
    )
    resp.raise_for_status()
    payload = resp.json()

    if "errors" in payload:
        raise RuntimeError(payload["errors"])

    return payload["data"]


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

    items = []
    for edge in data["products"]["edges"]:
        p = edge["node"]
        v_edges = p["variants"]["edges"]
        v = v_edges[0]["node"] if v_edges else {}

        items.append({
            "id": p["id"],
            "title": p["title"],
            "sku": v.get("sku") or "",
            "ean": v.get("barcode") or "",
            "price": float((v.get("price") or {}).get("amount") or 0),
            "description": p.get("description") or "",
            "image": (p.get("featuredImage") or {}).get("url") or "",
        })

    return jsonify({"items": items})
