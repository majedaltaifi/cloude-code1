import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { ReportsContext } from '../context/ReportsContext';

const TYPE_OPTIONS = [
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark', color: '#EF4444' },
  { id: 'materials', label: 'Materials', icon: 'construct', color: '#38BDF8' },
  { id: 'complaint', label: 'Complaint', icon: 'warning', color: '#F59E0B' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle', color: '#64748B' },
];

export default function NewReportScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { addReport } = useContext(ReportsContext);
  
  const [type, setType] = useState('safety');
  const [description, setDescription] = useState('');
  const [site, setSite] = useState(user?.site || 'Randa Tower');
  const [loading, setLoading] = useState(false);
  const [photoB64, setPhotoB64] = useState(null);

  const pickImage = () => {
    // Simulation: Pick a demo image (Base64)
    const demoImg = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="; // Solid white 1x1 base64
    setPhotoB64(demoImg);
    Alert.alert('Camera', 'Demo Photo Attached Successfully');
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      return Alert.alert('Attention', 'Please write a description first.');
    }

    setLoading(true);
    try {
      const result = await addReport({
        emp_no: user?.empNo || '3734',
        type,
        priority: 'Normal', // Defaulted since removed from UI
        site,
        description,
        photo_b64: photoB64,
      });

      if (result) {
        Alert.alert('Success', 'Your report has been submitted.');
        navigation.navigate('My Reports');
      } else {
        Alert.alert('Error', 'Failed to submit. Check server connection.');
      }
    } catch (e) {
      console.log('[NewReport] Submission Error:', e);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={{flex:1}}>
        
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:8}}>
                <Ionicons name="close" size={28} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Field Report</Text>
            <View style={{width: 44}} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Incident Category</Text>
          <View style={styles.typeGrid}>
            {TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity 
                key={opt.id} 
                style={[styles.typeCard, type === opt.id && { borderColor: opt.color, backgroundColor: opt.color + '10' }]}
                onPress={() => setType(opt.id)}
              >
                <Ionicons name={opt.icon} size={24} color={type === opt.id ? opt.color : '#94A3B8'} />
                <Text style={[styles.typeLabel, type === opt.id && { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Field Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.input} 
              value={site} 
              onChangeText={setSite} 
              placeholder="e.g. Dammam Warehouse" 
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.label}>Incident Description</Text>
          <TextInput 
            style={styles.textArea} 
            multiline 
            numberOfLines={6} 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Describe what happened clearly..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />

          <Text style={styles.label}>Evidence (Optional)</Text>
          <TouchableOpacity style={styles.photoBox} onPress={() => pickImage()}>
            {photoB64 ? (
                <Ionicons name="checkmark-circle" size={40} color={COLORS.sky} />
            ) : (
                <Ionicons name="camera" size={30} color="#94A3B8" />
            )}
            <Text style={styles.photoText}>{photoB64 ? 'Photo Selected & Ready' : 'Tap to Capture Photo'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitBtn, (loading || !description.trim()) && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={loading || !description.trim()}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Report Now</Text>
            )}
          </TouchableOpacity>

          <View style={{height: 100}} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' 
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.navy },
  
  scroll: { padding: 24 },
  
  label: { fontSize: 13, fontWeight: '800', color: COLORS.navy, marginBottom: 12, marginTop: 10 },
  
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  typeCard: { 
    width: '48%', padding: 18, borderRadius: 20, borderWidth: 2, borderColor: '#F1F5F9', 
    alignItems: 'center', gap: 8, backgroundColor: COLORS.white 
  },
  typeLabel: { fontSize: 13, fontWeight: '800', color: '#64748B' },


  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
    borderRadius: 16, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1.5, borderColor: '#F1F5F9' 
  },
  input: { flex: 1, padding: 16, fontSize: 15, fontWeight: '600', color: COLORS.navy },
  textArea: { 
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, height: 120, 
    borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 20, fontSize: 15, fontWeight: '600', color: COLORS.navy 
  },

  photoBox: { 
    width: '100%', height: 100, borderRadius: 20, borderStyle: 'dotted', borderWidth: 2, 
    borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginBottom: 30, gap: 8, backgroundColor: COLORS.white 
  },
  photoText: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },

  submitBtn: { 
    backgroundColor: COLORS.sky, padding: 20, borderRadius: 24, 
    alignItems: 'center', shadowColor: COLORS.sky, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginBottom: 20 
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '900' }
});
