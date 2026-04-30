import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { X } from 'lucide-react-native';
import Button from '@/components/Button';

interface SkillLevelModalProps {
  visible: boolean;
  initialSkillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
  onClose: () => void;
  onSave: (skillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel') => void;
}

const SKILL_LEVELS = [
  { value: 'ilk_defa', label: 'İlk Defa Oynayacaklar', icon: '🌱', description: 'Oyunu hiç oynamamış' },
  { value: 'az_bilenler', label: 'Az Çok Bilenler', icon: '🌿', description: 'Temel kuralları biliyor' },
  { value: 'orta', label: 'Ortalama Oyuncular', icon: '🌳', description: 'Düzenli oynuyor' },
  { value: 'iyi', label: 'İyi Oyuncular', icon: '⭐', description: 'Deneyimli ve yetenekli' },
  { value: 'profesyonel', label: 'Profesyonel Oyuncular', icon: '🏆', description: 'Uzman seviyede' },
];

export default function SkillLevelModal({
  visible,
  initialSkillLevel,
  onClose,
  onSave,
}: SkillLevelModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [skillLevel, setSkillLevel] = useState(initialSkillLevel || 'orta');

  const handleSave = () => {
    onSave(skillLevel as any);
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
            <Text style={styles.modalTitle}>Yetenek Seviyesi</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.skillGrid}>
              {SKILL_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.skillCard,
                    skillLevel === level.value && styles.skillCardSelected,
                  ]}
                  onPress={() => setSkillLevel(level.value as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skillIcon}>{level.icon}</Text>
                  <View style={styles.skillTextContainer}>
                    <Text
                      style={[
                        styles.skillLabel,
                        skillLevel === level.value && styles.skillLabelSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    <Text style={styles.skillDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Button title="Kaydet" onPress={handleSave} style={styles.saveButton} />
          </ScrollView>
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
    maxHeight: '80%',
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
  scrollView: {
    maxHeight: 500,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  skillGrid: {
    gap: spacing.sm,
  },
  skillCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  skillIcon: {
    fontSize: 32,
  },
  skillTextContainer: {
    flex: 1,
  },
  skillLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  skillLabelSelected: {
    color: colors.primary[500],
  },
  skillDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  });
}
