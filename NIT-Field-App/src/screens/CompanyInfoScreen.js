import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

export default function CompanyInfoScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Company Info & Rules</Text>
      
      <View style={styles.card}>
        <Text style={styles.title}>About NIT</Text>
        <Text style={styles.text}>Nesma Infrastructure & Technology (NIT) is a leading provider of comprehensive infrastructure and contracting solutions in Saudi Arabia.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Reporting Policies & Confidentiality</Text>
        <Text style={styles.text}>1. All submitted reports are treated with strict confidentiality to ensure employee privacy.</Text>
        <Text style={styles.text}>2. Submitting false or malicious reports is strictly prohibited and subject to disciplinary action.</Text>
        <Text style={styles.text}>3. Reports will be reviewed by the respective department within 24 hours of submission.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginBottom: 20 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.navy, marginBottom: 12 },
  text: { fontSize: 15, color: COLORS.dark, lineHeight: 24, marginBottom: 8 }
});
