import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data_warehouse.db')

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Staging layer for raw scrapes (append-only, unstructured or semi-structured)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS staging_scrapes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                raw_json TEXT,
                source_platform TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed BOOLEAN DEFAULT FALSE
            )
        ''')

        # Warehouse layer (cleaned, deduplicated, validated data)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS warehouse_products (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                platform TEXT NOT NULL,
                price REAL NOT NULL,
                url TEXT,
                image_url TEXT,
                in_stock BOOLEAN DEFAULT TRUE,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Metrics for monitoring (Grafana/Dashboard)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scrape_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT,
                items_scraped INTEGER,
                success_rate REAL,
                latency_ms INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # A/B Testing Logs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ab_test_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                variant_id TEXT,
                event_type TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        conn.commit()

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
