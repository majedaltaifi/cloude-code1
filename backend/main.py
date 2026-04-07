from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import database as db
import json
import asyncio

app = FastAPI(title="NIT Field App - Backend")

# Enable CORS for Mobile App and Web Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELS ───
class EmployeeCreate(BaseModel):
    emp_no: str
    name_ar: str
    name_en: str = None
    department: str = None
    site: str = None
    role: str = "field"

class ReportCreate(BaseModel):
    emp_no: str
    type: str
    priority: str = "Normal"
    site: str = None
    description: str = None
    photo_b64: str = None

class NotificationCreate(BaseModel):
    emp_no: str | None = None
    title_ar: str
    body_ar: str
    type: str = "info"
    report_id: int | None = None

class SupportCreate(BaseModel):
    emp_no: str
    name: str
    phone: str = None
    email: str = None
    subject: str
    message: str


# Initialize DB on startup
@app.on_event("startup")
async def startup():
    db.init_db()

# ─── API ENDPOINTS ───

@app.get("/")
def home():
    return {"status": "ok", "message": "NIT Field App Backend Running"}

@app.get("/stats")
def get_stats():
    return db.get_stats()

# Employees
@app.get("/employees")
def get_employees():
    return db.get_all_employees()

@app.get("/employees/{emp_no}")
def get_employee(emp_no: str):
    emp = db.get_employee_by_empno(emp_no)
    if not emp: raise HTTPException(status_code=404, detail="Employee not found")
    return {"employee": emp}

@app.get("/employees/search/{query}")
def search_employees(query: str):
    results = db.search_employees(query)
    return {"results": results}

@app.get("/employees/chats/{emp_no}")
def get_user_chats(emp_no: str):
    sessions = db.get_user_chat_sessions(emp_no)
    return {"sessions": sessions}

@app.get("/employees/online/list")
def get_online_list(exclude: str = ""):
    return {"online": db.get_online_employees(exclude)}

@app.patch("/employees/{emp_no}/online")
def set_online(emp_no: str, status: int = 1):
    print(f"[NIT] Online Status Update: {emp_no} -> {status}")
    db.set_employee_online(emp_no, status)
    return {"status": "ok"}

@app.get("/admin/chats/direct")
def get_admin_chats():
    return db.get_admin_direct_sessions()

@app.post("/employees")
def create_employee(data: EmployeeCreate):
    return db.create_employee(data.dict())

# Reports
@app.get("/reports")
def get_reports(emp_no: str | None = None):
    return {"reports": db.get_all_reports(emp_no)}


@app.get("/reports/{report_id}")
def get_report(report_id: int):
    rep = db.get_report_by_id(report_id)
    if not rep: raise HTTPException(status_code=404, detail="Report not found")
    tl = db.get_timeline(report_id)
    return {"report": rep, "timeline": tl}

@app.post("/reports")
def create_report(data: ReportCreate):
    return db.create_report(data.dict())

@app.patch("/reports/{rid}/status")
def patch_status(rid: int, status: str, op: str = "Admin"):
    db.update_report_status(rid, status, op)
    return {"status": "ok"}

@app.post("/status_update")
def post_status(rid: int, status: str, op: str = "Admin"):
    # High-stability status update route
    db.update_report_status(rid, status, op)
    return {"status": "ok"}

# Notifications
@app.get("/notifications")
def get_notifications(emp_no: str | None = None):
    return db.get_notifications(emp_no)

@app.post("/notifications")
def create_notification(data: NotificationCreate):
    return db.create_notification(**data.dict())

# News & Support
@app.get("/news")
def get_news():
    return db.get_all_broadcasts()

@app.post("/news")
def update_news(data: dict):
    # IDs from JS are often strings; cast to int for SQLite PK matching
    bid = int(data.get("id", 0))
    db.update_broadcast(bid, data["title"], data["content"], data.get("icon", "fa-info-circle"))
    return {"status": "ok"}

@app.get("/support")
def get_support():
    return db.get_all_support_requests()

@app.post("/support")
def create_support(data: SupportCreate):
    return db.create_support_request(data.dict())



# Chat History & Unread
@app.get("/chat/unread")
def get_unread(emp_no: str = "3734"):
    return db.get_unread_chat_counts(emp_no)

@app.get("/chat/history/{session_id}")
def get_chat_history(session_id: str, limit: int = 50):
    return {"messages": db.get_chat_history(session_id, limit)}

@app.patch("/chat/history/{session_id}/read")
def mark_read(session_id: str, emp_no: str = "3734"):
    db.mark_chat_read(session_id, emp_no)
    return {"status": "ok"}

# ─── WEBSOCKETS ───

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: dict, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws/direct/{emp_no}")
async def ws_direct_chat(websocket: WebSocket, emp_no: str):
    session_id = f"direct_{emp_no}"
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg = data.get("message", "").strip()
            role = data.get("role", "employee")
            sender_name = data.get("sender_name", "Unknown")
            # For admin, we use sender_no = "admin"
            sender_no = "admin" if role == "admin" else emp_no
            
            if msg:
                db.save_message(session_id, role, msg, sender_no)
                await manager.broadcast({
                    "session_id": session_id,
                    "role": role,
                    "message": msg,
                    "sender_name": sender_name,
                    "sender_no": sender_no
                }, session_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)

@app.websocket("/ws/report/{report_id}")
async def ws_report_chat(websocket: WebSocket, report_id: str):
    session_id = f"report_{report_id}"
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg = data.get("message", "").strip()
            role = data.get("role", "employee")
            sender_name = data.get("sender_name", "Unknown")
            sender_no = data.get("sender_no", "Unknown")
            
            if msg:
                db.save_message(session_id, role, msg, sender_no)
                await manager.broadcast({
                    "session_id": session_id,
                    "role": role,
                    "message": msg,
                    "sender_name": sender_name,
                    "sender_no": sender_no
                }, session_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)

@app.websocket("/ws/p2p/{id1}/{id2}")
async def ws_p2p_chat(websocket: WebSocket, id1: str, id2: str):
    ids = sorted([id1, id2])
    session_id = f"p2p_{ids[0]}_{ids[1]}"
    await manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg = data.get("message", "").strip()
            sender_name = data.get("sender_name", "Unknown")
            sender_no = data.get("sender_no", "Unknown")
            
            if msg:
                db.save_message(session_id, "employee", msg, sender_no)
                await manager.broadcast({
                    "session_id": session_id,
                    "role": "employee",
                    "message": msg,
                    "sender_name": sender_name,
                    "sender_no": sender_no
                }, session_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
@app.get("/app")
def serve_mobile():
    with open("./Mobile App.html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())
@app.get("/dashboard")
def serve_dashboard():
    with open("./Web (Dashboard).html", "r", encoding="utf-8") as f:
        return HTMLResponse(f.read())
