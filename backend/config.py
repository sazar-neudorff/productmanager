from __future__ import annotations

import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    JSON_SORT_KEYS = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # MySQL (Railway: MYSQL_URL ist eine Variable Reference)
    # Beispiel Railway internal: mysql://root:...@mysql.railway.internal:3306/railway
    # SQLAlchemy braucht Treiberprefix:
    # -> mysql+pymysql://...
    MYSQL_URL = os.getenv("MYSQL_URL", "")

    if MYSQL_URL.startswith("mysql://"):
        MYSQL_URL = MYSQL_URL.replace("mysql://", "mysql+pymysql://", 1)

    SQLALCHEMY_DATABASE_URI = MYSQL_URL or None
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
