import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg.connect(database_url, connect_timeout=10)

    return psycopg.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        sslmode="require",
        connect_timeout=10
    )