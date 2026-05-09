import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pedp_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('pedp_token'))
      .finally(() => setLoading(false));
  }, []);

  async function signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('pedp_token', data.token);
    setUser(data.user);
  }

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem('pedp_token', data.token);
    setUser(data.user);
  }

  async function logout() {
    localStorage.removeItem('pedp_token');
    setUser(null);
    await api.post('/auth/logout').catch(() => {});
  }

  async function updatePreferences(payload) {
    const { data } = await api.put('/auth/preferences', payload);
    setUser(data.user);
  }

  async function updateProfile(payload) {
    const { data } = await api.put('/auth/profile', payload);
    if (data.token) localStorage.setItem('pedp_token', data.token);
    setUser(data.user);
  }

  const value = useMemo(() => ({ user, loading, signup, login, logout, updatePreferences, updateProfile }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
