
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "nit_data.db"

def seed_5000_employees():
    print(f"Connecting to database at {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Seeding 5000 employees...")
    
    # We'll use a transaction for speed
    cursor.execute("BEGIN TRANSACTION")
    
    for i in range(1, 5001):
        emp_no = str(i)
        name_ar = f"موظف رقم {i}"
        name_en = f"Employee {i}"
        department = "Field"
        site = "General"
        role = "field"
        
        try:
            cursor.execute("""
                INSERT INTO employees (emp_no, name_ar, name_en, department, site, role)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (emp_no, name_ar, name_en, department, site, role))
        except sqlite3.IntegrityError:
            # Skip if already exists
            pass
            
    conn.execute("COMMIT")
    conn.close()
    print("Successfully seeded 5000 employees.")

if __name__ == "__main__":
    seed_5000_employees()
