import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { universities, departments } from '@/services/mockData';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Picker from '@/components/Picker';
import AppBackground from '@/components/AppBackground';

export default function BasicInfoScreen() {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
    university?: string;
    department?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const universityOptions = universities.map((uni) => ({
    label: uni.name,
    value: uni.name,
  }));

  const departmentOptions = departments.map((dept) => ({
    label: dept.name,
    value: dept.name,
  }));

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
      setErrors({ ...errors, profilePhoto: undefined });
    }
  };

  const validate = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      profilePhoto?: string;
      university?: string;
      department?: string;
    } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }

    if (!university) {
      newErrors.university = 'Üniversite seçimi gereklidir';
    }

    if (!department) {
      newErrors.department = 'Bölüm seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    const result = await updateUser({
      ...user,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profilePhoto,
      university,
      department,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Hata', result.message || 'Profil güncellenemedi');
    } else {
      router.push('/onboarding/additional-info');
    }
  };

  return (
    <AppBackground>
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Profilini Oluştur</Text>
            <Text style={styles.subtitle}>Seni tanıyalım</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <User size={48} color={colors.text.tertiary} />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Camera size={20} color={colors.neutral[0]} />
                </View>
              </TouchableOpacity>
              {errors.profilePhoto && (
                <Text style={styles.photoError}>{errors.profilePhoto}</Text>
              )}
            </View>

            <Input
              label="Ad"
              placeholder="Adınız"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setErrors({ ...errors, firstName: undefined });
              }}
              error={errors.firstName}
              autoCapitalize="words"
            />

            <Input
              label="Soyad"
              placeholder="Soyadınız"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setErrors({ ...errors, lastName: undefined });
              }}
              error={errors.lastName}
              autoCapitalize="words"
            />

            <Picker
              label="Üniversite"
              placeholder="Üniversite seçiniz"
              options={universityOptions}
              value={university}
              onValueChange={(value) => {
                setUniversity(value);
                setErrors({ ...errors, university: undefined });
              }}
              error={errors.university}
              searchable
            />

            <Picker
              label="Bölüm"
              placeholder="Bölüm seçiniz"
              options={departmentOptions}
              value={department}
              onValueChange={(value) => {
                setDepartment(value);
                setErrors({ ...errors, department: undefined });
              }}
              error={errors.department}
              searchable
            />

            <Button
              title="Devam Et"
              onPress={handleContinue}
              loading={loading}
              style={styles.continueButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary[400],
  },
  form: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    backgroundColor: colors.primary[900],
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
    backgroundColor: colors.secondary[400],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.secondary,
  },
  photoError: {
    fontSize: typography.sizes.sm,
    color: colors.error[500],
    marginTop: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
  });
}
