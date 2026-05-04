import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import Button from '@/components/Button';
import Input from '@/components/Input';
import AppBackground from '@/components/AppBackground';

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const params = useLocalSearchParams();
  const email = params.email as string;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      setError('E-posta bilgisi bulunamadı. Lütfen kayıt ekranından tekrar deneyin.');
      return;
    }
    if (!code) {
      setError('Doğrulama kodu gereklidir');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyCode(email, code);

      if (!result.success) {
        setError(result.message || 'Doğrulama başarısız');
      } else {
        Alert.alert('Başarılı', 'E-posta doğrulandı!', [
          {
            text: 'Tamam',
            onPress: () => router.push('/auth/login'),
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert('Bilgi', 'Doğrulama kodu e-postanıza tekrar gönderildi');
  };

  return (
    <AppBackground>
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Mail size={48} color={colors.secondary[400]} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>E-posta Doğrula</Text>
          <Text style={styles.subtitle}>
            {email} adresine gönderilen 6 haneli doğrulama kodunu girin
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Doğrulama Kodu"
            placeholder="123456"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setError('');
            }}
            error={error}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button title="Doğrula" onPress={handleVerify} loading={loading} />

          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Text style={styles.resendText}>Kodu Tekrar Gönder</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Test için doğrulama kodu: <Text style={styles.infoCode}>123456</Text>
            </Text>
          </View>
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
    backgroundColor: colors.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fontFamily.bold,
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
  resendButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.sizes.md,
    color: colors.secondary[400],
    fontFamily: typography.fontFamily.semibold,
  },
  infoBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  infoCode: {
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
});
}
