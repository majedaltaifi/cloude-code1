import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { db } from '../api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const getStatusInfo = (status) => {
  const s = (status || 'open').toLowerCase();
  switch (s) {
    case 'done': 
    case 'resolved':
    case 'closed':
        return { icon: 'checkmark-circle', color: '#16A34A', label: 'Resolved' };
    case 'inprog': 
        return { icon: 'time', color: '#CA8A04', label: 'In Progress' };
    default: 
        return { icon: 'alert-circle', color: '#EF4444', label: 'Open' };
  }
};

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get from Firestore
      const docRef = doc(db, 'reports', String(reportId));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
          setReport(snap.data());
      }
    } catch (e) {
      console.log('Error loading Firestore report detail:', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color={COLORS.sky} size="large" /></View>
  );

  const status = getStatusInfo(report?.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:8}}>
            <Ionicons name="chevron-back" size={28} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Status Process Stepper */}
        <View style={styles.stepperContainer}>
            <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: '#38BDF8' }]}>
                    <Ionicons name="document-text" size={14} color="#FFF" />
                </View>
                <View style={[styles.stepLine, { backgroundColor: (report?.status === 'inprog' || report?.status === 'done' || report?.status === 'resolved') ? '#38BDF8' : '#E2E8F0' }]} />
                <View style={[styles.stepDot, { backgroundColor: (report?.status === 'inprog' || report?.status === 'done' || report?.status === 'resolved') ? '#38BDF8' : '#E2E8F0' }]}>
                    <Ionicons name="hammer" size={14} color="#FFF" />
                </View>
                <View style={[styles.stepLine, { backgroundColor: (report?.status === 'done' || report?.status === 'resolved') ? '#16A34A' : '#E2E8F0' }]} />
                <View style={[styles.stepDot, { backgroundColor: (report?.status === 'done' || report?.status === 'resolved') ? '#16A34A' : '#E2E8F0' }]}>
                    <Ionicons name="checkmark-done" size={16} color="#FFF" />
                </View>
            </View>
            <View style={styles.stepLabels}>
                <Text style={[styles.stepText, { color: '#38BDF8' }]}>Submited</Text>
                <Text style={[styles.stepText, { color: report?.status === 'inprog' ? '#CA8A04' : '#94A3B8' }]}>Investigation</Text>
                <Text style={[styles.stepText, { color: (report?.status === 'done' || report?.status === 'resolved') ? '#16A34A' : '#94A3B8' }]}>Resolved</Text>
            </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: status.color, borderLeftWidth: 10 }]}>
            <Ionicons name={status.icon} size={30} color={status.color} />
            <View>
                <Text style={styles.statusLabel}>Ticket ID #{report?.case_num || reportId}</Text>
                <Text style={[styles.statusValue, { color: status.color }]}>{status.label}</Text>
            </View>
        </View>

        {/* Content Card */}
        <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Incident Detail</Text>
            <Text style={styles.descText}>{report?.description}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoKey}>SITE LOCATION</Text>
                    <Text style={styles.infoVal}>{report?.site || 'N/A'}</Text>
                </View>
                <View style={[styles.infoBox, { alignItems: 'flex-end' }]}>
                    <Text style={styles.infoKey}>LOGGED AT</Text>
                    <Text style={styles.infoVal}>{report?.created_at ? new Date(report?.created_at).toLocaleDateString() : '---'}</Text>
                </View>
            </View>
            
            <View style={{marginTop: 20}}>
                <Text style={styles.infoKey}>CATEGORY</Text>
                <Text style={styles.infoVal}>{(report?.type || 'General').toUpperCase()}</Text>
            </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' 
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.navy },
  scroll: { padding: 24 },
  statusCard: { 
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.white, 
    padding: 20, borderRadius: 24, marginBottom: 24
  },
  statusLabel: { fontSize: 12, color: '#64748B', fontWeight: '800' },
  statusValue: { fontSize: 20, fontWeight: '900' },
  infoCard: { backgroundColor: COLORS.white, padding: 24, borderRadius: 32, marginBottom: 32 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: COLORS.navy, marginBottom: 12, textTransform: 'uppercase' },
  descText: { fontSize: 16, fontWeight: '600', color: '#1E293B', lineHeight: 26, marginBottom: 20 },
  divider: { height: 1.5, backgroundColor: '#F1F5F9', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  infoBox: { flex: 1 },
  infoKey: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
  infoVal: { fontSize: 14, fontWeight: '900', color: COLORS.navy },
  stepperContainer: { 
    backgroundColor: COLORS.white, padding: 24, borderRadius: 24, marginBottom: 20,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  stepDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flex: 1, height: 3, marginHorizontal: 0 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  stepText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }
});
