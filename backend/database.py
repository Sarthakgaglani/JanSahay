import os
import json
import hashlib
import sqlite3
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./jansahay.db")

# Detect if the configuration points to PostgreSQL
_is_placeholder = "c123456" in DB_URL or "example" in DB_URL
IS_POSTGRES = (_is_placeholder is False) and (DB_URL.startswith("postgresql://") or DB_URL.startswith("postgres://"))

def get_connection():
    """Retrieve connection dynamically depending on DATABASE_URL dialect with fallback support."""
    global IS_POSTGRES
    if IS_POSTGRES:
        try:
            import psycopg2
            return psycopg2.connect(DB_URL)
        except Exception as exc:
            print(f"Warning: PostgreSQL connection to {DB_URL} failed ({exc}). Falling back to SQLite for stability.")
            IS_POSTGRES = False
            
    # SQLite Fallback
    db_path = "jansahay.db"
    if not os.path.isabs(db_path):
        db_path = os.path.join(BASE_DIR, db_path)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                full_name TEXT NOT NULL,
                email VARCHAR(254) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role VARCHAR(30) NOT NULL DEFAULT 'citizen',
                created_at VARCHAR(50) NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS refresh_sessions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                token_hash VARCHAR(64) NOT NULL UNIQUE,
                expires_at VARCHAR(50) NOT NULL,
                revoked_at VARCHAR(50),
                created_at VARCHAR(50) NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL REFERENCES users(id),
                synthetic_reference VARCHAR(32) NOT NULL UNIQUE,
                scheme_slug VARCHAR(160) NOT NULL,
                scheme_name TEXT NOT NULL,
                scheme_category VARCHAR(80),
                scheme_portal VARCHAR(80),
                application_url TEXT,
                demo_name VARCHAR(60) NOT NULL,
                state VARCHAR(80) NOT NULL,
                district VARCHAR(80) NOT NULL,
                preferred_contact_method VARCHAR(80) NOT NULL,
                document_checks TEXT NOT NULL,
                status VARCHAR(40) NOT NULL,
                created_at VARCHAR(50) NOT NULL,
                updated_at VARCHAR(50) NOT NULL
            )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_refresh_sessions_token ON refresh_sessions(token_hash)')
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
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'citizen',
                created_at TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS refresh_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at TEXT NOT NULL,
                revoked_at TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                synthetic_reference TEXT NOT NULL UNIQUE,
                scheme_slug TEXT NOT NULL,
                scheme_name TEXT NOT NULL,
                scheme_category TEXT,
                scheme_portal TEXT,
                application_url TEXT,
                demo_name TEXT NOT NULL,
                state TEXT NOT NULL,
                district TEXT NOT NULL,
                preferred_contact_method TEXT NOT NULL,
                document_checks TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_user_created ON applications(user_id, created_at DESC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_refresh_sessions_token ON refresh_sessions(token_hash)')
        print("SQLite Database schema initialized.")
        
    conn.commit()
    conn.close()
    seed_demo_user()

def seed_demo_user():
    try:
        from backend.security import hash_password
        if not get_user_by_email("demo@jansahay.in"):
            create_user("Rahul Sharma", "demo@jansahay.in", hash_password("DemoPassword123"))
    except Exception as e:
        print(f"Demo user seed notice: {e}")

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
    queries_by_day = [{"date": str(r[0]), "queries": r[1]} for r in daily_rows]

    # Language distribution
    cursor.execute("SELECT language, COUNT(*) FROM query_log GROUP BY language ORDER BY COUNT(*) DESC")
    lang_rows = cursor.fetchall()
    language_distribution = [{"language": r[0], "count": r[1]} for r in lang_rows]

    # Portal usage
    cursor.execute("SELECT portal_used, COUNT(*) FROM query_log WHERE portal_used != '' GROUP BY portal_used ORDER BY COUNT(*) DESC LIMIT 6")
    portal_rows = cursor.fetchall()
    portal_usage = [{"portal": r[0], "count": r[1]} for r in portal_rows]

    # Helpful ratio from feedback
    if IS_POSTGRES:
        cursor.execute("SELECT COUNT(*), SUM(CASE WHEN helpful IS TRUE THEN 1 ELSE 0 END) FROM feedback")
    else:
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


def _record_to_dict(record):
    if record is None:
        return None
    if isinstance(record, sqlite3.Row):
        return dict(record)
    columns = [desc[0] for desc in record.cursor_description] if hasattr(record, 'cursor_description') else None
    return dict(zip(columns, record)) if columns else record


def create_user(full_name: str, email: str, password_hash: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        p = get_placeholder()
        cursor.execute(
            f"INSERT INTO users (id, full_name, email, password_hash, role, created_at) VALUES ({p}, {p}, {p}, {p}, {p}, {p})",
            (user_id, full_name, email, password_hash, "citizen", created_at),
        )
        conn.commit()
        return get_user_by_id(user_id)
    except Exception as exc:
        conn.rollback()
        if "unique" in str(exc).lower() or "duplicate" in str(exc).lower():
            return None
        raise
    finally:
        conn.close()


def _fetch_user(query: str, params: tuple):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        row = cursor.fetchone()
        if not row:
            return None
        if IS_POSTGRES:
            columns = [item[0] for item in cursor.description]
            return dict(zip(columns, row))
        return dict(row)
    finally:
        conn.close()


def get_user_by_email(email: str):
    return _fetch_user(f"SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE email = {get_placeholder()}", (email,))


def get_user_by_id(user_id: str):
    return _fetch_user(f"SELECT id, full_name, email, password_hash, role, created_at FROM users WHERE id = {get_placeholder()}", (user_id,))


def create_refresh_session(user_id: str, token_hash: str, expires_at: str):
    conn = get_connection()
    try:
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        p = get_placeholder()
        cursor = conn.cursor()
        cursor.execute(
            f"INSERT INTO refresh_sessions (id, user_id, token_hash, expires_at, created_at) VALUES ({p}, {p}, {p}, {p}, {p})",
            (session_id, user_id, token_hash, expires_at, now),
        )
        conn.commit()
        return session_id
    finally:
        conn.close()


def get_active_refresh_session(token_hash: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        p = get_placeholder()
        cursor.execute(
            f"SELECT id, user_id, expires_at FROM refresh_sessions WHERE token_hash = {p} AND revoked_at IS NULL",
            (token_hash,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        result = dict(row) if not IS_POSTGRES else dict(zip([item[0] for item in cursor.description], row))
        if result["expires_at"] <= datetime.now(timezone.utc).isoformat():
            return None
        return result
    finally:
        conn.close()


def revoke_refresh_session(token_hash: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        p = get_placeholder()
        cursor.execute(f"UPDATE refresh_sessions SET revoked_at = {p} WHERE token_hash = {p} AND revoked_at IS NULL", (datetime.now(timezone.utc).isoformat(), token_hash))
        conn.commit()
    finally:
        conn.close()


def create_application(user_id: str, scheme: dict, application: dict):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        p = get_placeholder()
        for _ in range(10):
            reference = f"JS-{datetime.now(timezone.utc).year}-{secrets.randbelow(900000) + 100000}"
            try:
                cursor.execute(
                    f"INSERT INTO applications (id, user_id, synthetic_reference, scheme_slug, scheme_name, scheme_category, scheme_portal, application_url, demo_name, state, district, preferred_contact_method, document_checks, status, created_at, updated_at) VALUES ({', '.join([p] * 16)})",
                    (str(uuid.uuid4()), user_id, reference, scheme["slug"], scheme["name"], scheme.get("category"), scheme.get("portal"), scheme.get("application_url"), application["demo_name"], application["state"], application["district"], application["preferred_contact_method"], json.dumps(application["document_checks"]), "SUBMITTED", now, now),
                )
                conn.commit()
                return get_application_for_user(user_id, reference)
            except Exception as exc:
                if "unique" not in str(exc).lower() and "duplicate" not in str(exc).lower():
                    raise
        raise RuntimeError("Could not generate a synthetic application reference.")
    finally:
        conn.close()


def _application_from_row(row, columns=None):
    record = dict(row) if isinstance(row, sqlite3.Row) else dict(zip(columns, row))
    return {
        "id": record["synthetic_reference"],
        "scheme": {
            "slug": record["scheme_slug"], "name": record["scheme_name"], "category": record.get("scheme_category"),
            "portal": record.get("scheme_portal"), "applicationUrl": record.get("application_url"),
        },
        "applicant": {"demoName": record["demo_name"], "state": record["state"], "district": record["district"], "contactMethod": record["preferred_contact_method"]},
        "documentChecks": json.loads(record["document_checks"]),
        "status": record["status"].replace("_", " ").title(),
        "createdAt": record["created_at"], "updatedAt": record["updated_at"], "isSynthetic": True,
    }


def get_applications_for_user(user_id: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        p = get_placeholder()
        cursor.execute(f"SELECT * FROM applications WHERE user_id = {p} ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        columns = [item[0] for item in cursor.description] if IS_POSTGRES else None
        return [_application_from_row(row, columns) for row in rows]
    finally:
        conn.close()


def get_application_for_user(user_id: str, reference: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        p = get_placeholder()
        cursor.execute(f"SELECT * FROM applications WHERE user_id = {p} AND synthetic_reference = {p}", (user_id, reference))
        row = cursor.fetchone()
        if not row:
            return None
        columns = [item[0] for item in cursor.description] if IS_POSTGRES else None
        return _application_from_row(row, columns)
    finally:
        conn.close()
