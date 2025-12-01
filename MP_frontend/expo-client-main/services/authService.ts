import { User, RegisterData } from '@/types'; // RegisterData tipini import et
import { storageService } from './storageService';

// Backend sunucunuzun adresi.
// EĞER FİZİKSEL BİR TELEFONDA TEST EDİYORSANIZ:
// 'localhost' yerine bilgisayarınızın yerel ağdaki IP adresini yazın.
const API_URL = 'https://unkempt-incogitantly-carolina.ngrok-free.dev/api'; // Örnek: 'https://1a2b-3c4d.ngrok.io/api'


const isValidEduEmail = (email: string): boolean => {
  return email.endsWith('.edu') || email.endsWith('.edu.tr');
};

export const authService = {
  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/users/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/users/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },
  
  async register(registerData: RegisterData): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt sırasında bir hata oluştu.');
      }

      return { success: true, user: data };
    } catch (error: any) {
      console.error('Register service error:', error);
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    console.log('Logging in user:', { email, password });
    // TODO: Implement login with the new backend
    // For now, returning a mock user
    const mockUser: User = {
      id: '1',
      email: email,
      firstName: 'Test',
      lastName: 'User',
      university: 'Test University',
      department: 'Test Department',
      sports: [],
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
      firstName: 'Test',
      lastName: 'User',
      university: 'Test University',
      department: 'Test Department',
      sports: [],
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
