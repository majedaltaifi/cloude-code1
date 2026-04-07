import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { ReportsProvider } from './src/context/ReportsContext';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/OfflineBanner';

import FloatingWhatsApp from './src/components/FloatingWhatsApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <AuthProvider>
          <ReportsProvider>
            <StatusBar style="light" backgroundColor="#0D1145" />
            <OfflineBanner />
            <AppNavigator />
            <FloatingWhatsApp />
          </ReportsProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
