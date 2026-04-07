import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MaterialsScreen() {
  const [tab, setTab] = useState('Requests');

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'Requests' && styles.tabActive]} onPress={() => setTab('Requests')}>
          <Text style={[styles.tabText, tab === 'Requests' && {color: COLORS.white}]}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'Violations' && styles.tabActive]} onPress={() => setTab('Violations')}>
          <Text style={[styles.tabText, tab === 'Violations' && {color: COLORS.white}]}>Violations</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {tab === 'Requests' ? (
          <>
            <TouchableOpacity style={styles.newBtn}>
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.newBtnText}>New Request</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.title}>100x Cement Bags</Text>
                <Text style={{color: COLORS.orange, fontWeight: 'bold'}}>PENDING</Text>
              </View>
              <Text style={styles.subtext}>Site: Riyadh North</Text>
              
              <View style={styles.pmActions}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: COLORS.green}]}>
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: COLORS.red}]}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>Missing Cables (RPT-002)</Text>
              <Text style={{color: COLORS.sky, fontWeight: 'bold'}}>IN-PROGRESS</Text>
            </View>
            <Text style={styles.subtext}>Jeddah Port • Khalid Al-Mutairi</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 16, borderBottomWidth: 1, borderColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.navy },
  tabText: { fontWeight: '600', color: COLORS.muted },
  content: { padding: 16 },
  newBtn: { flexDirection: 'row', backgroundColor: COLORS.sky, padding: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16, gap: 8 },
  newBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark },
  subtext: { color: COLORS.muted, fontSize: 14, marginBottom: 16 },
  pmActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  actionText: { color: COLORS.white, fontWeight: 'bold' }
});
