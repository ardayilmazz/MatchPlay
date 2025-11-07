import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();

  const validate = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!firstName) newErrors.firstName = 'Ad gereklidir';
    if (!lastName) newErrors.lastName = 'Soyad gereklidir';

    if (!email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!email.endsWith('.edu') && !email.endsWith('.edu.tr')) {
      newErrors.email = 'Sadece .edu veya .edu.tr uzantılı e-posta adresleri kabul edilir';
    }

    if (!password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setGeneralError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Fonksiyonu yeni parametrelerle çağır
      const result = await register(firstName, lastName, email, password);
      setLoading(false);

      if (!result.success) {
        console.log('Registration failed:', result.message);
        setGeneralError(result.message || 'Kayıt olunamadı');
      } else {
        console.log('Registration successful, navigating to onboarding');
        // Başarılı kayıt sonrası login'e değil, profil oluşturma ekranına yönlendir.
        router.replace('/onboarding/basic-info');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      setGeneralError('Kayıt işlemi sırasında bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Kayıt olarak başla</Text>
          </View>

          <View style={styles.form}>
            {generalError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            ) : null}

            <View style={styles.nameContainer}>
              <Input
                label="Ad"
                placeholder="Adınız"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                containerStyle={styles.nameInput}
              />
              <Input
                label="Soyad"
                placeholder="Soyadınız"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                containerStyle={styles.nameInput}
              />
            </View>

            <Input
              label="E-posta"
              placeholder="ornek@universite.edu"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Şifre"
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              autoCapitalize="none"
            />

            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
              autoCapitalize="none"
            />

            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.footerLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  form: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
  },
  registerButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#efe',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#cfc',
  },
  successText: {
    color: '#060',
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
