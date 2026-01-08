from __future__ import annotations

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from .routes import api_bp

# lädt lokal .env, auf Railway kommen Variablen aus dem UI
load_dotenv()


def create_app(config_name: str | None = None) -> Flask:
    app = Flask(__name__)

    # CORS: für Cookie-Sessions muss Origin explizit/reflectable sein (kein wildcard in Kombination mit Credentials).
    raw_origins = (os.getenv("CORS_ORIGINS") or "").strip()
    if raw_origins:
        origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    else:
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]

    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=True,
    )

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app
