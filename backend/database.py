"""
database.py — NIT Field App
SQLite database setup, models, and CRUD helpers.
"""

import sqlite3
import json
import threading
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "nit_data.db"

# Thread-local storage: one connection per thread (safe for FastAPI workers)
_local = threading.local()


# ─────────────────────────────────────────────
#  Connection helper
# ─────────────────────────────────────────────
def get_conn() -> sqlite3.Connection:
    """Return a thread-local SQLite connection, creating one if needed."""
    if not hasattr(_local, "conn") or _local.conn is None:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row          # rows behave like dicts
        conn.execute("PRAGMA journal_mode=WAL")  # safe concurrent writes
        conn.execute("PRAGMA foreign_keys=ON")   # enforce FK constraints
        _local.conn = conn
    return _local.conn


# ─────────────────────────────────────────────
#  Schema creation
# ─────────────────────────────────────────────
def init_db():
    """Create all tables if they don't exist."""
    with get_conn() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS employees (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_no      TEXT    UNIQUE NOT NULL,
            name_ar     TEXT    NOT NULL,
            name_en     TEXT,
            department  TEXT,
            site        TEXT,
            role        TEXT    DEFAULT 'field',
            is_online   INTEGER DEFAULT 0,
            created_at  TEXT    DEFAULT (datetime('now'))
        );


        CREATE TABLE IF NOT EXISTS reports (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_no   TEXT    UNIQUE NOT NULL,
            emp_no      TEXT    NOT NULL,
            type        TEXT    NOT NULL,
            priority    TEXT    NOT NULL,
            status      TEXT    DEFAULT 'open',
            site        TEXT,
            description TEXT,
            photo_b64   TEXT,
            assigned_to TEXT,
            created_at  TEXT    DEFAULT (datetime('now')),
            updated_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (emp_no) REFERENCES employees(emp_no)
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id  TEXT    NOT NULL,
            role        TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            source      TEXT    DEFAULT 'text',
            is_read     INTEGER DEFAULT 0,
            sender_no   TEXT,   -- Added for p2p tracking
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_no      TEXT,
            title_ar    TEXT    NOT NULL,
            body_ar     TEXT,
            type        TEXT    DEFAULT 'info',
            is_read     INTEGER DEFAULT 0,
            report_id   INTEGER,
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS broadcasts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            icon        TEXT    NOT NULL,
            title       TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            updated_at  TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS support_requests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            emp_no      TEXT    NOT NULL,
            name        TEXT    NOT NULL,
            phone       TEXT,
            email       TEXT,
            subject     TEXT    NOT NULL,
            message     TEXT    NOT NULL,
            status      TEXT    DEFAULT 'pending',
            created_at  TEXT    DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS report_timeline (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            report_id   INTEGER NOT NULL,
            event_text  TEXT    NOT NULL,
            event_by    TEXT    DEFAULT 'System',
            color       TEXT,
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (report_id) REFERENCES reports(id)
        );
        
        
        """)
        # Migration: Ensure sender_no exists for existing DBs
        try: conn.execute("ALTER TABLE chat_messages ADD COLUMN sender_no TEXT");
        except: pass
        try: conn.execute("ALTER TABLE employees ADD COLUMN is_online INTEGER DEFAULT 0");
        except: pass
    print("[NIT] Database initialized at:", DB_PATH)



# ─────────────────────────────────────────────
#  EMPLOYEES
# ─────────────────────────────────────────────
def get_all_employees() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM employees ORDER BY name_ar").fetchall()
        return [dict(r) for r in rows]

def get_employee_by_empno(emp_no: str) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM employees WHERE emp_no = ?", (emp_no,)).fetchone()
        return dict(row) if row else None

def create_employee(data: dict) -> dict:
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO employees (emp_no, name_ar, name_en, department, site, role, is_online)
               VALUES (:emp_no, :name_ar, :name_en, :department, :site, :role, :is_online)""", 
               {**{"name_en": None, "department": None, "site": None, "role": "field", "is_online": 0}, **data})
        conn.commit()
    return get_employee_by_empno(data["emp_no"])

def get_online_employees(exclude_emp_no: str) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM employees WHERE is_online = 1 AND emp_no != ? LIMIT 10", (exclude_emp_no,)).fetchall()
        return [dict(r) for r in rows]

def set_employee_online(emp_no: str, is_online: int):
    with get_conn() as conn:
        conn.execute("UPDATE employees SET is_online = ? WHERE emp_no = ?", (is_online, emp_no))
        conn.commit()

def search_employees(query: str) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM employees WHERE name_ar LIKE ? OR emp_no LIKE ?", (f"%{query}%", f"%{query}%")).fetchall()
        return [dict(r) for r in rows]

# ─────────────────────────────────────────────
#  REPORTS
# ─────────────────────────────────────────────
def get_all_reports(emp_no: str | None = None) -> list[dict]:
    with get_conn() as conn:
        if emp_no:
            rows = conn.execute("SELECT * FROM reports WHERE emp_no = ? ORDER BY created_at DESC", (emp_no,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

def get_report_by_id(report_id: int) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
        return dict(row) if row else None

def create_report(data: dict) -> dict:
    ts = datetime.now().strftime("%Y%m%d%H%M%S")
    data["ticket_no"] = f"NIT-{ts}"
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO reports (ticket_no, emp_no, type, priority, site, description, photo_b64)
               VALUES (:ticket_no, :emp_no, :type, :priority, :site, :description, :photo_b64)""", data)
        report_id = cur.lastrowid
        conn.commit()
    return get_report_by_id(report_id)

def update_report_status(report_id: int, status: str, updated_by: str = "system"):
    with get_conn() as conn:
        conn.execute("UPDATE reports SET status = ?, updated_at = (datetime('now')) WHERE id = ?", (status, report_id))
        # Log to timeline
        msg = f"Status changed to {status.upper()}"
        color = "var(--accent)"
        if status.lower() == 'done':
            msg = "Case Resolved / إغلاق البلاغ"
            color = "var(--success)"
        elif status.lower() == 'inprog':
            msg = "Processing / جاري المعالجة"
            color = "#f59e0b"
            
        conn.execute("INSERT INTO report_timeline (report_id, event_text, event_by, color) VALUES (?, ?, ?, ?)", (report_id, msg, updated_by, color))
        conn.commit()

def get_timeline(report_id: int) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM report_timeline WHERE report_id = ? ORDER BY created_at ASC", (report_id,)).fetchall()
        return [dict(r) for r in rows]




# ─────────────────────────────────────────────
#  CHAT HISTORY
# ─────────────────────────────────────────────
def save_message(session_id: str, role: str, content: str, sender_no: str | None = None):
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO chat_messages (session_id, role, content, sender_no)
               VALUES (?, ?, ?, ?)""", (session_id, role, content, sender_no)
        )
        conn.commit()

def get_chat_history(session_id: str, limit: int = 50) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?", (session_id, limit)).fetchall()
        return [dict(r) for r in reversed(rows)]

def mark_chat_read(session_id: str, reader_no: str):
    """Mark as read: All messages in this room that I DID NOT send."""
    with get_conn() as conn:
        # If it's a report chat, we usually check role != 'employee' (for admin msgs)
        if session_id.startswith('report_'):
            conn.execute("UPDATE chat_messages SET is_read = 1 WHERE session_id = ? AND role != 'employee'", (session_id,))
        else:
            # For p2p and direct: Anyone who isn't the reader
            conn.execute("UPDATE chat_messages SET is_read = 1 WHERE session_id = ? AND sender_no != ?", (session_id, reader_no))
        conn.commit()

def get_unread_chat_counts(emp_no: str) -> dict:
    """Returns a map of session_id -> count of messages NOT sent by this user that are unread."""
    with get_conn() as conn:
        # All rooms this user is in
        rows = conn.execute(
            "SELECT session_id, COUNT(*) as cnt FROM chat_messages WHERE is_read = 0 AND (sender_no != ? OR sender_no IS NULL) GROUP BY session_id",
            (emp_no,)
        ).fetchall()
        # Filter for sessions relevant to this user
        res = {}
        for r in rows:
            sid = r["session_id"]
            if sid.startswith("direct_") and sid != f"direct_{emp_no}": continue
            if sid.startswith("p2p_") and emp_no not in sid: continue
            # Handle reports separately
            if sid.startswith("report_"):
                # verify report ownership if needed, but for now we'll allow all unread msgs (admin->employee)
                pass
            res[sid] = r["cnt"]
        return res

def get_user_chat_sessions(emp_no: str) -> list[str]:
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT DISTINCT session_id FROM chat_messages 
               WHERE (session_id LIKE 'p2p_%' AND session_id LIKE ?)
               OR session_id = ?""", (f"%{emp_no}%", f"direct_{emp_no}")
        ).fetchall()
        return [r["session_id"] for r in rows]

def get_admin_direct_sessions() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT SUBSTR(session_id, 8) as emp_no, MAX(id) as last_msg_id
               FROM chat_messages WHERE session_id LIKE 'direct_%'
               GROUP BY session_id ORDER BY last_msg_id DESC""").fetchall()
        emps = []
        for r in rows:
            emp = get_employee_by_empno(r["emp_no"])
            if emp: emps.append(emp)
        return emps

# ─────────────────────────────────────────────
#  NOTIFICATIONS
# ─────────────────────────────────────────────
def get_notifications(emp_no: str | None = None) -> list[dict]:
    with get_conn() as conn:
        if emp_no:
            rows = conn.execute("SELECT * FROM notifications WHERE emp_no = ? OR emp_no IS NULL ORDER BY created_at DESC", (emp_no,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM notifications ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

def create_notification(emp_no: str | None, title: str, body: str, ntype: str = "info", report_id: int | None = None):
    with get_conn() as conn:
        conn.execute("INSERT INTO notifications (emp_no, title_ar, body_ar, type, report_id) VALUES (?, ?, ?, ?, ?)", (emp_no, title, body, ntype, report_id))
        conn.commit()

# ─────────────────────────────────────────────
#  STATS
# ─────────────────────────────────────────────
def get_stats() -> dict:
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        open_r = conn.execute("SELECT COUNT(*) FROM reports WHERE status='open'").fetchone()[0]
        inprog = conn.execute("SELECT COUNT(*) FROM reports WHERE status='inprog'").fetchone()[0]
        done = conn.execute("SELECT COUNT(*) FROM reports WHERE status='done'").fetchone()[0]
        emps = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
        # Support
        try:
            supp = conn.execute("SELECT COUNT(*) FROM support_requests").fetchone()[0]
        except: supp = 0
        return { "total_reports": total, "open": open_r, "in_progress": inprog, "closed": done, "total_employees": emps, "total_support": supp }


# ─────────────────────────────────────────────
#  BROADCASTS (NEWS)
# ─────────────────────────────────────────────
def get_all_broadcasts() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM broadcasts ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]

def create_broadcast(icon: str, title: str, content: str):
    with get_conn() as conn:
        conn.execute("INSERT INTO broadcasts (icon, title, content) VALUES (?, ?, ?)", (icon, title, content))
        conn.commit()

def update_broadcast(id: int, title: str, content: str, icon: str = 'fa-info-circle'):
    with get_conn() as conn:
        conn.execute("UPDATE broadcasts SET title = ?, content = ?, icon = ?, updated_at = (datetime('now')) WHERE id = ?", (title, content, icon, id))
        conn.commit()



# ─────────────────────────────────────────────
#  SUPPORT
# ─────────────────────────────────────────────
def create_support_request(data: dict) -> dict:
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO support_requests (emp_no, name, phone, email, subject, message)
               VALUES (:emp_no, :name, :phone, :email, :subject, :message)""", data)
        conn.commit()
        return {"id": cur.lastrowid, "status": "ok"}

def get_all_support_requests() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM support_requests ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]


