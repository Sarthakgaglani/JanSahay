import os
import json
import hashlib
import sqlite3
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./jansahay.db")

# Detect if the configuration points to PostgreSQL
IS_POSTGRES = DB_URL.startswith("postgresql://") or DB_URL.startswith("postgres://")

def get_connection():
    """Retrieve connection dynamically depending on DATABASE_URL dialect."""
    if IS_POSTGRES:
        try:
            import psycopg2
            return psycopg2.connect(DB_URL)
        except ImportError:
            raise ImportError(
                "psycopg2 is not installed but a postgresql DATABASE_URL was specified. "
                "Please run: pip install psycopg2-binary"
            )
    else:
        # SQLite
        db_path = DB_URL.replace("sqlite:///", "")
        if not os.path.isabs(db_path):
            db_path = os.path.join(BASE_DIR, db_path)
        return sqlite3.connect(db_path)

def get_placeholder():
    """Returns the parameter placeholder depending on connection dialect."""
    return "%s" if IS_POSTGRES else "?"

def init_db():
    """Initialize database and create schema tables."""
    conn = get_connection()
    cursor = conn.cursor()
    
    if IS_POSTGRES:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                helpful BOOLEAN NOT NULL,
                timestamp VARCHAR(50) DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_log (
                id SERIAL PRIMARY KEY,
                question_hash VARCHAR(64),
                language VARCHAR(10) DEFAULT 'en',
                portal_used VARCHAR(50),
                timestamp VARCHAR(50) DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("PostgreSQL Database schema initialized.")
    else:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                helpful BOOLEAN NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_hash TEXT,
                language TEXT DEFAULT 'en',
                portal_used TEXT,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("SQLite Database schema initialized.")
        
    conn.commit()
    conn.close()

def save_feedback(question: str, helpful: bool):
    """Save feedback log entry dynamically."""
    conn = get_connection()
    cursor = conn.cursor()
    
    p = get_placeholder()
    cursor.execute(
        f"INSERT INTO feedback (question, helpful, timestamp) VALUES ({p}, {p}, {p})",
        (question, 1 if helpful else 0, datetime.now(timezone.utc).isoformat())
    )
    conn.commit()
    conn.close()

def log_query(question: str, language: str = "en", portal_used: str = ""):
    """Log every query for analytics (stores hashed question for privacy)."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Hash question for privacy — we never store raw queries
        q_hash = hashlib.sha256(question.encode()).hexdigest()[:16]
        p = get_placeholder()
        cursor.execute(
            f"INSERT INTO query_log (question_hash, language, portal_used, timestamp) VALUES ({p}, {p}, {p}, {p})",
            (q_hash, language, portal_used, datetime.now(timezone.utc).isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to log query: {e}")

def get_stats():
    """Retrieve total count of feedback and helpful metrics."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), SUM(CASE WHEN helpful THEN 1 ELSE 0 END) FROM feedback" if IS_POSTGRES else "SELECT COUNT(*), SUM(helpful) FROM feedback")
    row = cursor.fetchone()
    conn.close()
    
    total = row[0] if row else 0
    helpful = row[1] if row and row[1] is not None else 0
    return {"total_feedback": total, "helpful_count": int(helpful)}

def get_analytics():
    """Return analytics data for the dashboard page."""
    conn = get_connection()
    cursor = conn.cursor()

    # Total queries
    cursor.execute("SELECT COUNT(*) FROM query_log")
    row = cursor.fetchone()
    total_queries = row[0] if row else 0

    # Queries in last 7 days (grouped by date)
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    cursor.execute(
        "SELECT substr(timestamp, 1, 10), COUNT(*) FROM query_log WHERE timestamp >= ? GROUP BY substr(timestamp, 1, 10) ORDER BY substr(timestamp, 1, 10)",
        (seven_days_ago,)
    ) if not IS_POSTGRES else cursor.execute(
        "SELECT DATE(timestamp), COUNT(*) FROM query_log WHERE timestamp >= %s GROUP BY DATE(timestamp) ORDER BY DATE(timestamp)",
        (seven_days_ago,)
    )
    daily_rows = cursor.fetchall()
    queries_by_day = [{"date": r[0], "queries": r[1]} for r in daily_rows]

    # Language distribution
    cursor.execute("SELECT language, COUNT(*) FROM query_log GROUP BY language ORDER BY COUNT(*) DESC")
    lang_rows = cursor.fetchall()
    language_distribution = [{"language": r[0], "count": r[1]} for r in lang_rows]

    # Portal usage
    cursor.execute("SELECT portal_used, COUNT(*) FROM query_log WHERE portal_used != '' GROUP BY portal_used ORDER BY COUNT(*) DESC LIMIT 6")
    portal_rows = cursor.fetchall()
    portal_usage = [{"portal": r[0], "count": r[1]} for r in portal_rows]

    # Helpful ratio from feedback
    cursor.execute("SELECT COUNT(*), SUM(helpful) FROM feedback")
    fb_row = cursor.fetchone()
    total_feedback = fb_row[0] if fb_row else 0
    helpful_count = int(fb_row[1]) if fb_row and fb_row[1] is not None else 0
    helpful_ratio = round((helpful_count / total_feedback * 100), 1) if total_feedback > 0 else 0

    conn.close()

    return {
        "total_queries": total_queries,
        "queries_by_day": queries_by_day,
        "language_distribution": language_distribution,
        "portal_usage": portal_usage,
        "total_feedback": total_feedback,
        "helpful_count": helpful_count,
        "helpful_ratio": helpful_ratio
    }
