import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { getNotifications, markRead } from '../api/apiClient';

export default function NotificationsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications(user?.empNo);
      setNotifications(res.data || []);
    } catch (e) {
      console.log('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id, reportId) => {
    try {
      await markRead(id);
      loadNotifications();
      if (reportId) {
        navigation.navigate('ReportDetail', { reportId });
      }
    } catch (e) {
      console.log('Error marking read');
    }
  };

  const renderNotif = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, item.is_read === 0 && styles.unreadCard]} 
      onPress={() => handleRead(item.id, item.report_id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: item.ntype === 'success' ? '#DCFCE7' : '#F1F5F9' }]}>
        <Ionicons name={item.ntype === 'success' ? 'checkmark-circle' : 'notifications'} size={24} color={item.ntype === 'success' ? '#16A34A' : COLORS.sky} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, item.is_read === 0 && { fontWeight: '900' }]}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
      </View>
      {item.is_read === 0 && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التنبيهات</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.sky} size="large" /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderNotif}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>لا توجد تنبيهات جديدة.</Text>
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
  
  list: { padding: 16, paddingBottom: 50 },
  card: { 
    flexDirection: 'row', backgroundColor: COLORS.white, padding: 16, borderRadius: 24, 
    marginBottom: 12, alignItems: 'center', gap: 16, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 1
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: COLORS.sky },
  iconWrap: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  body: { fontSize: 12, color: '#64748B', fontWeight: '600', lineHeight: 18 },
  time: { fontSize: 10, color: '#94A3B8', marginTop: 6, fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.sky },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14, color: '#94A3B8', fontWeight: '800' }
});
