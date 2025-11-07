import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>MatchPlay</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    width: 120,
    height: 120,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.inverse,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
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
