from __future__ import annotations

from flask import Blueprint

api_bp = Blueprint("api", __name__)


@api_bp.get("/status")
def status() -> dict[str, str]:
    return {"service": "automations", "status": "ready"}
