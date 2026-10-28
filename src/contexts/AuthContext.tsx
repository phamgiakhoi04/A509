import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/types/models';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const expireSession = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('a509:session-expired', expireSession);
    const syncSession = () => {
      const token = localStorage.getItem('ACCESS_TOKEN');
      const savedUser = localStorage.getItem('USER_INFO');
      try {
        setUser(token && savedUser ? JSON.parse(savedUser) : null);
        setIsAuthenticated(Boolean(token && savedUser));
      } catch { expireSession(); }
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'ACCESS_TOKEN' || event.key === 'USER_INFO') syncSession();
    };
    window.addEventListener('storage', handleStorage);
    const token = localStorage.getItem('ACCESS_TOKEN');
    const savedUser = localStorage.getItem('USER_INFO');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('ACCESS_TOKEN');
        localStorage.removeItem('USER_INFO');
      }
    }
    setIsLoading(false);
    return () => {
      window.removeEventListener('a509:session-expired', expireSession);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('ACCESS_TOKEN', token);
    localStorage.setItem('USER_INFO', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('USER_INFO');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
}
