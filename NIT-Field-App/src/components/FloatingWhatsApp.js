import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WHATSAPP_URL = 'https://wa.me/+966500000000?text=I need help with my NIT Field Report';

export default function FloatingWhatsApp() {
  const handlePress = () => {
    Linking.openURL(WHATSAPP_URL);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.container} 
      onPress={handlePress}
    >
      <View style={styles.button}>
        <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 95,
    right: 20,
    zIndex: 9999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});
