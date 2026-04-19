import firebase_admin
from firebase_admin import credentials, firestore
import os
from datetime import datetime

cred_path = 'cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json'
if not os.path.exists(cred_path):
    src = r"C:\Users\majed.altaifi\Downloads\cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json"
    import shutil
    shutil.copy(src, cred_path)

if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

def seed_broadcasts():
    print("Re-seeding broadcasts with visible data...")
    now = datetime.utcnow().isoformat() + "Z"
    
    # Define some default broadcasts to show it's working
    data = [
        {"id": "1", "title": "HR REMINDER", "content": "Welcome to the new NIT Field App. Please update your profile.", "icon": "fa-bullhorn"},
        {"id": "2", "title": "SAFETY ALERT", "content": "Always wear your PPE on site. Safety first!", "icon": "fa-shield-alt"},
        {"id": "3", "title": "TOP SITE", "content": "Randa Tower - No incidents reported this week.", "icon": "fa-trophy"},
        {"id": "4", "title": "EVENTS", "content": "Town Hall meeting this Thursday at 10 AM.", "icon": "fa-calendar-check"},
        {"id": "5", "title": "ADMIN MESSAGE", "content": "Broadcast system is now fully operational.", "icon": "fa-user-shield"}
    ]

    for item in data:
        db.collection('broadcasts').document(item["id"]).set({
            "title": item["title"],
            "content": item["content"],
            "icon": item["icon"],
            "updated_at": now
        })
        print(f"Propagated Slot #{item['id']}")

    print("DONE. The app should now show these immediately.")

if __name__ == "__main__":
    seed_broadcasts()
