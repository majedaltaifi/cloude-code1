import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Notification Routing Settings</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>Global HR Email</Text>
        <TextInput style={styles.input} value="hr@nit.com.sa" editable={false} />
        
        <Text style={styles.label}>WhatsApp Alert Number (+966)</Text>
        <TextInput style={styles.input} value="500000000" editable={false} />
      </View>

      <Text style={styles.sectionTitle}>Routing Rules</Text>
      <View style={styles.card}>
        {['Safety: HSE + HR', 'Materials: PM + HR', 'Urgent: PM + HR'].map((r, i) => (
          <View key={i} style={styles.ruleRow}>
            <Ionicons name="git-merge" size={16} color={COLORS.muted} />
            <Text style={styles.ruleText}>{r}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite, padding: 16 },
  sectionTitle: { fontSize: 16, color: COLORS.navy, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, backgroundColor: '#FAFAFA', marginBottom: 16, color: COLORS.dark },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  ruleText: { fontSize: 14, color: COLORS.dark, fontWeight: '500' },
  saveBtn: { backgroundColor: COLORS.sky, padding: 16, borderRadius: 8, alignItems: 'center' },
  saveText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});
