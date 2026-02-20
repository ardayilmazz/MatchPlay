import { User, RegisterData } from '@/types';
import { storageService } from './storageService';
import { API_URL } from '@/config/api';


const isValidEduEmail = (email: string): boolean => {
  return email.endsWith('.edu') || email.endsWith('.edu.tr');
};

export const authService = {
  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/users/send-verification-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
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
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
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
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt sırasında bir hata oluştu.');
      }

      // Token'ı sakla
      if (data.token) {
        await storageService.setToken(data.token);
      }

      // User nesnesini düzenle
      const user: User = {
        id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university || '',
        department: data.department || '',
        profilePhoto: data.profilePhoto || '',
        bio: data.bio || '',
        sports: [],
        createdAt: new Date().toISOString(),
        token: data.token, // Token'ı user objesine ekle
      };

      return { success: true, user };
    } catch (error: any) {
      console.error('Register service error:', error);
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş yapılamadı.');
      }

      // Token'ı sakla
      if (data.token) {
        await storageService.setToken(data.token);
      }

      // User nesnesini düzenle (backend'den gelen _id'yi id'ye çevir)
      const user: User = {
        id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university || '',
        department: data.department || '',
        profilePhoto: data.profilePhoto,
        bio: data.bio,
        sports: data.sports || [],
        createdAt: data.createdAt || new Date().toISOString(),
        token: data.token, // Token'ı user objesine ekle
      };

      return { success: true, user };
    } catch (error: any) {
      console.error('Login service error:', error);
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await storageService.removeToken();
      console.log('Kullanıcı çıkış yaptı');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await storageService.getToken();
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token geçersiz veya süresi dolmuş
        await storageService.removeToken();
        return null;
      }

      const data = await response.json();

      // User nesnesini düzenle
      const user: User = {
        id: data._id || data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university || '',
        department: data.department || '',
        profilePhoto: data.profilePhoto,
        bio: data.bio,
        sports: data.sports || [],
        createdAt: data.createdAt || new Date().toISOString(),
        token: token, // Mevcut token'ı ekle
      };

      return user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async updateUser(user: User): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const token = await storageService.getToken();
      
      if (!token) {
        return { success: false, message: 'Token bulunamadı. Lütfen tekrar giriş yapın.' };
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          university: user.university,
          department: user.department,
          bio: user.bio,
          profilePhoto: user.profilePhoto,
          sports: user.sports,
          skillLevel: user.skillLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profil güncellenemedi.');
      }

      // User nesnesini düzenle
      const updatedUser: User = {
        id: data._id || data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university || '',
        department: data.department || '',
        profilePhoto: data.profilePhoto,
        bio: data.bio,
        sports: data.sports || [],
        skillLevel: data.skillLevel,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      return { success: true, user: updatedUser };
    } catch (error: any) {
      console.error('Update user error:', error);
      return { success: false, message: error.message || 'Sunucuya bağlanılamadı.' };
    }
  },

  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    console.log('Resetting password for:', email);
    // TODO: Implement password reset with the new backend
    return { success: true, message: 'Şifre sıfırlama bağlantısı e-postanıza gönderildi' };
  },
};
