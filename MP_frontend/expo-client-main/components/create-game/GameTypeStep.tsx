import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { sports } from '@/services/mockData';
import {
  Dribbble,
  Trophy,
  Volleyball,
  CircleDot,
  Table,
  Zap,
  Spade,
  Dice5,
  CircleStop,
  Waves,
  Footprints,
  Dumbbell
} from 'lucide-react-native';

interface GameTypeStepProps {
  selectedSportId: string;
  onSelect: (sportId: string, sportName: string) => void;
}

const iconMap: Record<string, any> = {
  basketball: Dribbble,
  soccer: Trophy,
  volleyball: Volleyball,
  tennis: CircleDot,
  'table-tennis': Table,
  badminton: Zap,
  chess: Spade,
  dice: Dice5,
  pool: CircleStop,
  swimmer: Waves,
  runner: Footprints,
  dumbbell: Dumbbell,
};

export default function GameTypeStep({ selectedSportId, onSelect }: GameTypeStepProps) {
  const teamSports = sports.filter((s) => s.category === 'team');
  const individualSports = sports.filter((s) => s.category === 'individual');
  const boardGames = sports.filter((s) => s.category === 'board');

  const renderSportCard = (sport: typeof sports[0]) => {
    const isSelected = sport.id === selectedSportId;
    const IconComponent = iconMap[sport.icon] || CircleDot;

    return (
      <TouchableOpacity
        key={sport.id}
        style={[styles.sportCard, isSelected && styles.sportCardSelected]}
        onPress={() => onSelect(sport.id, sport.name)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <IconComponent
            size={28}
            color={isSelected ? colors.primary[500] : colors.text.secondary}
          />
        </View>
        <Text style={[styles.sportName, isSelected && styles.sportNameSelected]}>
          {sport.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hangi oyunu oynayacaksınız?</Text>
      <Text style={styles.subtitle}>Oyun tipini seçin</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Takım Sporları</Text>
          <View style={styles.grid}>
            {teamSports.map(renderSportCard)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Bireysel Sporlar</Text>
          <View style={styles.grid}>
            {individualSports.map(renderSportCard)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.categoryTitle}>Masa & Kutu Oyunları</Text>
          <View style={styles.grid}>
            {boardGames.map(renderSportCard)}
          </View>
        </View>
      </ScrollView>
    </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  sportCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  sportCardSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  iconContainerSelected: {
    transform: [{ scale: 1.1 }],
  },
  sportName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
});
