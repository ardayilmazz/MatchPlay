import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image, // Image component'ini import et
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // useRouter hook'unu import et
import { ChevronLeft, Camera, User as UserIcon } from 'lucide-react-native'; // İkonları import et
import * as ImagePicker from 'expo-image-picker'; // ImagePicker'ı import et
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { authService } from '@/services/authService';
import { RegisterData } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // useAuth hook'unu import et

import Button from '@/components/Button';
import Input from '@/components/Input';

// Adımları tanımlayalım
type Step =
  | 'EMAIL_ENTRY'
  | 'EMAIL_VERIFY'
  | 'PASSWORD_ENTRY'
  | 'USER_INFO'
  | 'PROFILE_PHOTO'
  | 'BIO';

// Form verileri için yerel bir tip oluşturalım
interface RegisterFormState extends Partial<RegisterData> {
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const router = useRouter(); // router'ı hook ile alalım
  const { setUser } = useAuth(); // AuthContext'ten setUser fonksiyonunu al
  const [step, setStep] = useState<Step>('EMAIL_ENTRY');
  const [formData, setFormData] = useState<RegisterFormState>({});
  const [verificationCode, setVerificationCode] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Tekrar gönder butonu için zamanlayıcı
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    let timer: any; // Tip hatasını çözmek için 'any' kullanabiliriz veya tipi kaldırabiliriz.
    if (resendCooldown > 0) {
      setResendDisabled(true);
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  // Adım 1: E-posta ile kod gönderme
  const handleSendCode = async (isResend = false) => {
    if (!formData.email) {
      setErrors({ email: 'E-posta adresi gereklidir.' });
      return;
    }
    setErrors({});
    setGeneralError('');
    setLoading(true);
    const result = await authService.sendVerificationCode(formData.email);
    setLoading(false);

    if (result.success) {
      if (!isResend) {
        setStep('EMAIL_VERIFY');
      }
      setResendCooldown(30); // 30 saniye bekleme süresi başlat
    } else {
      setGeneralError(result.message || 'Bir hata oluştu.');
    }
  };

  // Adım 2: Kodu doğrulama
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setErrors({ code: 'Doğrulama kodu gereklidir.' });
      return;
    }
    setErrors({});
    setGeneralError('');
    setLoading(true);
    const result = await authService.verifyCode(formData.email!, verificationCode);
    setLoading(false);

    if (result.success) {
      // Bir sonraki adıma geç
      setStep('PASSWORD_ENTRY'); 
    } else {
      setGeneralError(result.message || 'Kod doğrulanamadı.');
    }
  };

  // Adım 3: Şifre oluşturma
  const handlePasswordSubmit = () => {
    const { password, confirmPassword } = formData;
    const newErrors: { [key: string]: string } = {};

    if (!password) {
      newErrors.password = 'Şifre gereklidir.';
    } else if (password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Bir sonraki adıma geç
      setStep('USER_INFO');
    }
  };

  // Adım 4: Kişisel bilgileri alma
  const handleUserInfoSubmit = () => {
    const { firstName, lastName, birthDate, email } = formData;
    const newErrors: { [key: string]: string } = {};

    if (!firstName) newErrors.firstName = 'Ad gereklidir.';
    if (!lastName) newErrors.lastName = 'Soyad gereklidir.';
    if (!birthDate) newErrors.birthDate = 'Doğum tarihi gereklidir.';

    // 18 yaş kontrolü
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.birthDate = '18 yaşından büyük olmalısınız.';
      }
    }

    // E-posta isim/soyisim kontrolü
    if (firstName && lastName && email) {
      const normalizeText = (text: string) => {
        return text.toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c');
      };
      const normalizedFirstName = normalizeText(firstName);
      const normalizedLastName = normalizeText(lastName);
      const emailUsername = email.split('@')[0];

      if (!emailUsername.includes(normalizedFirstName) || !emailUsername.includes(normalizedLastName)) {
        newErrors.emailMatch = 'İsim ve soyisim, e-posta adresinizle eşleşmelidir.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Bir sonraki adıma geç
      setStep('PROFILE_PHOTO');
    }
  };

  // Adım 5: Profil fotoğrafı yükleme
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setFormData({ ...formData, profilePhoto: result.assets[0].uri });
    }
  };

  const handleProfilePhotoSubmit = () => {
    // Bu adımda zorunlu bir alan olmadığı için direkt sonraki adıma geçiyoruz.
    setStep('BIO');
  };

  // Adım 6: Biyografi ve son kayıt işlemi
  const handleFinalRegister = async () => {
    setLoading(true);
    setGeneralError('');

    // formData'yı `authService`'in beklediği `RegisterData` tipine uygun hale getir.
    const finalData: RegisterData = {
      email: formData.email!,
      password: formData.password!,
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      birthDate: formData.birthDate!,
      profilePhoto: formData.profilePhoto || '',
      bio: formData.bio || '',
    };
    
    // AuthContext'teki register fonksiyonunu henüz kullanmıyoruz, direkt servisi çağırıyoruz.
    const result = await authService.register(finalData);
    setLoading(false);

    if (result.success && result.user) {
      // Kullanıcı session'ını başlat. Bu, _layout.tsx'teki useEffect'i tetikleyecek.
      setUser(result.user); 
      Alert.alert('Hoş Geldin!', 'Kaydın başarıyla tamamlandı.');
      // Yönlendirme artık _layout.tsx tarafından otomatik olarak yapılacak.
      // router.replace('/(tabs)' as any); 
    } else {
      setGeneralError(result.message || 'Kayıt işlemi sırasında bir hata oluştu.');
    }
  };
  
  // E-posta giriş adımını render eden fonksiyon
  const renderEmailEntryStep = () => (
    <>
      <Input
        label="E-posta"
        placeholder="ornek@universite.edu"
        value={formData.email || ''}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <Button
        title="Doğrulama Kodu Gönder"
        onPress={() => handleSendCode(false)}
        loading={loading}
        style={styles.button}
      />
    </>
  );

  // Kod doğrulama adımını render eden fonksiyon
  const renderEmailVerifyStep = () => (
    <>
      <Text style={styles.subtitle}>
        <Text style={{fontWeight: 'bold'}}>{formData.email}</Text> adresine gönderilen 6 haneli kodu girin.
      </Text>
      <Input
        label="Doğrulama Kodu"
        placeholder="------"
        value={verificationCode}
        onChangeText={setVerificationCode}
        error={errors.code}
        keyboardType="number-pad"
        maxLength={6}
      />
      <Button
        title="E-postayı Onayla"
        onPress={handleVerifyCode}
        loading={loading}
        style={styles.button}
      />
      <TouchableOpacity
        onPress={() => handleSendCode(true)}
        disabled={resendDisabled}
        style={styles.resendButton}
      >
        <Text style={[styles.footerLink, resendDisabled && styles.disabledText]}>
          {resendDisabled ? `${resendCooldown} saniye sonra tekrar gönder` : 'Tekrar Kod Gönder'}
        </Text>
      </TouchableOpacity>
    </>
  );

  // Şifre oluşturma adımını render eden fonksiyon
  const renderPasswordEntryStep = () => (
    <>
      <Text style={styles.subtitle}>
        Güçlü bir şifre oluşturun.
      </Text>
      <Input
        label="Şifre"
        placeholder="En az 6 karakter"
        value={formData.password || ''}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        error={errors.password}
        isPassword
        autoCapitalize="none"
      />
      <Input
        label="Şifre Tekrar"
        placeholder="Şifrenizi tekrar girin"
        value={formData.confirmPassword || ''}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        error={errors.confirmPassword}
        isPassword
        autoCapitalize="none"
      />
      <Button
        title="Devam Et"
        onPress={handlePasswordSubmit}
        style={styles.button}
      />
    </>
  );

  // Kişisel bilgi adımını render eden fonksiyon
  const renderUserInfoStep = () => (
    <>
      <Text style={styles.subtitle}>Seni biraz daha tanıyalım.</Text>
      <View style={styles.nameContainer}>
        <Input
          label="Ad"
          placeholder="Adınız"
          value={formData.firstName || ''}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          error={errors.firstName}
          containerStyle={styles.nameInput}
          autoCapitalize="words"
        />
        <Input
          label="Soyad"
          placeholder="Soyadınız"
          value={formData.lastName || ''}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          error={errors.lastName}
          containerStyle={styles.nameInput}
          autoCapitalize="words"
        />
      </View>
      <Input
        label="Doğum Tarihi"
        placeholder="YYYY-MM-DD"
        value={formData.birthDate || ''}
        onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
        error={errors.birthDate}
      />
       {errors.emailMatch && <Text style={styles.errorTextAlone}>{errors.emailMatch}</Text>}
      <Button
        title="Devam Et"
        onPress={handleUserInfoSubmit}
        style={styles.button}
      />
    </>
  );

  // Profil fotoğrafı adımını render eden fonksiyon
  const renderProfilePhotoStep = () => (
    <>
      <Text style={styles.subtitle}>İstersen bir profil fotoğrafı ekleyebilirsin.</Text>
      <View style={styles.photoSection}>
        <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
          {formData.profilePhoto ? (
            <Image source={{ uri: formData.profilePhoto }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <UserIcon size={48} color={colors.text.tertiary} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Camera size={20} color={colors.text.inverse} />
          </View>
        </TouchableOpacity>
      </View>
      <Button
        title="Devam Et"
        onPress={handleProfilePhotoSubmit}
        style={styles.button}
      />
      <TouchableOpacity onPress={handleProfilePhotoSubmit} style={styles.skipButton}>
         <Text style={styles.footerLink}>Şimdilik Atla</Text>
      </TouchableOpacity>
    </>
  );

  // Biyografi adımını render eden fonksiyon
  const renderBioStep = () => (
    <>
      <Text style={styles.subtitle}>Kendinden kısaca bahset (isteğe bağlı).</Text>
      <Input
        label="Biyografi"
        placeholder="Maksimum 50 karakter"
        value={formData.bio || ''}
        onChangeText={(text) => setFormData({ ...formData, bio: text })}
        maxLength={50}
        multiline
        numberOfLines={3}
        style={{ height: 80, textAlignVertical: 'top' }}
      />
      <Button
        title="Kaydı Tamamla"
        onPress={handleFinalRegister}
        loading={loading}
        style={styles.button}
      />
      <TouchableOpacity onPress={handleFinalRegister} style={styles.skipButton}>
         <Text style={styles.footerLink}>Atla ve Bitir</Text>
      </TouchableOpacity>
    </>
  );

  // Hangi adımın render edileceğini belirleyen fonksiyon
  const renderCurrentStep = () => {
    switch (step) {
      case 'EMAIL_ENTRY':
        return renderEmailEntryStep();
      case 'EMAIL_VERIFY':
        return renderEmailVerifyStep();
      case 'PASSWORD_ENTRY':
        return renderPasswordEntryStep();
      case 'USER_INFO':
        return renderUserInfoStep();
      case 'PROFILE_PHOTO':
        return renderProfilePhotoStep();
      case 'BIO':
        return renderBioStep();
      default:
        return renderEmailEntryStep();
    }
  };

  const getStepTitle = () => {
    switch(step) {
      case 'EMAIL_ENTRY': return 'Hesap Oluştur';
      case 'EMAIL_VERIFY': return 'E-postanı Doğrula';
      case 'PASSWORD_ENTRY': return 'Şifre Oluştur';
      case 'USER_INFO': return 'Seni Tanıyalım';
      case 'PROFILE_PHOTO': return 'Fotoğraf Ekle';
      case 'BIO': return 'Biyografi Ekle';
      default: return 'Hesap Oluştur';
    }
  }

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
            <Text style={styles.title}>{getStepTitle()}</Text>
          </View>

          <View style={styles.form}>
            {generalError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {renderCurrentStep()}

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
    marginBottom: spacing.lg, // Altyazı için boşluk
  },
  form: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  skipButton: {
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg,
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
  resendButton: {
    alignSelf: 'center',
  },
  disabledText: {
    color: colors.text.tertiary,
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
  errorTextAlone: {
    color: colors.error[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  // Fotoğraf stilleri
  photoSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
});
