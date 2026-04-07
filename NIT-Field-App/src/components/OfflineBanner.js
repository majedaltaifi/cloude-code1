import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NetworkContext } from '../context/NetworkContext';
import { COLORS } from '../constants/colors';

export default function OfflineBanner() {
  const { isOffline } = useContext(NetworkContext);
  const insets = useSafeAreaInsets();

  if (!isOffline) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>◈ Offline — reports will sync automatically</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.orange,
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  text: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
