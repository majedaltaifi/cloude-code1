"""
data_seed.py — NIT Field App
Pre-populate the database with sample employees and reports.
Run once: python data_seed.py
"""

import database as db


EMPLOYEES = [
    { "emp_no": "1",  "name_ar": "Employee One", "name_en": "Employee One", "department": "Operations", "site": "Main Site", "role": "field", "is_online": 1 },
    { "emp_no": "2",  "name_ar": "Employee Two", "name_en": "Employee Two", "department": "Logistics", "site": "Randa Tower", "role": "field", "is_online": 1 },
    { "emp_no": "3",  "name_ar": "Employee Three", "name_en": "Employee Three", "department": "Management", "site": "HQ", "role": "admin", "is_online": 0 },
    { "emp_no": "1452", "name_ar": "Majed Al-Taifi", "name_en": "Majed Al-Taifi", "department": "Ops", "site": "Riyadh HQ", "role": "Supervisor", "is_online": 1 },
    { "emp_no": "3734", "name_ar": "Majed Al-Taifi", "name_en": "Majed Al-Taifi", "department": "Management", "site": "Randa Tower", "role": "field", "is_online": 1 }
]



REPORTS = [
    {
        "emp_no": "1452", "type": "safety", "priority": "hi", "site": "Riyadh HQ", "status": "open",
        "description": "Fault in high-voltage cables near the main gate (Critical condition)", "photo_b64": None
    },
    {
        "emp_no": "1", "type": "materials", "priority": "med", "site": "Alternate Field Site", "status": "inprog",
        "description": "Request to supply the site with 5 additional PPE toolboxes", "photo_b64": None
    },
    {
        "emp_no": "1452", "type": "complaint", "priority": "low", "site": "Riyadh HQ", "status": "done",
        "description": "AC issue in control room 204 (previously repaired, needs checking)", "photo_b64": None
    },
    {
        "emp_no": "2", "type": "safety", "priority": "hi", "site": "Logistics Yard", "status": "open",
        "description": "Oil leak from a heavy truck in the central maintenance workshop", "photo_b64": None
    },
    {
        "emp_no": "3734", "type": "mechanical", "priority": "hi", "site": "Randa Tower", "status": "inprog",
        "description": "Defect in central air conditioning connections on the 6th floor", "photo_b64": None
    },
    {
        "emp_no": "3734", "type": "safety", "priority": "low", "site": "Randa Tower", "status": "done",
        "description": "Completed inspection of fire extinguishers in the rear parking area", "photo_b64": None
    },
]



def seed_employees():
    print("[NIT] Seeding employees only...")
    db.init_db()
    existing_emps = {e["emp_no"] for e in db.get_all_employees()}
    for emp in EMPLOYEES:
        if emp["emp_no"] not in existing_emps:
            db.create_employee(emp)
            print(f"   [+] Employee added: {emp['emp_no']} - {emp['name_ar']}")

def seed_reports():
    print("[NIT] Seeding reports...")
    # Only if empty
    if len(db.get_all_reports()) == 0:
        for rpt in REPORTS:
            import random
            data = rpt.copy()
            data["ticket_no"] = f"TKT-{random.randint(1000, 9999)}"
            data["assigned_to"] = "الإدارة"
            created = db.create_report(data)
            if rpt["status"] != "open":
                db.update_report_status(created["id"], rpt["status"], "system_seed")
            print(f"   [+] Report seeded: {created['id']}")

def seed_broadcasts():
    print("[NIT] Seeding broadcasts...")
    if len(db.get_all_broadcasts()) == 0:
        db.create_broadcast('fa-trophy', 'Top Site (Safety)', 'Randa Tower')
        db.create_broadcast('fa-calendar-check', 'Zero Absences', 'Abdullah Salem (Mar)')
        db.create_broadcast('fa-bullhorn', 'HR Reminder', 'Update your bank details')
        print("   [+] Broadcasts seeded.")

def clear_db():
    print("[NIT] Wiping current database tables...")
    with db.get_conn() as conn:
        for table in ["reports", "reports_timeline", "employees", "messages", "support", "broadcasts", "notifications"]:
            try: conn.execute(f"DELETE FROM {table}")
            except: pass
        conn.commit()

def seed():
    clear_db()
    seed_employees()
    seed_broadcasts()
    seed_reports()


if __name__ == "__main__":
    seed()
