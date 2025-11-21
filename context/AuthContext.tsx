import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (name: string, email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    const user = await db.login(email);
    if (user) {
      setUser(user);
    } else {
      throw new Error("User not found");
    }
  };

  const signUp = async (name: string, email: string) => {
    const newUser = await db.register(name, email);
    setUser(newUser);
  };

  const signOut = () => {
    db.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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