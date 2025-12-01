import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, AuthState, RegisterData } from '@/types'; // RegisterData'yı import et
import { authService } from '@/services/authService';

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (registerData: RegisterData) => Promise<{ success: boolean; message?: string }>; // Parametreyi güncelle
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<{ success: boolean; message?: string }>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const register = async (registerData: RegisterData) => { // Parametreyi güncelle
    const result = await authService.register(registerData); // Servisi yeni veriyle çağır
    if (result.success && result.user) {
      // Kayıt başarılıysa, kullanıcıyı state'e ata ve anında giriş yapmış say.
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async (updatedUser: User) => {
    const result = await authService.updateUser(updatedUser);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    setUser,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
