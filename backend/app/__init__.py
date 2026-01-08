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

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app
