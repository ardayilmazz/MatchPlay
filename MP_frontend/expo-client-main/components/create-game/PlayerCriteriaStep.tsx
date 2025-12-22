import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import Button from '@/components/Button';
import { UserCheck } from 'lucide-react-native';

interface PlayerCriteriaStepProps {
  genderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli';
  onNext: (genderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli') => void;
}

const GENDER_OPTIONS = [
  {
    value: 'herkes',
    label: 'Herkes Katılabilir',
    icon: '👥',
    description: 'Cinsiyet tercihi yok',
  },
  {
    value: 'kizlar',
    label: 'Sadece Kızlar',
    icon: '👩',
    description: 'Sadece kadın oyuncular',
  },
  {
    value: 'erkekler',
    label: 'Sadece Erkekler',
    icon: '👨',
    description: 'Sadece erkek oyuncular',
  },
  {
    value: 'karma_dengeli',
    label: 'Karma (Dengeli)',
    icon: '⚖️',
    description: 'Dengeli cinsiyet dağılımı',
  },
];

export default function PlayerCriteriaStep({
  genderPreference: initialGenderPreference,
  onNext,
}: PlayerCriteriaStepProps) {
  const [genderPreference, setGenderPreference] = useState(
    initialGenderPreference || 'herkes'
  );

  const handleNext = () => {
    onNext(genderPreference);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Oyuncu kriterleri</Text>
      <Text style={styles.subtitle}>Kimin katılabileceğini belirleyin</Text>

      <View style={styles.form}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserCheck size={20} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>Cinsiyet Tercihi</Text>
          </View>

          <View style={styles.optionsGrid}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  genderPreference === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setGenderPreference(option.value as any)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    genderPreference === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Bu tercih, oyununuza katılmak isteyen kullanıcıları filtrelemek için
            kullanılacaktır.
          </Text>
        </View>

        <Button title="Devam Et" onPress={handleNext} style={styles.button} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  optionsGrid: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  optionIcon: {
    fontSize: 32,
  },
  optionLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  optionLabelSelected: {
    color: colors.primary[500],
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.sm,
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.lg,
  },
});

