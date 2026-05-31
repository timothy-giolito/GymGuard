import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User } from './authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>({ id: 'default_user', name: 'Utente' });

  const login = async (name: string) => {
    setUser({ id: 'default_user', name });
  };

  const logout = async () => {
    // Non fa nulla, siamo sempre loggati
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: true, isLoading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
