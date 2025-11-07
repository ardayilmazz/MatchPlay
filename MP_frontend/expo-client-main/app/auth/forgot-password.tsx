import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, KeyRound } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { authService } from '@/services/authService';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!email.endsWith('.edu')) {
      setError('Geçerli bir .edu e-posta adresi girin');
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'İşlem başarısız');
    } else {
      Alert.alert('Başarılı', result.message || 'Şifre sıfırlama bağlantısı gönderildi', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <KeyRound size={48} color={colors.primary[500]} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-posta"
            placeholder="ornek@universite.edu"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Button
            title="Şifre Sıfırlama Bağlantısı Gönder"
            onPress={handleResetPassword}
            loading={loading}
          />

          <TouchableOpacity
            style={styles.backToLogin}
            onPress={() => router.push('/auth/login')}>
            <Text style={styles.backToLoginText}>Giriş sayfasına dön</Text>
          </TouchableOpacity>
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
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  form: {
    flex: 1,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backToLoginText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
});
