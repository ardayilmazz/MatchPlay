import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import AppBackground from '@/components/AppBackground';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <AppBackground>
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText} numberOfLines={1} adjustsFontSizeToFit>
              MatchPlay
            </Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Oyun Arkadaşını Bul</Text>
          <Text style={styles.subtitle}>
            Üniversitende spor ve oyun etkinliklerine katıl, yeni arkadaşlar edin
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Giriş Yap"
            onPress={() => router.push('/auth/login')}
            variant="primary"
            style={styles.button}
          />
          <Button
            title="Kayıt Ol"
            onPress={() => router.push('/auth/register')}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
    </AppBackground>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.secondary[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.neutral[0],
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
  });
}
