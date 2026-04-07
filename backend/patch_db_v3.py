import sqlite3
from pathlib import Path

DB_PATH = Path(r"c:\Users\majed.altaifi\Desktop\cloude code1\backend\nit_data.db")

def patch():
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("ALTER TABLE chat_messages ADD COLUMN sender_no TEXT")
        print("Added sender_no column.")
    except Exception as e:
        print("Column might already exist:", e)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    patch()
