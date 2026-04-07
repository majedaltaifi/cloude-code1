import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { Linking } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import MyReportsScreen from '../screens/MyReportsScreen';
import SupportScreen from '../screens/SupportScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.sky,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { 
            backgroundColor: COLORS.white, 
            borderTopWidth: 1, 
            borderTopColor: '#F1F5F9',
            height: 75,
            paddingBottom: 15,
            paddingTop: 10
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '900' },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
        }} 
      />
      
      <Tab.Screen 
        name="My Reports" 
        component={MyReportsScreen} 
        options={{ 
            title: 'My Reports',
            headerShown: true,
            headerTitle: 'Reports History',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "folder" : "folder-outline"} size={22} color={color} />
        }} 
      />

      <Tab.Screen 
        name="Support" 
        component={SupportScreen} 
        options={{ 
            title: 'Support Hub',
            headerShown: true,
            headerTitle: 'Technical Support',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "headset" : "headset-outline"} size={24} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
}
