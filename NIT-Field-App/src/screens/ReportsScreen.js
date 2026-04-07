import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ReportsContext } from '../context/ReportsContext';

export default function ReportsScreen({ navigation }) {
  const { reports, loading, loadReports } = useContext(ReportsContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'done': return { bg: '#DCFCE7', text: '#16A34A', label: 'مكتمل' };
      case 'inprog': return { bg: '#FEF9C3', text: '#CA8A04', label: 'قيد المتابعة' };
      default: return { bg: '#FEE2E2', text: '#EF4444', label: 'مفتوح' };
    }
  };

  const renderReport = ({ item, index }) => {
    const status = getStatusStyle(item.status);
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ReportDetails', { reportId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>

        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.site}</Text>
          </View>
          <View style={styles.footerInfo}>
            <Ionicons name="pricetag" size={14} color="#64748B" />
            <Text style={styles.footerText}>{item.type === 'safety' ? 'سلامة' : 'عام'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سجل بلاغاتي</Text>
        <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color={COLORS.sky} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.sky} />
          <Text style={styles.loadingText}>جاري تحميل السجل...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.id.toString()}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>لا توجد بلاغات مسجلة حالياً.</Text>
            </View>
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
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
  
  list: { padding: 20, paddingBottom: 50 },
  card: { 
    backgroundColor: COLORS.white, padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '900' },
  dateText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },

  descText: { fontSize: 15, fontWeight: '900', color: COLORS.navy, marginBottom: 16, lineHeight: 22 },

  cardFooter: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 12 },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#64748B', fontWeight: '700' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14, color: '#94A3B8', fontWeight: '800' }
});
