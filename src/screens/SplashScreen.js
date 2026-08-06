import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../utils/constants';

export default function SplashScreen({ navigation }) {
  const fadeAnim  = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5,   useNativeDriver: true }),
    ]).start();

    // Check for existing session while the animation plays
    const checkAuth = async () => {
      try {
        const [token, userStr] = await AsyncStorage.multiGet([
          'trucklink_token',
          'trucklink_user',
        ]);

        const savedToken = token[1];
        const savedUser  = userStr[1] ? JSON.parse(userStr[1]) : null;

        // Wait for the animation to finish before navigating
        await new Promise(resolve => setTimeout(resolve, 2200));

        if (savedToken && savedUser) {
          // Already logged in — go straight to Main with correct role
          navigation.replace('Main', { role: savedUser.role ?? 'shipper' });
        } else {
          navigation.replace('Login');
        }
      } catch {
        // Any error → go to Login
        await new Promise(resolve => setTimeout(resolve, 2200));
        navigation.replace('Login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.icon}>🚛</Text>
        <Text style={styles.brand}>TruckLink</Text>
        <Text style={styles.tagline}>Connect. Deliver. Earn.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoWrap: { alignItems: 'center' },
  icon:     { fontSize: 80, marginBottom: 12 },
  brand:    { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline:  { fontSize: 15, color: COLORS.secondary, marginTop: 6, letterSpacing: 0.5 },
});
