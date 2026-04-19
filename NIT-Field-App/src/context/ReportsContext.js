/**
 * ReportsContext.js — NIT Field App (Cloud Edition)
 * Manages reports directly via Firebase Firestore.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { db } from '../api/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  orderBy 
} from 'firebase/firestore';
import { AuthContext } from './AuthContext';

export const ReportsContext = createContext();

export const ReportsProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Real-time Cloud Sync
  useEffect(() => {
    if (!user?.empNo) {
        setLoading(false);
        return;
    }

    // Query for reports where I am either the explicit ID or the creator_id
    // Note: Standard Firestore listener. 
    // For 2500 users, we rely on the efficient query on creator_id.
    const q = query(
      collection(db, 'reports'),
      where('creator_id', '==', String(user.empNo))
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Sort client-side
      const sorted = data.sort((a,b) => {
          const da = a.created_at ? new Date(a.created_at) : new Date(0);
          const db = b.created_at ? new Date(b.created_at) : new Date(0);
          return db - da;
      });
      
      setReports(sorted);
      setLoading(false);
    }, (err) => {
      console.log('[ReportsContext] Firestore Sync Error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.empNo]);

  /**
   * Submit a new report to Firestore.
   */
  const addReport = async (reportData) => {
    const num = Math.floor(Math.random() * 900000) + 100000;
    const isAnon = reportData.isAnonymous || false;
    
    const payload = {
      emp_no: isAnon ? 'Anonymous' : String(user?.empNo || '3734'),
      creator_id: String(user?.empNo || '3734'),
      case_num: num,
      type: reportData.type || 'other',
      priority: reportData.priority || 'Medium',
      site: reportData.site || 'Randa Tower',
      branch: reportData.branch || 'Generic',
      description: reportData.description || 'No description provided',
      photo_b64: reportData.photo_b64 || null,
      status: 'open',
      created_at: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'reports', String(num)), payload);
      return { id: num, ...payload };
    } catch (err) {
      console.log('[ReportsContext] Create error:', err.message);
      throw err;
    }
  };

  const loadReports = () => {
      // Real-time listener handles this now
  };

  return (
    <ReportsContext.Provider value={{ reports, loading, addReport, loadReports }}>
      {children}
    </ReportsContext.Provider>
  );
};
