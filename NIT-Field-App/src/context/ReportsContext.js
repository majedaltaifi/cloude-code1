/**
 * ReportsContext.js — NIT Field App
 * Manages reports via the backend API with local offline queue support.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { NetworkContext } from './NetworkContext';
import { AuthContext } from './AuthContext';
import { getReports, createReport as apiCreateReport } from '../api/apiClient';

export const ReportsContext = createContext();

const OFFLINE_QUEUE_KEY = 'nit_offline_queue_v1';

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isOffline } = useContext(NetworkContext);
  const { user } = useContext(AuthContext);

  // Load reports from backend whenever user is set and we're online
  useEffect(() => {
    if (user?.empNo) {
      loadReports();
    }
  }, [user?.empNo]);

  // When coming back online, sync the offline queue
  useEffect(() => {
    if (!isOffline && user?.empNo) {
      syncOfflineQueue();
    }
  }, [isOffline]);

  /**
   * Fetch reports from backend. Falls back to cached local data if offline.
   */
  const loadReports = useCallback(async () => {
    if (isOffline) {
      // Load from local cache
      try {
        const cached = await AsyncStorage.getItem('nit_reports_cache_v1');
        if (cached) setReports(JSON.parse(cached));
      } catch (e) {
        console.log('[Reports] Cache load error:', e);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await getReports(user?.empNo);
      const data = res.data.reports || [];
      setReports(data);
      // Cache locally for offline use
      await AsyncStorage.setItem('nit_reports_cache_v1', JSON.stringify(data));
    } catch (err) {
      console.log('[Reports] Fetch error:', err?.response?.data || err.message);
      // Fallback to cache
      try {
        const cached = await AsyncStorage.getItem('nit_reports_cache_v1');
        if (cached) setReports(JSON.parse(cached));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  }, [user?.empNo, isOffline]);

  /**
   * Submit a new report. If offline, queue it locally.
   */
  const addReport = async (reportData) => {
    // Map priorities to short keys for backend (low, med, hi)
    const pKey = reportData.priority === 'High' ? 'hi' : (reportData.priority === 'Low' || reportData.priority === 'Normal') ? 'low' : 'med';
    
    const payload = {
      emp_no: user?.empNo || '3734',
      type: reportData.type || 'other',
      priority: pKey,
      site: reportData.site || 'Randa Tower',
      description: reportData.description || 'No description provided',
      photo_b64: reportData.photo_b64 || null,
    };

    if (isOffline) {
      // Save to offline queue
      const localReport = {
        ...payload,
        id: `offline-${Date.now()}`,
        ticket_no: `OFFLINE-${Date.now()}`,
        status: 'pending_sync',
        created_at: new Date().toISOString(),
        title: reportData.title,
      };
      const updatedReports = [localReport, ...reports];
      setReports(updatedReports);
      await AsyncStorage.setItem('nit_reports_cache_v1', JSON.stringify(updatedReports));

      // Store in offline queue for later sync
      const queue = JSON.parse((await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)) || '[]');
      queue.push(payload);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));

      return localReport;
    }

    // Online: submit directly to backend
    try {
      const res = await apiCreateReport(payload);
      const newReport = res.data;
      const updatedReports = [newReport, ...reports];
      setReports(updatedReports);
      await AsyncStorage.setItem('nit_reports_cache_v1', JSON.stringify(updatedReports));
      return newReport;
    } catch (err) {
      console.log('[Reports] Create error:', err?.response?.data || err.message);
      throw err;
    }
  };

  /**
   * Sync any reports that were submitted while offline.
   */
  const syncOfflineQueue = async () => {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = JSON.parse(raw || '[]');
      if (queue.length === 0) return;

      let synced = 0;
      for (const payload of queue) {
        try {
          await apiCreateReport(payload);
          synced++;
        } catch (e) {
          console.log('[Reports] Sync failed for item:', e);
        }
      }

      // Clear queue and refresh
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      if (synced > 0) {
        Alert.alert('تمت المزامنة', `تم رفع ${synced} بلاغ كان محفوظاً بدون اتصال.`);
        loadReports();
      }
    } catch (e) {
      console.log('[Reports] Sync queue error:', e);
    }
  };

  return (
    <ReportsContext.Provider value={{ reports, loading, addReport, loadReports }}>
      {children}
    </ReportsContext.Provider>
  );
};
