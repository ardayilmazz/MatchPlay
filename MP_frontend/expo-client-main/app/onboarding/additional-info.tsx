import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { sports, skillLevels } from '@/services/mockData';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Picker from '@/components/Picker';
import AppBackground from '@/components/AppBackground';

export default function AdditionalInfoScreen() {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedSports, setSelectedSports] = useState<string[]>(user?.sports || []);
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || '');
  const [loading, setLoading] = useState(false);

  const skillLevelOptions = skillLevels.map((level) => ({
    label: level.label,
    value: level.value,
  }));

  const toggleSport = (sportName: string) => {
    if (selectedSports.includes(sportName)) {
      setSelectedSports(selectedSports.filter((s) => s !== sportName));
    } else {
      setSelectedSports([...selectedSports, sportName]);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    const result = await updateUser({
      ...user,
      bio: bio.trim() || undefined,
      sports: selectedSports,
      skillLevel: (skillLevel as 'beginner' | 'intermediate' | 'advanced') || undefined,
    });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Hata', result.message || 'Profil güncellenemedi');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>İlgi Alanların</Text>
            <Text style={styles.subtitle}>Bu adımlar isteğe bağlı</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Hakkımda (İsteğe Bağlı)"
              placeholder="Kendini kısaca tanıt..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.bioInput}
            />

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>İlgilendiğin Sporlar (İsteğe Bağlı)</Text>
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
              label="Yetenek Seviyesi (İsteğe Bağlı)"
              placeholder="Seçiniz"
              options={skillLevelOptions}
              value={skillLevel}
              onValueChange={setSkillLevel}
            />

            <Button
              title="Tamamla"
              onPress={handleComplete}
              loading={loading}
              style={styles.completeButton}
            />

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Şimdilik Atla</Text>
            </TouchableOpacity>
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
  backButton: {
    marginBottom: spacing.lg,
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
    fontFamily: typography.fontFamily.medium,
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
    backgroundColor: colors.primary[900],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  sportChipSelected: {
    backgroundColor: colors.secondary[400],
    borderColor: colors.secondary[400],
  },
  sportChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.medium,
  },
  sportChipTextSelected: {
    color: colors.neutral[0],
  },
  completeButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  skipText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.medium,
  },
  });
}
