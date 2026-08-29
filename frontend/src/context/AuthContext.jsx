import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearAccessToken, login, logout, refreshSession, setAccessToken, signup } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('jansahay_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem('jansahay_access_token');

    refreshSession()
      .then((session) => {
        if (!active) return;
        setAccessToken(session.access_token, session.user);
        setUser(session.user);
      })
      .catch(() => {
        if (!active) return;
        if (!storedToken) {
          clearAccessToken();
          setUser(null);
        }
      })
      .finally(() => active && setReady(true));
    return () => { active = false; };
  }, []);

  const authenticate = useCallback(async (method, payload) => {
    const session = method === 'signup' ? await signup(payload) : await login(payload);
    setAccessToken(session.access_token, session.user);
    setUser(session.user);
    return session.user;
  }, []);

  const signOut = useCallback(async () => {
    try { await logout(); } finally { clearAccessToken(); setUser(null); }
  }, []);

  return <AuthContext.Provider value={{ user, ready, login: (payload) => authenticate('login', payload), signup: (payload) => authenticate('signup', payload), logout: signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
