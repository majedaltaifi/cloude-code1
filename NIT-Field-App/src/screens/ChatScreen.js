import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import * as Speech from 'expo-speech';
import { sendChatMessage } from '../api/apiClient';

export default function ChatScreen() {
  const [status, setStatus] = useState('جاهز لسماعك');
  const [loading, setLoading] = useState(false);
  const [pulse] = useState(new Animated.Value(1));
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.3, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [loading]);

  const handleVoicePress = async () => {
    setLoading(true);
    setStatus('جاري الاستماع...');
    setReply('');

    // Simulated Speech-to-Text interaction for demonstration
    // On real device, implement expo-av recording here
    setTimeout(async () => {
        setStatus('جاري المعالجة مع الذكاء الاصطناعي...');
        try {
            const res = await sendChatMessage("ما هي حالة بلاغاتي الأخيرة؟", "voice-session", "1452");
            const aiText = res.data.reply;
            setReply(aiText);
            setStatus('جاهز لسماعك');
            
            // Text to Speech
            Speech.speak(aiText, { language: 'ar-SA', pitch: 1.0, rate: 0.95 });
        } catch (e) {
            setStatus('خطأ في الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        
        <View style={styles.centerBox}>
            <View style={styles.aiHeader}>
                <Ionicons name="sparkles" size={36} color={COLORS.sky} />
                <Text style={styles.aiTitle}>المساعد الذكي NIT</Text>
                <Text style={styles.aiSubtitle}>تحدث معي للاستعلام عن أي شيء في الميدان</Text>
            </View>

            <View style={styles.micContainer}>
                <Animated.View style={[styles.micCircle, { transform: [{ scale: pulse }] }]}>
                    <TouchableOpacity 
                        style={[styles.micBtn, loading && { backgroundColor: '#EF4444' }]} 
                        onPress={handleVoicePress}
                        disabled={loading}
                    >
                        <Ionicons name={loading ? "pulse" : "mic"} size={50} color={COLORS.white} />
                    </TouchableOpacity>
                </Animated.View>
                <Text style={styles.statusText}>{status}</Text>
            </View>

            {reply && (
                <View style={styles.replyBox}>
                    <Text style={styles.replyTitle}>الرد الذكي:</Text>
                    <Text style={styles.replyText}>{reply}</Text>
                </View>
            )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 30 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  
  aiHeader: { alignItems: 'center', marginBottom: 40 },
  aiTitle: { fontSize: 24, fontWeight: '900', color: COLORS.navy, marginTop: 12 },
  aiSubtitle: { fontSize: 13, color: '#94A3B8', fontWeight: '800', textAlign: 'center', marginTop: 4 },

  micContainer: { alignItems: 'center', marginVertical: 40 },
  micCircle: { padding: 10 },
  micBtn: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.sky, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.sky, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10
  },
  statusText: { fontSize: 15, fontWeight: '900', color: COLORS.navy, marginTop: 24 },

  replyBox: { 
    backgroundColor: COLORS.white, padding: 24, borderRadius: 24, width: '100%',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1.5, borderColor: '#F1F5F9'
  },
  replyTitle: { fontSize: 12, fontWeight: '900', color: COLORS.sky, marginBottom: 8 },
  replyText: { fontSize: 16, fontWeight: '800', color: COLORS.navy, lineHeight: 24 },

  hints: { marginTop: 'auto', marginBottom: 20 },
  hintTitle: { fontSize: 12, color: '#94A3B8', fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  hint: { fontSize: 12, color: COLORS.navy, fontWeight: '700', textAlign: 'center', marginBottom: 6, opacity: 0.7 }
});
