import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { GameSkillLevel } from '@/types';
import { gameSkillLevels } from '@/services/mockData';
import Button from '@/components/Button';
import { Users, Minus, Plus } from 'lucide-react-native';

interface PlayersStepProps {
  totalPlayers: number;
  skillLevel: GameSkillLevel;
  onNext: (totalPlayers: number, skillLevel: GameSkillLevel) => void;
}

export default function PlayersStep({
  totalPlayers: initialPlayers,
  skillLevel: initialSkillLevel,
  onNext,
}: PlayersStepProps) {
  const [totalPlayers, setTotalPlayers] = useState(initialPlayers);
  const [skillLevel, setSkillLevel] = useState<GameSkillLevel>(initialSkillLevel);

  const incrementPlayers = () => {
    if (totalPlayers < 50) {
      setTotalPlayers(totalPlayers + 1);
    }
  };

  const decrementPlayers = () => {
    if (totalPlayers > 2) {
      setTotalPlayers(totalPlayers - 1);
    }
  };

  const handleNext = () => {
    onNext(totalPlayers, skillLevel);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kaç kişi oynayacak?</Text>
      <Text style={styles.subtitle}>Oyuncu sayısı ve seviye bilgisi</Text>

      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.label}>Toplam Oyuncu Sayısı</Text>
          <View style={styles.playerCounter}>
            <TouchableOpacity
              style={[styles.counterButton, totalPlayers <= 2 && styles.counterButtonDisabled]}
              onPress={decrementPlayers}
              disabled={totalPlayers <= 2}
            >
              <Minus size={24} color={totalPlayers <= 2 ? colors.text.tertiary : colors.primary[500]} />
            </TouchableOpacity>

            <View style={styles.counterDisplay}>
              <Users size={24} color={colors.primary[500]} />
              <Text style={styles.counterText}>{totalPlayers}</Text>
              <Text style={styles.counterLabel}>Oyuncu</Text>
            </View>

            <TouchableOpacity
              style={[styles.counterButton, totalPlayers >= 50 && styles.counterButtonDisabled]}
              onPress={incrementPlayers}
              disabled={totalPlayers >= 50}
            >
              <Plus size={24} color={totalPlayers >= 50 ? colors.text.tertiary : colors.primary[500]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Minimum 2, maksimum 50 oyuncu</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Oyun Seviyesi</Text>
          <Text style={styles.helperText}>
            Oyunculardan beklenen seviye nedir?
          </Text>
          <View style={styles.skillLevelGrid}>
            {gameSkillLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.skillLevelCard,
                  skillLevel === level.value && styles.skillLevelCardSelected,
                ]}
                onPress={() => setSkillLevel(level.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.skillLevelText,
                    skillLevel === level.value && styles.skillLevelTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title="Devam Et"
          onPress={handleNext}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  form: {
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  helperText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  playerCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: colors.neutral[100],
  },
  counterDisplay: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  counterText: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  counterLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  skillLevelGrid: {
    gap: spacing.sm,
  },
  skillLevelCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  skillLevelCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  skillLevelText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  skillLevelTextSelected: {
    color: colors.primary[500],
    fontFamily: typography.fontFamily.semibold,
  },
  button: {
    marginTop: spacing.lg,
  },
});
