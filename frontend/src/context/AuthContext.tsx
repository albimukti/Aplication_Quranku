import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { fetchApi } from '../utils/api';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  quickLogin: (role: Role) => Promise<void>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('quranku_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await fetchApi<User>('/auth/me');
          setUser(userData);
        } catch {
          localStorage.removeItem('quranku_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('quranku_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const quickLogin = async (_targetRole: Role) => {
    await login('admin', 'P@ssw0rd');
  };

  const register = async (name: string, email: string, password: string, role: Role = 'User') => {
    const res = await fetchApi<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem('quranku_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('quranku_token');
    setToken(null);
    setUser(null);
  };

  const currentRole: Role = user ? user.role : 'User';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        token,
        isLoading,
        login,
        quickLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
