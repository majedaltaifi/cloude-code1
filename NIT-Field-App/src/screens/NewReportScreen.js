import React, { useState, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';
import { ReportsContext } from '../context/ReportsContext';
import { ISSUE_HIERARCHY, PRIORITIES, FREQUENCIES } from '../constants/issueTypes';

export default function NewReportScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { addReport } = useContext(ReportsContext);
  
  // Step Tracking
  const [step, setStep] = useState(1);

  // Form State
  const [location, setLocation] = useState('SITE'); // SITE, OFFICE, ACCOMMODATION
  const [category, setCategory] = useState('Safety'); // Safety, Service
  const [subIssue, setSubIssue] = useState('');
  const [detailIssue, setDetailIssue] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [frequency, setFrequency] = useState('Rarely');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoB64, setPhotoB64] = useState(null);
  const [loading, setLoading] = useState(false);

  // Derived Options
  const subIssueOptions = useMemo(() => {
    return Object.keys(ISSUE_HIERARCHY[location][category] || {});
  }, [location, category]);

  const detailOptions = useMemo(() => {
    if (!subIssue) return [];
    return ISSUE_HIERARCHY[location][category][subIssue] || [];
  }, [location, category, subIssue]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addReport({
        location,
        category,
        sub_issue: subIssue,
        detail_issue: detailIssue,
        priority,
        frequency,
        description,
        isAnonymous,
        photo_b64: photoB64,
        site: location, // User's logical site context
        branch: 'Field Observation'
      });

      Alert.alert('Success', 'Report submitted successfully to the cloud.');
      navigation.navigate('My Reports');
    } catch (e) {
      Alert.alert('Error', 'Submission failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.label}>1. Select Work Environment</Text>
      <View style={styles.grid}>
        {['SITE', 'OFFICE', 'ACCOMMODATION'].map(loc => (
          <TouchableOpacity 
            key={loc} 
            style={[styles.choiceCard, location === loc && styles.activeCard]}
            onPress={() => { setLocation(loc); setSubIssue(''); setDetailIssue(''); }}
          >
            <Ionicons name={loc === 'SITE' ? 'construct' : loc === 'OFFICE' ? 'business' : 'home'} size={24} color={location === loc ? COLORS.white : COLORS.navy} />
            <Text style={[styles.choiceLabel, location === loc && {color: COLORS.white}]}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>2. Category of Issue</Text>
      <View style={styles.row}>
        {['Safety', 'Service'].map(cat => (
          <TouchableOpacity 
            key={cat} 
            style={[styles.smallCard, category === cat && styles.activeCard]}
            onPress={() => { setCategory(cat); setSubIssue(''); setDetailIssue(''); }}
          >
            <Text style={[styles.choiceLabel, category === cat && {color: COLORS.white}]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
        <Text style={styles.nextBtnText}>Next Step</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.label}>3. Sub-Issue Type ({category})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
          {subIssueOptions.map(opt => (
            <TouchableOpacity 
                key={opt} 
                style={[styles.chip, subIssue === opt && styles.activeChip]}
                onPress={() => { setSubIssue(opt); setDetailIssue(''); }}
            >
                <Text style={[styles.chipText, subIssue === opt && {color: '#FFF'}]}>{opt}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      {subIssue ? (
          <>
            <Text style={styles.label}>4. Specific Detail</Text>
            <View style={styles.detailList}>
                {detailOptions.map(opt => (
                    <TouchableOpacity 
                        key={opt} 
                        style={[styles.detailItem, detailIssue === opt && styles.activeDetail]}
                        onPress={() => setDetailIssue(opt)}
                    >
                        <Text style={[styles.detailText, detailIssue === opt && {color: '#FFF'}]}>{opt}</Text>
                        {detailIssue === opt && <Ionicons name="checkmark-circle" size={18} color="#FFF" />}
                    </TouchableOpacity>
                ))}
            </View>
          </>
      ) : null}

      <View style={styles.stepFooter}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.nextBtn, !detailIssue && {opacity: 0.5}]} 
            onPress={() => setStep(3)}
            disabled={!detailIssue}
          >
            <Text style={styles.nextBtnText}>Final Details</Text>
          </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.label}>5. Priority & Frequency</Text>
      <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
              <Text style={styles.subLabel}>Priority</Text>
              {PRIORITIES.map(p => (
                  <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[styles.miniBtn, priority === p && {backgroundColor: COLORS.sky}]}>
                      <Text style={[styles.miniBtnText, priority === p && {color: '#FFF'}]}>{p}</Text>
                  </TouchableOpacity>
              ))}
          </View>
          <View style={{flex: 1}}>
              <Text style={styles.subLabel}>Frequency</Text>
              {FREQUENCIES.map(f => (
                  <TouchableOpacity key={f} onPress={() => setFrequency(f)} style={[styles.miniBtn, frequency === f && {backgroundColor: COLORS.navy}]}>
                      <Text style={[styles.miniBtnText, frequency === f && {color: '#FFF'}]}>{f}</Text>
                  </TouchableOpacity>
              ))}
          </View>
      </View>

      <Text style={styles.label}>6. Comments & Description</Text>
      <TextInput 
        style={styles.textArea} 
        multiline 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Any additional details..."
      />

      <View style={styles.anonRow}>
          <Text style={styles.anonLabel}>Report Anonymously</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{true: COLORS.sky}} />
      </View>

      <View style={styles.stepFooter}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Submit Report</Text>}
          </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Incident Report</Text>
        <Text style={styles.stepIndicator}>Step {step}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE' },
  header: { padding: 20, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.navy },
  stepIndicator: { fontSize: 12, fontWeight: '700', color: COLORS.sky },
  scroll: { padding: 20 },
  label: { fontSize: 14, fontWeight: '900', color: COLORS.navy, marginBottom: 15, marginTop: 10 },
  subLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  choiceCard: { width: '30%', padding: 15, backgroundColor: '#FFF', borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: '#EEE' },
  activeCard: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  choiceLabel: { fontSize: 10, fontWeight: '800', marginTop: 8, color: COLORS.navy },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  smallCard: { flex: 1, padding: 15, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  nextBtn: { backgroundColor: COLORS.sky, padding: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 },
  nextBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 25, marginRight: 10, borderWidth: 1, borderColor: '#DDD' },
  activeChip: { backgroundColor: COLORS.sky, borderColor: COLORS.sky },
  chipText: { fontSize: 12, fontWeight: '800', color: COLORS.navy },
  detailList: { gap: 10 },
  detailItem: { padding: 18, backgroundColor: '#FFF', borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeDetail: { backgroundColor: COLORS.sky, borderColor: COLORS.sky },
  detailText: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  miniBtn: { padding: 12, backgroundColor: '#FFF', borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  miniBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.navy },
  textArea: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, height: 100, textAlignVertical: 'top', marginTop: 10, borderWidth: 1, borderColor: '#EEE' },
  anonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, backgroundColor: '#FFF', padding: 15, borderRadius: 16 },
  anonLabel: { fontWeight: '800', color: COLORS.navy },
  stepFooter: { flexDirection: 'row', gap: 10, marginTop: 30 },
  backBtn: { flex: 1, backgroundColor: '#E2E8F0', padding: 18, borderRadius: 16, alignItems: 'center' },
  backBtnText: { fontWeight: '800', color: '#64748B' },
  submitBtn: { flex: 2, backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});
