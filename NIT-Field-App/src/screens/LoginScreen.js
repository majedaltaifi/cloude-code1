import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [empNo, setEmpNo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!empNo) return;
    setLoading(true);
    try {
      await login(empNo);
    } catch (e) {
      console.log('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
                <Ionicons name="shield-checkmark" size={60} color={COLORS.sky} />
            </View>
            <Text style={styles.brandName}>NIT FIELD</Text>
            <Text style={styles.brandTagline}>Field Monitoring & Reporting System</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Employee ID</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="Enter your ID (e.g. 3734)"
                value={empNo}
                onChangeText={setEmpNo}
                keyboardType="numeric"
                autoFocus={false}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, (!empNo || loading) && { opacity: 0.6 }]} 
              onPress={handleLogin}
              disabled={!empNo || loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Access System</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.guestLink}>
                <Text style={styles.guestText}>Login issues? Contact IT Support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 2.0.4 - Premium Built (EN)</Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 32, justifyContent: 'center' },
  
  logoContainer: { alignItems: 'center', marginBottom: 60 },
  logoCircle: { 
    width: 120, height: 120, borderRadius: 35, backgroundColor: COLORS.white, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: COLORS.sky, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
  },
  brandName: { fontSize: 32, fontWeight: '900', color: COLORS.navy, letterSpacing: 2 },
  brandTagline: { fontSize: 14, color: '#64748B', fontWeight: '800', marginTop: 8 },

  formCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 32, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 3 },
  label: { fontSize: 15, fontWeight: '900', color: COLORS.navy, marginBottom: 16 },
  inputBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', 
    borderRadius: 20, paddingHorizontal: 20, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 24 
  },
  input: { flex: 1, padding: 18, fontSize: 16, fontWeight: '900', color: COLORS.navy },
  
  loginBtn: { 
    backgroundColor: COLORS.sky, padding: 20, borderRadius: 24, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10,
    shadowColor: COLORS.sky, shadowOpacity: 0.3, shadowRadius: 15, elevation: 4
  },
  loginBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '900' },
  
  guestLink: { marginTop: 24, alignSelf: 'center' },
  guestText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },

  footer: { position: 'absolute', bottom: 40, left: 32, right: 32, alignItems: 'center' },
  footerText: { color: '#CBD5E1', fontSize: 12, fontWeight: '800', letterSpacing: 1 }
});
