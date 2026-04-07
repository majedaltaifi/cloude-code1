import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SITES } from '../constants/sites';

export default function SitesScreen({ navigation }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Reports', { site: item.label })}
        >
            <View style={styles.iconBox}>
                <Ionicons name="location-sharp" size={24} color={COLORS.sky} />
            </View>
            <View style={styles.info}>
                <Text style={styles.title}>{item.label}</Text>
                <Text style={styles.desc}>موقع ميداني مسجل - NIT</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#CBD5E1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={COLORS.navy} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>دليل المواقع الميدانية</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={SITES}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
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
    
    list: { padding: 20 },
    card: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, 
        padding: 20, borderRadius: 24, marginBottom: 12, elevation: 1,
        shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10,
        borderWidth: 1.5, borderColor: '#F1F5F9'
    },
    iconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginRight: 0, marginLeft: 16 },
    info: { flex: 1 },
    title: { fontSize: 15, fontWeight: '900', color: COLORS.navy },
    desc: { fontSize: 11, color: '#94A3B8', fontWeight: '700', marginTop: 4 }
});
