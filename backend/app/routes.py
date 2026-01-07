import os
import requests
from flask import Blueprint, jsonify, request

api_bp = Blueprint("api", __name__)

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


# Optional: initiale Produkte (z.B. Startliste)
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


# ✅ WICHTIG: Suche + Pagination (q + after)
@api_bp.get("/products/search")
def search_products():
    q = (request.args.get("q") or "").strip()
    first = int(request.args.get("first") or 20)
    after = request.args.get("after")

    # Limit für Performance
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

    return jsonify({
        "items": items,
        "pageInfo": products["pageInfo"],
    })
