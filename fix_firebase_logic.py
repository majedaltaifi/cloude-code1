import re

def fix_logic():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Repairing sync() and fetchHRNews() and doSubmit() to be more resilient
    # We will remove orderBy() temporarily because it requires automatic Indexing in Firebase console
    # instead we will sort them in JS.
    
    replacements = {
        r"const snap = await db.collection\('broadcasts'\).orderBy\('updated_at', 'desc'\).limit\(5\).get\(\);": 
        "const snap = await db.collection('broadcasts').limit(5).get();",
        
        r"const snap = await db.collection\('reports'\).where\('emp_no', '==', currentUser.emp_no\).orderBy\('created_at', 'desc'\).get\(\);":
        "const snap = await db.collection('reports').where('emp_no', '==', currentUser.emp_no).get();",
        
        r"reports = snap.docs.map\(d => \(\{id: d.id, ...d.data\(\)\}\)\);":
        "reports = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));",

        r"hrNews = snap.docs.map\(d => \(\{id: d.id, ...d.data\(\)\}\)\);":
        "hrNews = snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));"
    }

    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)

    if new_content != content:
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Logic Fixed Successfully")
    else:
        print("Logic Already Correct or Pattern Not Found")

try:
    fix_logic()
except Exception as e:
    print(e)
