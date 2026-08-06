/**
 * AuthContext.js
 *
 * Thin wrapper kept for backward compatibility.
 * Auth state is managed by UserContext (AsyncStorage + JWT).
 * This file no longer uses Firebase.
 */
import React, { createContext, useContext } from 'react';
import { useUser } from './UserContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Delegate entirely to UserContext — no Firebase needed
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
