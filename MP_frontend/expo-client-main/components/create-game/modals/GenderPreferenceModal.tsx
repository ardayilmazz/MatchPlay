import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { X } from 'lucide-react-native';
import Button from '@/components/Button';

interface GenderPreferenceModalProps {
  visible: boolean;
  initialGenderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli';
  onClose: () => void;
  onSave: (genderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli') => void;
}

const GENDER_OPTIONS = [
  { value: 'herkes', label: 'Herkes Katılabilir', icon: '🌍', description: 'Cinsiyet tercihi yok' },
  { value: 'kizlar', label: 'Sadece Kızlar', icon: '👩', description: 'Sadece kadın oyuncular' },
  { value: 'erkekler', label: 'Sadece Erkekler', icon: '👨', description: 'Sadece erkek oyuncular' },
  { value: 'karma_dengeli', label: 'Karma (Dengeli)', icon: '👥', description: 'Dengeli cinsiyet dağılımı' },
];

export default function GenderPreferenceModal({
  visible,
  initialGenderPreference,
  onClose,
  onSave,
}: GenderPreferenceModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [genderPreference, setGenderPreference] = useState(initialGenderPreference || 'herkes');

  const handleSave = () => {
    onSave(genderPreference);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cinsiyet Tercihi</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
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
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        genderPreference === option.value && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  content: {
    gap: spacing.lg,
  },
  optionsGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
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
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  optionLabelSelected: {
    color: colors.primary[500],
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  });
}
