import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

export default function SupportScreen() {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.nameEn || '',
    mobile: '05',
    email: '',
    subject: '',
    details: ''
  });

  const handleSubmit = () => {
    if (!formData.subject || !formData.details) {
      Alert.alert('Required', 'Please enter subject and message details.');
      return;
    }
    Alert.alert('Success', 'Your support request has been submitted. We will contact you soon.');
    setFormData({ ...formData, subject: '', details: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.card}>
            <View style={styles.iconCircle}>
                <Ionicons name="headset" size={40} color={COLORS.sky} />
            </View>
            <Text style={styles.title}>NIT Support Hub</Text>
            <Text style={styles.desc}>Need help? Fill the form below and our technical team will contact you within 24 hours.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
                style={styles.input} 
                value={formData.name} 
                onChangeText={(t) => setFormData({...formData, name: t})} 
                placeholder="Enter your name"
            />

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput 
                style={styles.input} 
                value={formData.mobile} 
                keyboardType="phone-pad"
                onChangeText={(t) => setFormData({...formData, mobile: t})} 
                placeholder="05xxxxxxxx"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput 
                style={styles.input} 
                value={formData.email} 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(t) => setFormData({...formData, email: t})} 
                placeholder="name@nit.com"
            />

            <Text style={styles.label}>Message Subject</Text>
            <TextInput 
                style={styles.input} 
                value={formData.subject} 
                onChangeText={(t) => setFormData({...formData, subject: t})} 
                placeholder="Title of your issue"
            />

            <Text style={styles.label}>Message Details</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                value={formData.details} 
                multiline 
                numberOfLines={5}
                onChangeText={(t) => setFormData({...formData, details: t})} 
                placeholder="Describe your request in detail..."
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit Support Request</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, paddingBottom: 100 },
  card: { alignItems: 'center', marginBottom: 25 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900', color: COLORS.navy },
  desc: { fontSize: 13, color: '#64748B', textAlign: 'center', fontWeight: '700', marginTop: 8, paddingHorizontal: 20 },
  form: { gap: 15 },
  label: { fontSize: 13, fontWeight: '900', color: COLORS.navy, marginLeft: 5 },
  input: { backgroundColor: COLORS.white, padding: 18, borderRadius: 18, borderWidth: 1.5, borderColor: '#F1F5F9', fontWeight: '800', fontSize: 15 },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: COLORS.sky, padding: 20, borderRadius: 22, alignItems: 'center', marginTop: 15, shadowColor: COLORS.sky, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 10 },
  submitText: { color: COLORS.white, fontWeight: '900', fontSize: 16 }
});
