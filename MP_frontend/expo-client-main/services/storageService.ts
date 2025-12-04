import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@matchplay_token';

export const storageService = {
  // Token yönetimi
  setToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Token kaydedilemedi:', error);
      throw error;
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Token alınamadı:', error);
      return null;
    }
  },

  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Token silinemedi:', error);
      throw error;
    }
  },

  // Profil fotoğrafı yönetimi
  uploadProfilePhoto: async (userId: string, uri: string): Promise<{ success: boolean; url?: string; message?: string }> => {
    console.log('Uploading profile photo for user:', userId, 'from uri:', uri);
    // TODO: Implement profile photo upload with the new backend
    // For now, returning a mock URL
    const mockUrl = 'https://picsum.photos/200';
    return { success: true, url: mockUrl };
  },

  deleteProfilePhoto: async (photoUrl: string): Promise<{ success: boolean; message?: string }> => {
    console.log('Deleting profile photo:', photoUrl);
    // TODO: Implement profile photo deletion with the new backend
    return { success: true };
  },
};
