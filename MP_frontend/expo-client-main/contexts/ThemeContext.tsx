import { createContext, useContext, ReactNode } from 'react';
import { darkColors } from '@/constants/theme';

type ColorScheme = typeof darkColors;

interface ThemeContextType {
  colors: ColorScheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/** Tek tema: MatchPlay koyu paleti (açık/koyu seçimi yok). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors: darkColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
