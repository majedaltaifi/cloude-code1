import firebase_admin
from firebase_admin import credentials, firestore
import os

# 1. Setup Firebase Admin
cred_path = 'cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json'

if not os.path.exists(cred_path):
    print(f"❌ Error: {cred_path} not found!")
    exit()

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def delete_collection(collection_name, batch_size=500):
    print(f"Clearing collection: {collection_name}...")
    collection_ref = db.collection(collection_name)
    docs = collection_ref.limit(batch_size).stream()
    deleted = 0

    batch = db.batch()
    for doc in docs:
        if collection_name == 'chat_sessions':
            messages = doc.reference.collection('messages').stream()
            for m in messages:
                m.reference.delete()
        
        if collection_name == 'reports':
            timeline = doc.reference.collection('timeline').stream()
            for t in timeline:
                t.reference.delete()

        batch.delete(doc.reference)
        deleted += 1

    if deleted > 0:
        batch.commit()
        print(f"DONE: Deleted {deleted} documents from {collection_name}")
        return delete_collection(collection_name, batch_size)
    else:
        print(f"SKIP: {collection_name} is already empty.")

def reset_counters():
    print("Resetting report count to 0...")
    db.collection('settings').document('counters').set({'report_count': 0}, merge=True)
    print("OK: Counter reset.")

def main():
    print("STARTING RESET: Deleting ALL reports, notifications, and chat messages...")

    delete_collection('reports')
    delete_collection('chat_sessions')
    delete_collection('notifications')
    delete_collection('fcm_tokens')
    
    reset_counters()
    
    print("\nRESET COMPLETE! Your dashboard is now fresh and ready for real data.")

if __name__ == "__main__":
    main()
