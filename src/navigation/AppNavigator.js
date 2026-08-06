// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import SplashScreen             from '../screens/SplashScreen';
import LoginScreen              from '../screens/LoginScreen';
import OTPScreen                from '../screens/OTPScreen';
import RoleSelectionScreen      from '../screens/RoleSelectionScreen';
import DriverSetupScreen        from '../screens/DriverSetupScreen';
import EditTruckScreen          from '../screens/EditTruckScreen';
import AddTruckScreen           from '../screens/AddTruckScreen';
import HomeScreen               from '../screens/HomeScreen';
import MapScreen                from '../screens/MapScreen';
import PostLoadScreen           from '../screens/PostLoadScreen';
import BrowseLoadsScreen        from '../screens/BrowseLoadsScreen';
import DriverAvailabilityScreen from '../screens/DriverAvailabilityScreen';
import NegotiationScreen        from '../screens/NegotiationScreen';
import OrdersScreen             from '../screens/OrdersScreen';
import ProfileScreen            from '../screens/ProfileScreen';
import TermsScreen              from '../screens/TermsScreen';
import PrivacyScreen            from '../screens/PrivacyScreen';
import { COLORS }               from '../utils/constants';
import { useLanguage }          from '../context/LanguageContext';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_ICONS = {
  Home:    '🏠',
  Map:     '🗺️',
  Post:    '📦',
  Loads:   '📋',
  Avail:   '🚛',
  Orders:  '🧾',
  Profile: '👤',
};

function MainTabs({ route }) {
  const role          = route.params?.role ?? 'shipper';
  const { t, isRTL } = useLanguage();
  const tabs          = t.tabs;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route: r }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarStyle: {
          height: 62, paddingBottom: 8, paddingTop: 6,
          backgroundColor: '#fff',
          borderTopColor: COLORS.border,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: () => (
          <Text style={{ fontSize: 22 }}>{TAB_ICONS[r.name] ?? '●'}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarLabel: tabs.home    ?? 'Home' }} />
      <Tab.Screen name="Map"     component={MapScreen}     options={{ tabBarLabel: tabs.map     ?? 'Map'  }} />

      {role === 'shipper' && (
        <Tab.Screen name="Post"  component={PostLoadScreen}  options={{ tabBarLabel: tabs.post ?? 'Post' }} />
      )}

      {role === 'driver' && (
        <>
          <Tab.Screen name="Loads" component={BrowseLoadsScreen}        options={{ tabBarLabel: tabs.loads ?? 'Loads'    }} />
          <Tab.Screen name="Avail" component={DriverAvailabilityScreen} options={{ tabBarLabel: tabs.avail ?? 'My Truck' }} />
        </>
      )}

      <Tab.Screen name="Orders"  component={OrdersScreen}  options={{ tabBarLabel: tabs.orders  ?? 'Orders'  }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: tabs.profile ?? 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"        component={SplashScreen} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="OTP"           component={OTPScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="DriverSetup"   component={DriverSetupScreen} />
        <Stack.Screen name="EditTruck"     component={EditTruckScreen} />
        <Stack.Screen name="AddTruck"      component={AddTruckScreen} />
        <Stack.Screen name="Main"          component={MainTabs} />
        <Stack.Screen name="Negotiation"   component={NegotiationScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="Terms"         component={TermsScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="Privacy"       component={PrivacyScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
