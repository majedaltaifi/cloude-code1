import sqlite3
import os

DB_PATH = "cloude-code1/backend/nit_data.db"
if os.path.exists(DB_PATH):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM broadcasts")
    rows = cursor.fetchall()
    print(f"[NIT] Broadcasts found: {len(rows)}")
    for r in rows:
        print(r)
    conn.close()
else:
    print("[NIT] Database file NOT found at: " + DB_PATH)
