import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import ReportConfirmationScreen from '../screens/ReportConfirmationScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import CompanyInfoScreen from '../screens/CompanyInfoScreen';
import AdminScreen from '../screens/AdminScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.offWhite,
    card: COLORS.navy,
    text: COLORS.white,
    border: COLORS.border,
    primary: COLORS.sky,
  },
};

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // or a Splash screen
  }

  return (
    <NavigationContainer theme={NavigationTheme}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.navy }, headerTintColor: COLORS.white }}>
        {user == null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="ReportConfirmation" component={ReportConfirmationScreen} options={{ title: 'Success', headerBackVisible: false }} />
            <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
            <Stack.Screen name="Materials" component={MaterialsScreen} />
            <Stack.Screen name="CompanyInfo" component={CompanyInfoScreen} options={{ title: 'Company Rules' }} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
