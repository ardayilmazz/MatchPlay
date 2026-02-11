import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Backend API URL'ini ortama göre belirle
const getApiUrl = (): string => {
  // FİZİKSEL CİHAZ İÇİN: Bilgisayarınızın yerel ağ IP adresi
  // Bu IP'yi ipconfig (Windows) veya ifconfig (Mac/Linux) ile bulabilirsiniz
  const LOCAL_NETWORK_IP = '172.20.10.3'; // Bilgisayarınızın IP adresi
  
  // ⚠️ GEÇİCİ ÇÖZÜM: Fiziksel cihaz testi için bu satırı aktif edin
  // Simulator'da test ediyorsanız bu satırı yorum satırı yapın
  const FORCE_PHYSICAL_DEVICE = true; // Fiziksel iPhone için true, simulator için false
  
  // Geliştirme ortamında
  if (__DEV__) {
    // Expo'nun otomatik tespit ettiği IP adresini kullan (varsa)
    const expoDebuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    // Fiziksel cihaz kontrolü - birden fazla yöntem kullanarak
    const isPhysicalDevice = FORCE_PHYSICAL_DEVICE || 
                            (!Platform.isTV && Constants.isDevice) ||
                            (expoDebuggerHost && expoDebuggerHost !== 'localhost');
    
    if (isPhysicalDevice) {
      // Expo'nun tespit ettiği IP'yi kullan, yoksa LOCAL_NETWORK_IP'yi kullan
      const hostIp = expoDebuggerHost || LOCAL_NETWORK_IP;
      console.log(`[API Config] 🔴 FİZİKSEL CİHAZ - Backend IP: ${hostIp}`);
      return `http://${hostIp}:3001/api`;
    }
    
    // Android emülatör için
    if (Platform.OS === 'android') {
      console.log('[API Config] Android emülatör - 10.0.2.2 kullanılıyor');
      return 'http://10.0.2.2:3001/api';
    }
    
    // iOS simulator için
    if (Platform.OS === 'ios') {
      console.log('[API Config] iOS simulator - localhost kullanılıyor');
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

