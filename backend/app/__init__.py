from __future__ import annotations
from flask_cors import CORS

import os
from flask import Flask

from .routes import api_bp


def create_app(config_name: str | None = None) -> Flask:
    """Application factory used by Flask scripts and the WSGI server."""
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    config_name = config_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(get_config_object(config_name))

    register_blueprints(app)

    @app.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return app


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(api_bp, url_prefix="/api")


def get_config_object(env: str) -> str:
    env = env.lower()
    match env:
        case "production":
            return "config.ProductionConfig"
        case "testing":
            return "config.TestingConfig"
        case _:
            return "config.DevelopmentConfig"
