import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import RatingManager from '@/components/RatingManager';
import { colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function ThemeAwareApp() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="light" />
    </AuthProvider>
  );
}

// Bu yeni bileşen, AuthProvider'ın içinde olduğu için useAuth hook'unu kullanabilir.
function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // isLoading true ise veya kimlik doğrulama durumu henüz belli değilse bekle.
    if (isLoading) {
      return;
    }

    const inTabsGroup = segments[0] === '(tabs)';

    // Kullanıcı giriş yapmamışsa ve (tabs) grubundaki korumalı bir sayfaya
    // erişmeye çalışıyorsa, onu başlangıç ekranına yönlendir.
    if (!isAuthenticated && inTabsGroup) {
      router.replace('/');
    }
    
    // Not: Otomatik yönlendirme (giriş yapmış kullanıcıyı ana sayfaya atma)
    // kullanıcı isteği üzerine kaldırılmıştır. Kullanıcı her zaman başlangıç
    // ekranında başlar ve manuel olarak ilerler.
  }, [isAuthenticated, isLoading, segments]);

  // Auth durumu yüklenirken bir yüklenme ekranı gösterebiliriz.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="vote/[id]" />
        <Stack.Screen name="complaint" />
        <Stack.Screen name="rating/[gameId]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <RatingManager />
    </>
  );
}


export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': require('@/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('@/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('@/assets/fonts/Montserrat-SemiBold.ttf'),
    'Montserrat-Bold': require('@/assets/fonts/Montserrat-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary }}>
        <ActivityIndicator size="large" color={colors.secondary[400]} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <ThemeAwareApp />
    </ThemeProvider>
  );
}
