// src/context/UserContext.js  —  AsyncStorage only, no Firebase
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext(null);

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const loadUser = async () => {
    try {
      const json = await AsyncStorage.getItem('trucklink_user');
      if (json) {
        const saved = JSON.parse(json);
        setUser({
          id:         saved.id         ?? null,
          phone:      saved.phone      ?? '',
          name:       saved.name       ?? saved.full_name ?? '',
          full_name:  saved.full_name  ?? saved.name      ?? '',
          role:       saved.role       ?? null,
          lang:       saved.lang       ?? 'ar',
          rating:     saved.rating     ?? 0,
          totalTrips: saved.totalTrips ?? 0,
          createdAt:  saved.createdAt  ?? null,
          initials:   getInitials(saved.name ?? saved.full_name ?? ''),
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const reloadUser = async () => { await loadUser(); };

  const refreshUser = (patch) => {
    setUser(prev => prev
      ? { ...prev, ...patch, initials: getInitials(patch.name ?? prev.name) }
      : prev
    );
  };

  return (
    <UserContext.Provider value={{ user, authReady, reloadUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside <UserProvider>');
  return ctx;
}
