/**
 * AuthContext.js — NIT Field App
 * Handles employee login via employee number against the backend API.
 */
import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getEmployee } from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginState();
  }, []);

  // Restore session from storage on app start
  const checkLoginState = async () => {
    try {
      let storedUser = null;
      if (Platform.OS === 'web') {
          storedUser = localStorage.getItem('nit_user_session_v3');
      } else {
          storedUser = await SecureStore.getItemAsync('nit_user_session_v3');
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('[Auth] Failed to restore session:', e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with an employee number.
   * Fetches employee data from backend and stores the session.
   */
  const login = async (empNo = '1001') => {
    try {
      const res = await getEmployee(empNo);
      const emp = res.data.employee;

      const sessionData = {
        empNo: emp.emp_no,
        name: emp.name_ar,
        nameEn: emp.name_en || emp.name_ar,
        role: emp.role,
        site: emp.site,
        department: emp.department,
        employeeId: emp.emp_no,
      };

      await SecureStore.setItemAsync('nit_user_session_v3', JSON.stringify(sessionData));
      setUser(sessionData);
    } catch (err) {
      console.log('[Auth] Login error:', err?.response?.data || err.message);
      // Fallback: if backend is offline, use a default demo user
      const fallback = {
        empNo: empNo,
        name: 'موظف NIT',
        nameEn: 'NIT Employee',
        role: 'field',
        site: 'المشروع الرئيسي',
        department: 'العمليات',
        employeeId: empNo,
      };
      await SecureStore.setItemAsync('nit_user_session_v3', JSON.stringify(fallback));
      setUser(fallback);
      Alert.alert(
        'وضع تجريبي',
        'تعذّر الاتصال بالخادم. تم تسجيل الدخول في وضع المعاينة.',
        [{ text: 'حسناً' }]
      );
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('nit_user_session_v3');
    } catch (e) {
      console.log('[Auth] Logout error:', e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
