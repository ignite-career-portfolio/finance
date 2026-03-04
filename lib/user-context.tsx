'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUserId, getCurrentUserEmail, logout } from './auth';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const userId = getCurrentUserId();
    const userEmail = getCurrentUserEmail();

    if (userId && userEmail) {
      setUser({ id: userId, email: userEmail });
    }

    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout: handleLogout,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
