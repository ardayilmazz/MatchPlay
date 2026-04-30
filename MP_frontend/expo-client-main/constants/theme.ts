/**
 * MatchPlay Design System
 * Modern Dark UI, High-Contrast Accents
 * Core Font: Montserrat
 */

export const darkColors = {
  primary: {
    // Açık mavilerden koyu lacivertlere uzanan ana paletin
    50: '#BFD7FF',
    100: '#83B2FF',
    200: '#5797FF',
    300: '#5673C8',
    400: '#415FB4',
    500: '#2A499F', // Vurgu Mavisi (Main Color kutusundan)
    600: '#192E68',
    700: '#132456', // Kart ve Panel Arka Planları
    800: '#0C183A', // En Koyu Lacivert (App Background)
    900: '#060C1D',
  },
  secondary: {
    // Turuncu aksan renklerin (Butonlar ve İkonlar için)
    50: '#FFDBCF',
    100: '#FFC5B5',
    200: '#FFB09D',
    300: '#FF957B',
    400: '#FF7958', // Ana Buton Turuncusu (Main Color kutusundan)
    500: '#E35C3B', // Buton Hover/Active
    600: '#C34728',
    700: '#94351E',
    800: '#6A2514',
    900: '#40150A',
  },
  neutral: {
    0: '#FFFFFF', // Saf Beyaz (Metinler)
    50: '#F8F9FA',
    100: '#E0E0E0',
    200: '#BDBDBD',
    300: '#9E9E9E', // Pasif Metinler / Placeholder
    400: '#757575',
    500: '#616161',
    600: '#424242',
    700: '#3D3D3D', // İkincil kartlar için panel grisi (Figma notundan)
    800: '#212121',
    900: '#0A0A0A',
    950: '#000000',
  },
  background: {
    // Uygulaman Dark-first olduğu için arka planlar direkt koyu tonlar
    primary: '#0C183A',   // 800 - Ana tam ekran arka plan
    secondary: '#132456', // 700 - Kartlar ve Bottom Tab
    tertiary: '#192E68',  // 600 - Hover veya üst katmanlar
  },
  text: {
    primary: '#FFFFFF',   // Ana başlıklar
    secondary: '#BDBDBD', // Alt metinler (örn: 2km Çevrede)
    tertiary: '#9E9E9E',  // En pasif metinler
    inverse: '#0C183A',   // Açık renk buton içindeki metinler
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#D32F2F',
    600: '#C62828',
    700: '#B71C1C',
    800: '#8F1B14',
    900: '#6A1410',
  },
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#12B76A',
    600: '#09965A',
    700: '#06764A',
    800: '#045C3A',
    900: '#03422B',
  },
};

// Açık tema: mevcut ekranlar (ana sayfa dışı) ve tema tercihi için yapısal uyum
export const lightColors = {
  primary: darkColors.primary,
  secondary: darkColors.secondary,
  neutral: {
    0: '#FFFFFF',
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
    500: '#757575',
    600: '#616161',
    700: '#424242',
    800: '#212121',
    900: '#0A0A0A',
    950: '#000000',
  },
  background: {
    primary: '#F8F9FA',
    secondary: '#FFFFFF',
    tertiary: '#F1F3F4',
  },
  text: {
    primary: '#0A0A0A',
    secondary: '#424242',
    tertiary: '#757575',
    inverse: '#FFFFFF',
  },
  error: darkColors.error,
  success: darkColors.success,
};

// Uygulaman varsayılan olarak koyu tema odaklı
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  card: 16,      // Kartlar için standart köşe
  cardLarge: 24, // Hero / büyük kart yuvarlaklığı (home & bileşenler)
  button: 12,    // Butonlar için biraz daha keskin
  full: 9999,
};

export const typography = {
  fontFamily: {
    // Montserrat fontlarına geçiş
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semibold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32, // Figma'daki H1 32px değeri
  },
  lineHeights: {
    tight: 1.25,  // Figma'da H1 için 1.25 belirtilmiş
    normal: 1.5,
    relaxed: 1.75,
  },
  // fontFamily kullanımına öncelik verin; bu değerler eski ekranlarda
  // fontWeight: typography.weights.* ile geriye dönük uyum için.
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};