import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ReportsContext } from '../context/ReportsContext';

export default function MyReportsScreen({ navigation }) {
  const { reports, loading, loadReports } = useContext(ReportsContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (loadReports) loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (loadReports) await loadReports();
    setRefreshing(false);
  };

  const getStatusDetail = (status) => {
    const s = (status || 'open').toLowerCase();
    switch (s) {
      case 'done': 
      case 'resolved':
      case 'closed':
           return { label: 'Resolved', color: '#22C55E', bg: '#DCFCE7' };
      case 'inprog': 
           return { label: 'In Progress', color: '#EAB308', bg: '#FEF9C3' };
      default: 
           return { label: 'Open', color: '#EF4444', bg: '#FEE2E2' };
    }
  };

  const renderReport = ({ item }) => {
    const status = getStatusDetail(item.status);
    const displayId = item.case_num || item.id;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.ticketId}>#{displayId}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.site || 'N/A'}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '---'}</Text>
          </View>
          {(item.priority === 'Critical' || item.priority === 'High' || item.priority === 'hi') && (
             <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>URGENT</Text>
             </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incident History</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={COLORS.sky} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.sky} size="large" /></View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id.toString()}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.sky]} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Reports Found</Text>
              <Text style={styles.emptySubtitle}>Your submitted reports will appear here.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' 
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.navy },
  refreshBtn: { padding: 8 },
  list: { padding: 16, paddingBottom: 100 },
  card: { 
    backgroundColor: COLORS.white, padding: 16, borderRadius: 24, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  ticketId: { fontSize: 12, color: '#94A3B8', fontWeight: '800' },
  description: { fontSize: 15, fontWeight: '800', color: COLORS.navy, marginBottom: 16, lineHeight: 22 },
  cardFooter: { flexDirection: 'row', gap: 16, alignItems: 'center', borderTopWidth: 1.5, borderTopColor: '#F8FAFC', paddingTop: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  urgentBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  urgentText: { color: '#EF4444', fontSize: 10, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: COLORS.navy, marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '600', marginTop: 4 }
});
