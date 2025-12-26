import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials?: { email: string; password: string; name?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (credentials?: { email: string; password: string; name?: string }) => {
    if (credentials) {
      // Email/password login
      setUser({
        id: '1',
        email: credentials.email,
        name: credentials.name || credentials.email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
      });
    } else {
      // Google OAuth login
      setUser({
        id: '1',
        email: 'user@dataconsent.app',
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
