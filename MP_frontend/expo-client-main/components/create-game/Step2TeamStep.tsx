import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { ChevronRight, Check } from 'lucide-react-native';
import Button from '@/components/Button';
import TeamPlayersModal from './modals/TeamPlayersModal';
import SkillLevelModal from './modals/SkillLevelModal';
import GenderPreferenceModal from './modals/GenderPreferenceModal';

interface Step2TeamStepProps {
  totalPlayers: number;
  neededPlayers: number;
  skillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
  genderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli';
  autoCancelIfNotFull?: boolean;
  onPlayersUpdate: (data: { totalPlayers: number; neededPlayers: number; autoCancelIfNotFull?: boolean }) => void;
  onSkillLevelUpdate: (skillLevel: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel') => void;
  onGenderUpdate: (genderPreference: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli') => void;
  onNext: () => void;
}

const SKILL_LEVEL_LABELS: Record<string, string> = {
  ilk_defa: 'İlk Defa Oynayacaklar',
  az_bilenler: 'Az Çok Bilenler',
  orta: 'Ortalama Oyuncular',
  iyi: 'İyi Oyuncular',
  profesyonel: 'Profesyonel Oyuncular',
};

const GENDER_LABELS: Record<string, string> = {
  herkes: 'Herkes Katılabilir',
  kizlar: 'Sadece Kızlar',
  erkekler: 'Sadece Erkekler',
  karma_dengeli: 'Karma (Dengeli)',
};

export default function Step2TeamStep({
  totalPlayers,
  neededPlayers,
  skillLevel,
  genderPreference,
  autoCancelIfNotFull = false,
  onPlayersUpdate,
  onSkillLevelUpdate,
  onGenderUpdate,
  onNext,
}: Step2TeamStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Ekip</Text>
      <Text style={styles.subtitle}>Takım ayarlarını belirleyin</Text>

      <View style={styles.sections}>
        {/* 1. Oyuncular (Zorunlu) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowPlayersModal(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Oyuncular*</Text>
              <View style={styles.selectedInfo}>
                <Check size={16} color={colors.success[500]} />
                <Text style={styles.selectedText}>
                  Toplam {totalPlayers}, İhtiyaç {neededPlayers}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 2. Yetenek Seviyesi (İsteğe Bağlı) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowSkillModal(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Yetenek Seviyesi</Text>
              <View style={styles.selectedInfo}>
                <Check size={16} color={colors.success[500]} />
                <Text style={styles.selectedText}>
                  {SKILL_LEVEL_LABELS[skillLevel]}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* 3. Cinsiyet Tercihi (İsteğe Bağlı) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionButton}
            onPress={() => setShowGenderModal(true)}
          >
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>Cinsiyet Tercihi</Text>
              <View style={styles.selectedInfo}>
                <Check size={16} color={colors.success[500]} />
                <Text style={styles.selectedText}>
                  {GENDER_LABELS[genderPreference]}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Button title="Devam Et" onPress={onNext} style={styles.button} />
      </View>

      {/* Modals */}
      <TeamPlayersModal
        visible={showPlayersModal}
        initialTotalPlayers={totalPlayers}
        initialNeededPlayers={neededPlayers}
        initialAutoCancelIfNotFull={autoCancelIfNotFull}
        onClose={() => setShowPlayersModal(false)}
        onSave={onPlayersUpdate}
      />

      <SkillLevelModal
        visible={showSkillModal}
        initialSkillLevel={skillLevel}
        onClose={() => setShowSkillModal(false)}
        onSave={onSkillLevelUpdate}
      />

      <GenderPreferenceModal
        visible={showGenderModal}
        initialGenderPreference={genderPreference}
        onClose={() => setShowGenderModal(false)}
        onSave={onGenderUpdate}
      />
    </ScrollView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  sections: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sectionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedText: {
    fontSize: typography.sizes.sm,
    color: colors.success[500],
    fontFamily: typography.fontFamily.medium,
  },
  button: {
    marginTop: spacing.lg,
  },
  });
}
