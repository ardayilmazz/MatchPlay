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
import { ChevronLeft, Camera, User } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { universities, departments, sports, skillLevels } from '@/services/mockData';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Picker from '@/components/Picker';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedSports, setSelectedSports] = useState<string[]>(user?.sports || []);
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || '');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
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

  const skillLevelOptions = skillLevels.map((level) => ({
    label: level.label,
    value: level.value,
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
    }
  };

  const toggleSport = (sportName: string) => {
    if (selectedSports.includes(sportName)) {
      setSelectedSports(selectedSports.filter((s) => s !== sportName));
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const validate = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
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

  const handleSave = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    try {
      const result = await updateUser({
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePhoto: profilePhoto || undefined,
        university,
        department,
        bio: bio.trim() || undefined,
        sports: selectedSports,
        skillLevel: (skillLevel as 'beginner' | 'intermediate' | 'advanced') || undefined,
      });

      setLoading(false);

      if (!result.success) {
        Alert.alert('Hata', result.message || 'Profil güncellenemedi');
      } else {
        router.back();
      }
    } catch (error) {
      setLoading(false);
      console.error('Save error:', error);
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profili Düzenle</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
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
                <Camera size={20} color={colors.text.inverse} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
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

            <Input
              label="Hakkımda"
              placeholder="Kendini kısaca tanıt..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>İlgilendiğin Sporlar</Text>
              <View style={styles.sportsGrid}>
                {sports.map((sport) => (
                  <TouchableOpacity
                    key={sport.id}
                    style={[
                      styles.sportChip,
                      selectedSports.includes(sport.name) && styles.sportChipSelected,
                    ]}
                    onPress={() => toggleSport(sport.name)}>
                    <Text
                      style={[
                        styles.sportChipText,
                        selectedSports.includes(sport.name) && styles.sportChipTextSelected,
                      ]}>
                      {sport.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Picker
              label="Yetenek Seviyesi"
              placeholder="Seçiniz"
              options={skillLevelOptions}
              value={skillLevel}
              onValueChange={setSkillLevel}
            />

            <Button
              title="Kaydet"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  scrollContent: {
    padding: spacing.xl,
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
  form: {
    flex: 1,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sportChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  sportChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  sportChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  sportChipTextSelected: {
    color: colors.text.inverse,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
