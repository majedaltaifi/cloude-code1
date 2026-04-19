import firebase_admin
from firebase_admin import credentials, firestore
import os

cred_path = 'cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json'
if not os.path.exists(cred_path):
    # Try to copy from Downloads if missing
    src = r"C:\Users\majed.altaifi\Downloads\cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json"
    if os.path.exists(src):
        import shutil
        shutil.copy(src, cred_path)
    else:
        print("Error: JSON key not found.")
        exit()

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def clear_broadcasts():
    print("Clearing all broadcasts...")
    docs = db.collection('broadcasts').stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    print(f"Deleted {count} broadcasts.")

    # Create 4 fresh empty slots for the admin to use
    print("Creating 4 fresh slots...")
    for i in range(1, 5):
        db.collection('broadcasts').document(str(i)).set({
            'title': '',
            'content': '',
            'icon': 'fa-bullhorn',
            'updated_at': '2020-01-01T00:00:00Z' # Set to old date so it's "empty"
        })
    print("DONE.")

if __name__ == "__main__":
    clear_broadcasts()
