import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

# 1. Setup Firebase Admin (This bypasses security rules)
# Make sure you have the JSON key file in your directory
# Replace 'serviceAccountKey.json' with your actual filename if different
cred_path = 'cloude-code1-firebase-adminsdk-fbsvc-60c02c7001.json'

if not os.path.exists(cred_path):
    print(f"❌ Error: {cred_path} not found! Please make sure the JSON key is in this folder.")
    exit()

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

def upload_data():
    # 2. Load Excel
    file_path = 'employees.xlsx' # Adjust this to your actual filename
    if not os.path.exists(file_path):
        # Try to find any xlsx file if the name is different
        files = [f for f in os.listdir('.') if f.endswith('.xlsx')]
        if files:
            file_path = files[0]
            print(f"📂 Found Excel file: {file_path}")
        else:
            print("❌ No Excel file found in the directory!")
            return

    print(f"Reading {file_path}...")
    df = pd.read_excel(file_path)
    
    # 3. Batch Upload
    batch = db.batch()
    count = 0
    total = 0
    
    print("🚀 Starting upload to Firestore...")
    
    for _, row in df.iterrows():
        emp_no = str(row.get('Employee Code', '')).strip()
        if not emp_no or emp_no == 'nan': continue
        
        doc_ref = db.collection('employees').document(emp_no)
        
        payload = {
            'emp_no': emp_no,
            'name_en': str(row.get('Employee Name - English', '')),
            'role': str(row.get('Position - English', '')),
            'department': str(row.get('Departments - English', '')),
            'division': str(row.get('Division - English', '')),
            'site': str(row.get('Site - English', '')),
            'email': str(row.get('E-Mail', '')),
            'phone': str(row.get('Mobile', '')),
            'grade': str(row.get('Grade - English', '')),
            'branch_code': str(row.get('Branch Code', '')),
            'activated': False
        }
        
        batch.set(doc_ref, payload, merge=True)
        count += 1
        total += 1
        
        if count >= 400:
            batch.commit()
            print(f"✅ Synced {total} records...")
            batch = db.batch()
            count = 0
            
    if count > 0:
        batch.commit()
        
    print(f"✨ DONE! {total} employees are now live in Firestore.")

if __name__ == "__main__":
    upload_data()
