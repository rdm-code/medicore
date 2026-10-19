import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authApi, HttpError } from '../lib/api';
import type { CurrentUser, LoginRequestDTO, PatientCreateDTO } from '../types';

interface AuthContextValue {
  user: CurrentUser | null;
  login: (payload: LoginRequestDTO) => Promise<void>;
  register: (payload: PatientCreateDTO) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const raw = sessionStorage.getItem('medicore_user');
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  });

  const persist = (u: CurrentUser | null) => {
    setUser(u);
    if (u) sessionStorage.setItem('medicore_user', JSON.stringify(u));
    else sessionStorage.removeItem('medicore_user');
  };

  const login = useCallback(async (payload: LoginRequestDTO) => {
    // authApi.login triggers Basic auth via GET /api/auth/me
    const current = await authApi.login(payload);
    persist(current);
  }, []);

  const register = useCallback(async (payload: PatientCreateDTO) => {
    // 1) register (public) 2) then authenticate with the same credentials
    await authApi.register(payload);
    const current = await authApi.login({ email: payload.email, password: payload.password });
    persist(current);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    persist(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const current = await authApi.me();
      persist(current);
    } catch (e) {
      if (e instanceof HttpError && e.status === 401) persist(null);
      else throw e;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: !!user, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}