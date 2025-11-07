import { User } from '@/types';
import { storageService } from './storageService';

const isValidEduEmail = (email: string): boolean => {
  return email.endsWith('.edu') || email.endsWith('.edu.tr');
};

export const authService = {
  async register(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    console.log('Registering user:', { email, password });
    // TODO: Implement registration with the new backend
    return { success: true, message: 'Kayıt başarılı! Giriş yapabilirsiniz.' };
  },

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    // TODO: Implement email verification with the new backend
    return { success: true };
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    console.log('Logging in user:', { email, password });
    // TODO: Implement login with the new backend
    // For now, returning a mock user
    const mockUser: User = {
      id: '1',
      email: email,
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date().toISOString(),
    };
    return { success: true, user: mockUser };
  },

  async logout(): Promise<void> {
    // TODO: Implement logout with the new backend
    console.log('Logging out user');
  },

  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement fetching the current user with the new backend
    // For now, returning a mock user
    const mockUser: User = {
      id: '1',
      email: 'user@example.edu',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: new Date().toISOString(),
    };
    return mockUser;
  },

  async updateUser(user: User): Promise<{ success: boolean; user?: User; message?: string }> {
    console.log('Updating user:', user);
    // TODO: Implement user update with the new backend
    return { success: true, user };
  },

  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    console.log('Resetting password for:', email);
    // TODO: Implement password reset with the new backend
    return { success: true, message: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi' };
  },
};
