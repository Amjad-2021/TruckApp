import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import LanguageBar              from '../components/LanguageBar';
import { useLanguage }          from '../context/LanguageContext';

import SplashScreen             from '../screens/SplashScreen';
import LoginScreen              from '../screens/LoginScreen';
import OTPScreen                from '../screens/OTPScreen';
import RoleSelectionScreen      from '../screens/RoleSelectionScreen';
import DriverSetupScreen        from '../screens/DriverSetupScreen';
import EditTruckScreen          from '../screens/EditTruckScreen';
import AddTruckScreen           from '../screens/AddTruckScreen';
import MapScreen                from '../screens/MapScreen';
import PostLoadScreen           from '../screens/PostLoadScreen';
import BrowseLoadsScreen        from '../screens/BrowseLoadsScreen';
import DriverAvailabilityScreen from '../screens/DriverAvailabilityScreen';
import NegotiationScreen        from '../screens/NegotiationScreen';
import OrdersScreen             from '../screens/OrdersScreen';
import ProfileScreen            from '../screens/ProfileScreen';
import TermsScreen              from '../screens/TermsScreen';
import PrivacyScreen            from '../screens/PrivacyScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_LABELS = {
  ar: { map: 'الخريطة', post: 'نشر شحنة', loads: 'الشحنات', truck: 'شاحنتي', orders: 'الطلبات', profile: 'الملف' },
  en: { map: 'Map',     post: 'Post Load', loads: 'Find Loads', truck: 'My Truck', orders: 'Orders', profile: 'Profile' },
  ur: { map: 'نقشہ',    post: 'لوڈ پوسٹ', loads: 'لوڈ تلاش', truck: 'میرا ٹرک', orders: 'آرڈر', profile: 'پروفائل' },
  fr: { map: 'Carte',   post: 'Publier',   loads: 'Chercher',  truck: 'Mon Camion', orders: 'Commandes', profile: 'Profil' },
  hi: { map: 'नक्शा',   post: 'लोड पोस्ट', loads: 'लोड खोजें', truck: 'मेरा ट्रक', orders: 'ऑर्डर', profile: 'प्रोफ़ाइल' },
  bn: { map: 'মানচিত্র', post: 'লোড পোস্ট', loads: 'লোড খুঁজুন', truck: 'আমার ট্রাক', orders: 'অর্ডার', profile: 'প্রোফাইল' },
  sw: { map: 'Ramani',  post: 'Chapisha',  loads: 'Tafuta',    truck: 'Lori Langu', orders: 'Maagizo', profile: 'Wasifu' },
};

// ── Bottom tab navigator ───────────────────────────────────────────────────────
function MainTabs({ route }) {
  const role = route.params?.role ?? 'shipper';
  const { lang } = useLanguage();
  const L = TAB_LABELS[lang] ?? TAB_LABELS.en;

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: true,
        headerRight: () => <LanguageBar />,
        headerStyle: { backgroundColor: '#FBF7F0' },
        headerTintColor: '#3D2410',
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarStyle: {
          height: 62, paddingBottom: 8, paddingTop: 6,
          backgroundColor: '#fff',
          borderTopColor: COLORS.border,
          elevation: 12,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Map:       focused ? '🗺️' : '🗺',
            Post:      focused ? '📦' : '📦',
            Loads:     focused ? '📋' : '📋',
            Avail:     focused ? '🚛' : '🚚',
            Orders:    focused ? '🧾' : '🧾',
            Profile:   focused ? '👤' : '👤',
          };
          return (
            <Text style={{ fontSize: 22 }}>{icons[tabRoute.name] ?? '●'}</Text>
          );
        },
      })}
    >
      <Tab.Screen name="Map"     component={MapScreen}     options={{ tabBarLabel: L.map }} />

      {/* Shipper-specific tabs */}
      {role === 'shipper' && (
        <Tab.Screen name="Post"  component={PostLoadScreen}  options={{ tabBarLabel: L.post }} />
      )}

      {/* Driver-specific tabs */}
      {role === 'driver' && (
        <>
          <Tab.Screen name="Loads"  component={BrowseLoadsScreen}        options={{ tabBarLabel: L.loads }} />
          <Tab.Screen name="Avail"  component={DriverAvailabilityScreen} options={{ tabBarLabel: L.truck }} />
        </>
      )}

      <Tab.Screen name="Orders"  component={OrdersScreen}  options={{ tabBarLabel: L.orders }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: L.profile }} />
    </Tab.Navigator>
  );
}

// ── Root stack ────────────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash"          component={SplashScreen} />
        <Stack.Screen name="Login"           component={LoginScreen} />
        <Stack.Screen name="OTP"             component={OTPScreen} />
        <Stack.Screen name="RoleSelection"   component={RoleSelectionScreen} />
        {/* New driver setup — shown once after registration */}
        <Stack.Screen name="DriverSetup"     component={DriverSetupScreen} />
        {/* Edit / add truck screens — reached from DriverAvailabilityScreen */}
        <Stack.Screen name="EditTruck"       component={EditTruckScreen} />
        <Stack.Screen name="AddTruck"        component={AddTruckScreen} />
        <Stack.Screen name="Main"            component={MainTabs} />
        <Stack.Screen name="Negotiation"     component={NegotiationScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="Terms"   component={TermsScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen}
          options={{ presentation: 'card', animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
