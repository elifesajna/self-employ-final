import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  username: string;
  role: 'admin' | 'super_admin';
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Call the verify_admin_login function that returns role
      const { data, error } = await supabase.rpc('verify_admin_login', {
        username_param: username,
        password_param: password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Invalid username or password' };
      }

      const adminData = data[0];
      const adminUser: Admin = {
        id: adminData.id,
        username: adminData.username,
        role: adminData.role
      };

      setAdmin(adminUser);
      localStorage.setItem('admin', JSON.stringify(adminUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  const isSuperAdmin = admin?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};