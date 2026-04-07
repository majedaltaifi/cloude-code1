import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { AuthContext } from '../context/AuthContext';

export default function WhatsAppButton() {
  const { user } = useContext(AuthContext);

  // If not logged in, we don't strictly need to hide it, but it might be nicer. 
  // For now let's show it everywhere except when there's no user session active.
  if (!user) return null;

  const handlePress = () => {
    const phoneNumber = '+966000000000'; // Target phone
    const text = `Hi NIT HR Team, I am ${user.name} - ${user.role} at ${user.site}. I need assistance.`;
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(text)}`;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        return Alert.alert('Error', 'WhatsApp is not installed on your device');
      }
    });
  };

  return (
    <TouchableOpacity style={styles.fab} onPress={handlePress} activeOpacity={0.8}>
      <Ionicons name="logo-whatsapp" size={30} color={COLORS.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 80, // Above tab bar generally
    backgroundColor: '#25D366', // true whatsapp green
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    zIndex: 9999,
  },
});
