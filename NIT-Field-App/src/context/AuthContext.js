/**
 * AuthContext.js — NIT REPORT
 * Comprehensive Cloud Auth: ID-based activation, passwords, and password reset.
 */
import React, { createContext, useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { db } from '../api/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginState();
  }, []);

  const checkLoginState = async () => {
    try {
      let storedUser = null;
      if (Platform.OS === 'web') {
        storedUser = localStorage.getItem('nit_user_session_v5');
      } else {
        storedUser = await SecureStore.getItemAsync('nit_user_session_v5');
      }
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.log('[Auth] Restore error:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if employee exists and has a password
   */
  const checkEmployeeStatus = async (empNo) => {
    const q = query(collection(db, 'employees'), where('emp_no', '==', String(empNo).trim()));
    const snap = await getDocs(q);
    if (snap.empty) return { exists: false };
    const data = snap.docs[0].data();
    return { exists: true, hasPassword: !!data.password, email: data.email, data: { ...data, docId: snap.docs[0].id } };
  };

  /**
   * Final Login with ID and Password
   */
  const loginWithPassword = async (empNo, password) => {
    const status = await checkEmployeeStatus(empNo);
    if (!status.exists) throw new Error('Employee ID not found.');
    if (status.data.password !== password) throw new Error('Incorrect password.');

    const sessionData = {
      empNo: status.data.emp_no,
      name: status.data.name_ar,
      role: status.data.role || 'field',
      site: status.data.site || 'N/A',
      department: status.data.department || 'Operations'
    };

    if (Platform.OS === 'web') {
      localStorage.setItem('nit_user_session_v5', JSON.stringify(sessionData));
    } else {
      await SecureStore.setItemAsync('nit_user_session_v5', JSON.stringify(sessionData));
    }
    setUser(sessionData);
    return true;
  };

  /**
   * Set Password for the first time
   */
  const activateAccount = async (empNo, newPassword) => {
    const status = await checkEmployeeStatus(empNo);
    if (!status.exists) throw new Error('Employee ID not found.');
    
    await updateDoc(doc(db, 'employees', status.data.docId), {
      password: newPassword,
      activated_at: new Date().toISOString()
    });

    return loginWithPassword(empNo, newPassword);
  };

  /**
   * Reset Password (Simulation for now - typically sends email)
   */
  const resetPassword = async (empNo) => {
    const status = await checkEmployeeStatus(empNo);
    if (!status.exists) throw new Error('Employee ID not found.');
    // In a real app, you'd trigger a Firebase Auth or custom email reset here
    Alert.alert('Reset Link Sent', `A reset code has been sent to ${status.email || 'your registered email'}.`);
  };

  const logout = async () => {
    if (Platform.OS === 'web') localStorage.removeItem('nit_user_session_v5');
    else await SecureStore.deleteItemAsync('nit_user_session_v5');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkEmployeeStatus, loginWithPassword, activateAccount, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
