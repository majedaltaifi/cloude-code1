import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { ReportsContext } from '../context/ReportsContext';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { reports, loadReports } = useContext(ReportsContext);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadReports();
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const myReportsCount = reports.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.nitLogo}>NIT</Text>
          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>{user?.name_en?.charAt(0) || 'M'}</Text>
          </View>
        </View>

        {/* Employee Identity Card - ENGLISH VERSION */}
        <View style={styles.empInfoBar}>
          <View style={styles.empInfoLine}>
            <Text style={styles.empLabel}>NAME:</Text>
            <Text style={styles.empVal}>{user?.name_en || 'Majed Al-Taifi'}</Text>
          </View>
          <View style={styles.empInfoLine}>
            <Text style={styles.empLabel}>SITE:</Text>
            <Text style={styles.empVal}>Randa Tower</Text>
          </View>
          <View style={styles.empInfoLine}>
            <Text style={styles.empLabel}>EMP NO:</Text>
            <Text style={styles.empVal}>3734</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.mainActionBtn} 
          onPress={() => navigation.navigate('NewReport')}
        >
          <Ionicons name="add-circle" size={28} color={COLORS.sky} />
          <Text style={styles.mainActionText}>Create New Field Report</Text>
        </TouchableOpacity>

        {/* Stats Section */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{myReportsCount}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
            <Ionicons name="document-text" size={40} color={COLORS.sky} style={styles.statIcon} />
          </View>
          <View style={[styles.statCard, { borderRightWidth: 4, borderRightColor: COLORS.sky }]}>
            <Text style={styles.statVal}>0</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
            <Ionicons name="flash" size={40} color="#F59E0B" style={styles.statIcon} />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Access Hub</Text>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('NewReport')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="add-circle" size={28} color={COLORS.sky} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Submit Fast Report</Text>
            <Text style={styles.actionDesc}>Report safety or materials incident</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="list" size={28} color={COLORS.navy} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>My Reports Log</Text>
            <Text style={styles.actionDesc}>Track status of your submissions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingBottom: 50 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 24, paddingTop: 60, backgroundColor: COLORS.white 
  },
  nitLogo: { fontSize: 28, fontWeight: '900', color: COLORS.navy, letterSpacing: 2 },
  profileCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.sky, alignItems: 'center', justifyContent: 'center' },

  mainActionBtn: { 
    backgroundColor: COLORS.white, margin: 20, marginTop: 0, padding: 20, borderRadius: 24,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#F1F5F9'
  },
  mainActionText: { fontSize: 16, fontWeight: '900', color: COLORS.navy },
  
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  statCard: { 
    flex: 1, backgroundColor: COLORS.white, padding: 16, borderRadius: 24, 
    borderWidth: 1.5, borderColor: '#F1F5F9', position: 'relative', overflow: 'hidden' 
  },
  statVal: { fontSize: 32, fontWeight: '900', color: COLORS.navy },
  statLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginTop: 4 },
  statIcon: { position: 'absolute', bottom: -15, left: -15, opacity: 0.05 },

  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.navy, marginBottom: 16 },

  actionCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
    padding: 20, borderRadius: 24, marginBottom: 16, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8,
    elevation: 1
  },
  iconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1, marginRight: 16 },
  actionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.navy, marginBottom: 2 },
  actionDesc: { fontSize: 12, color: '#94A3B8', fontWeight: '600' }
});
