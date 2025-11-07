import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface UseLocationResult {
  location: LocationCoords | null;
  error: string | null;
  isLoading: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        setError('Konum servisi web platformunda desteklenmiyor');
        return false;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        setError('Konum izni verilmedi. Ayarlardan konum iznini aktifleştirebilirsiniz.');
      } else {
        setError(null);
      }

      return granted;
    } catch (err) {
      setError('Konum izni alınırken bir hata oluştu');
      return false;
    }
  };

  const refreshLocation = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setIsLoading(false);
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (err) {
      setError('Konum alınırken bir hata oluştu');
      setLocation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      if (Platform.OS === 'web') {
        return;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        await refreshLocation();
      }
    };

    checkPermissionAndGetLocation();
  }, []);

  return {
    location,
    error,
    isLoading,
    hasPermission,
    requestPermission,
    refreshLocation,
  };
};
