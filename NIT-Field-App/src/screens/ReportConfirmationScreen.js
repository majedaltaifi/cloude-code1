import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function ReportConfirmationScreen({ navigation }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.content}>
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="checkmark-done-circle" size={100} color={COLORS.success} />
                </Animated.View>

                <Text style={styles.title}>تم استلام بلاغك بنجاح</Text>
                <Text style={styles.desc}>يمكنك الآن متابعة حالة البلاغ من خلال سجل "بلاغاتي" في الشاشة الرئيسية.</Text>

                <TouchableOpacity 
                    style={styles.doneBtn} 
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.doneBtnText}>العودة للرئيسية</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.ghostBtn} 
                    onPress={() => navigation.navigate('Reports')}
                >
                    <Text style={styles.ghostBtnText}>عرض بلاغاتي</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Ionicons name="shield-checkmark" size={24} color="#CBD5E1" />
                <Text style={styles.footerText}>نظام NIT الميداني - توثيق آمن</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    
    iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    
    title: { fontSize: 24, fontWeight: '900', color: COLORS.navy, marginBottom: 16, textAlign: 'center' },
    desc: { fontSize: 15, color: '#64748B', fontWeight: '600', textAlign: 'center', lineHeight: 24, marginBottom: 40 },

    doneBtn: { 
        backgroundColor: COLORS.sky, width: '100%', padding: 20, borderRadius: 24, 
        alignItems: 'center', shadowColor: COLORS.sky, shadowOpacity: 0.2, shadowRadius: 10, elevation: 2, marginBottom: 16 
    },
    doneBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '900' },

    ghostBtn: { padding: 16 },
    ghostBtnText: { color: COLORS.sky, fontSize: 14, fontWeight: '900' },

    footer: { position: 'absolute', bottom: 40, left: 32, right: 32, alignItems: 'center', gap: 8 },
    footerText: { fontSize: 11, color: '#CBD5E1', fontWeight: '800' }
});
