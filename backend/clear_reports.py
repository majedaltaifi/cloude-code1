import sqlite3
import os

# Connect to the main DB
DB_PATH = os.path.join(os.path.dirname(__file__), "nit_data.db")

def clear_all_reports():
    print(f"[NIT] Cleaning reports from: {DB_PATH}")
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        
        # Disable checks to delete everything related to reports
        cur.execute("PRAGMA foreign_keys = OFF;")
        
        # Delete data from tables
        cur.execute("DELETE FROM reports;")
        cur.execute("DELETE FROM notifications;")
        cur.execute("DELETE FROM timeline;")
        cur.execute("DELETE FROM chat_history;")
        
        conn.commit()
        conn.close()
        print("[NIT] SUCCESS! All demo reports, chat history, and logs have been cleared.")
    except Exception as e:
        print(f"[NIT] ERROR: {e}")

if __name__ == "__main__":
    clear_all_reports()
