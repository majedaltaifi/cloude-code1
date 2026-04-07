/**
 * apiClient.js — NIT Field App
 * Central API client for all backend communication.
 * Backend runs at http://localhost:8000 (change IP for physical device)
 */

import axios from 'axios';

// ─────────────────────────────────────────────
//  Base URL — change to your machine's LAN IP
//  when testing on a physical device.
//  e.g., 'http://192.168.1.10:8000'
// ─────────────────────────────────────────────
export const BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─────────────────────────────────────────────
//  HEALTH
// ─────────────────────────────────────────────
export const checkHealth = () => api.get('/health');

// ─────────────────────────────────────────────
//  EMPLOYEES
// ─────────────────────────────────────────────
export const getEmployee = (empNo) => api.get(`/employees/${empNo}`);
export const getAllEmployees = () => api.get('/employees');
export const searchEmployee = (name) => api.get(`/employees/search/${name}`);
export const createEmployee = (data) => api.post('/employees', data);

// ─────────────────────────────────────────────
//  REPORTS
// ─────────────────────────────────────────────
export const getReports = (empNo = null, status = null) => {
  const params = {};
  if (empNo) params.emp_no = empNo;
  if (status) params.status = status;
  return api.get('/reports', { params });
};

export const getReportById = (id) => api.get(`/reports/${id}`);

export const createReport = (data) => api.post('/reports', data);

export const updateReportStatus = (reportId, status, updatedBy = 'employee') =>
  api.patch(`/reports/${reportId}/status`, { status, updated_by: updatedBy });

export const addTimelineEvent = (reportId, text, by = 'employee') =>
  api.post(`/reports/${reportId}/timeline`, { text, by });

// ─────────────────────────────────────────────
//  STATISTICS
// ─────────────────────────────────────────────
export const getStats = () => api.get('/stats');

// ─────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────
export const getNotifications = (empNo = null) => {
  const params = empNo ? { emp_no: empNo } : {};
  return api.get('/notifications', { params });
};

export const markNotificationRead = (notifId) =>
  api.patch(`/notifications/${notifId}/read`);

// ─────────────────────────────────────────────
//  AI CHAT
// ─────────────────────────────────────────────
export const sendChatMessage = (message, sessionId = 'default', empNo = 'guest') =>
  api.post('/chat', { message, session_id: sessionId, emp_no: empNo });

export const getChatHistory = (sessionId, limit = 50) =>
  api.get(`/chat/history/${sessionId}`, { params: { limit } });

// ─────────────────────────────────────────────
//  VOICE
// ─────────────────────────────────────────────
export const transcribeAudioBase64 = (audiob64, sessionId = 'default', empNo = 'guest') =>
  api.post('/voice/transcribe-b64', {
    audio_b64: audiob64,
    session_id: sessionId,
    emp_no: empNo,
  });

export default api;
