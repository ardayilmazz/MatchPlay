import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Calendar, MapPin, Zap } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

export type QuickFilterType = 'today' | 'tomorrow' | 'week' | 'nearby' | 'instant';

interface QuickFiltersProps {
  activeFilter: QuickFilterType | null;
  onFilterPress: (filter: QuickFilterType) => void;
  nearbyCount?: number;
  instantCount?: number;
}

export default function QuickFilters({ activeFilter, onFilterPress, nearbyCount, instantCount }: QuickFiltersProps) {
  const filters = [
    {
      id: 'today' as QuickFilterType,
      label: 'Bugün',
      icon: Calendar,
    },
    {
      id: 'tomorrow' as QuickFilterType,
      label: 'Yarın',
      icon: Calendar,
    },
    {
      id: 'week' as QuickFilterType,
      label: 'Bu Hafta',
      icon: Calendar,
    },
    {
      id: 'nearby' as QuickFilterType,
      label: 'Yakınımdaki',
      icon: MapPin,
      count: nearbyCount,
    },
    {
      id: 'instant' as QuickFilterType,
      label: 'Anlık',
      icon: Zap,
      count: instantCount,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          const Icon = filter.icon;

          return (
            <Pressable
              key={filter.id}
              style={({ pressed }) => [
                styles.filterButton,
                isActive && styles.filterButtonActive,
                pressed && styles.filterButtonPressed,
              ]}
              onPress={() => onFilterPress(filter.id)}
            >
              <Icon
                size={16}
                color={isActive ? colors.neutral[0] : colors.primary[500]}
              />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {filter.label}
              </Text>
              {filter.count !== undefined && filter.count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  filterTextActive: {
    color: colors.neutral[0],
  },
  countBadge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: colors.neutral[0],
  },
  countText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.neutral[0],
  },
  countTextActive: {
    color: colors.primary[500],
  },
});
