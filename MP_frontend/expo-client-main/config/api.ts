import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Backend API URL'ini ortama göre belirle
const getApiUrl = (): string => {
  // Geliştirme ortamında
  if (__DEV__) {
    // Android emülatör için
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api';
    }
    
    // iOS simulator için
    if (Platform.OS === 'ios') {
      return 'http://localhost:3001/api';
    }
    
    // Web için
    return 'http://localhost:3001/api';
  }
  
  // Production ortamı için (buraya gerçek API URL'inizi ekleyin)
  return 'https://your-production-api.com/api';
};

export const API_URL = getApiUrl();

// Backend'in çalışıp çalışmadığını test et
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_URL.replace('/api', ''), {
      method: 'GET',
      timeout: 5000,
    } as any);
    return response.ok;
  } catch (error) {
    console.error('Backend bağlantı testi başarısız:', error);
    return false;
  }
};

// Fiziksel telefonda test için IP adresini manuel ayarla
// Eğer fiziksel telefonda test ediyorsanız, bu değişkeni uncomment edin ve IP'nizi girin
// export const API_URL = 'http://192.168.1.100:3001/api';

