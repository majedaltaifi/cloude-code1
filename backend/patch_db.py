import sqlite3
import os

DB_PATH = 'nit_data.db'

def run_patch():
    print(f"[NIT] Connecting to: {os.path.abspath(DB_PATH)}")
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("ALTER TABLE support_tickets ADD COLUMN emp_no TEXT")
        conn.commit()
        print("[NIT] Column 'emp_no' added successfully.")
    except Exception as e:
        print(f"[NIT] Column might already exist or error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    run_patch()
