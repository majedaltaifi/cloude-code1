import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { checkEmployeeStatus, loginWithPassword, activateAccount, resetPassword } = useContext(AuthContext);
  
  const [step, setStep] = useState(1); // 1: ID, 2: Password, 3: Set New Password
  const [empNo, setEmpNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureMode, setSecureMode] = useState(true);
  const [empData, setEmpData] = useState(null);

  const handleNext = async () => {
    if (!empNo) return;
    setLoading(true);
    try {
      const status = await checkEmployeeStatus(empNo);
      if (status.exists) {
        setEmpData(status);
        if (status.hasPassword) {
          setStep(2); // Ask for password
        } else {
          setStep(3); // First time - set password
        }
      } else {
        Alert.alert('Not Found', 'This Employee ID is not registered in our records.');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithPassword(empNo, password);
    } catch (e) {
      Alert.alert('Access Denied', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async () => {
    if (password.length < 6) return Alert.alert('Weak Password', 'Password must be at least 6 characters.');
    if (password !== confirmPass) return Alert.alert('Mismatch', 'Passwords do not match.');
    
    setLoading(true);
    try {
      await activateAccount(empNo, password);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{ flex: 1 }}>
        <View style={styles.content}>
          
          <View style={styles.headerArea}>
              <View style={styles.logoCircle}>
                  <Ionicons name="shield-checkmark" size={40} color={COLORS.sky} />
              </View>
              <Text style={styles.title}>NIT REPORT</Text>
              <Text style={styles.subtitle}>Field Security & Safety Portal</Text>
          </View>

          <View style={styles.card}>
            {step === 1 && (
              <View>
                <Text style={styles.label}>Enter Employee ID</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person" size={18} color="#94A3B8" />
                  <TextInput 
                    style={styles.input} 
                    value={empNo} 
                    onChangeText={setEmpNo} 
                    placeholder="e.g. 1001" 
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Continuar / متابعة</Text>}
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.label}>Welcome back, {empData?.data?.name_ar || 'Employee'}</Text>
                <Text style={styles.subText}>Please enter your password</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                  <TextInput 
                    style={styles.input} 
                    value={password} 
                    onChangeText={setPassword} 
                    placeholder="Password" 
                    secureTextEntry={secureMode}
                  />
                  <TouchableOpacity onPress={() => setSecureMode(!secureMode)}>
                      <Ionicons name={secureMode ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Login / دخول</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotBtn} onPress={() => resetPassword(empNo)}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backLink} onPress={() => setStep(1)}><Text style={styles.backText}>← Change ID</Text></TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.label}>Account Activation</Text>
                <Text style={styles.subText}>Set a password for your account</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="key" size={18} color="#94A3B8" />
                  <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="New Password" secureTextEntry={secureMode}/>
                </View>
                <View style={styles.inputBox}>
                  <Ionicons name="checkmark-done" size={18} color="#94A3B8" />
                  <TextInput style={styles.input} value={confirmPass} onChangeText={setConfirmPass} placeholder="Confirm Password" secureTextEntry={secureMode}/>
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleActivation} disabled={loading}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Activate Account</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  headerArea: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, backgroundColor: '#FFF', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 15, elevation: 5 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.navy, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 5 },
  card: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 16, fontWeight: '900', color: COLORS.navy, marginBottom: 8 },
  subText: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, padding: 15, fontSize: 15, fontWeight: '700', color: COLORS.navy },
  primaryBtn: { backgroundColor: COLORS.sky, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  forgotBtn: { marginTop: 20, alignItems: 'center' },
  forgotText: { color: COLORS.sky, fontSize: 13, fontWeight: '800' },
  backLink: { marginTop: 25, alignItems: 'center' },
  backText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' }
});
