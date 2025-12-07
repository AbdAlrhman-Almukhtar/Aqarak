import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [token]);
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const { data } = await api.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const authToken = data.access_token;
    setToken(authToken);
    localStorage.setItem('auth_token', authToken);
    try {
      const { data: userData } = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      const userObj: User = { id: 0, email, name: undefined };
      setUser(userObj);
      localStorage.setItem('auth_user', JSON.stringify(userObj));
    }
  };

  const register = async (email: string, password: string, phone: string, name?: string) => {
    await api.post('/auth/register', {
      email,
      password,
      phone,
      name,
    });
    await login(email, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
      localStorage.setItem('auth_user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
