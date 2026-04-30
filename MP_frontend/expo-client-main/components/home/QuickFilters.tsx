import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useMemo } from 'react';
import { Calendar, MapPin, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography } from '@/constants/theme';

export type QuickFilterType = 'today' | 'tomorrow' | 'week' | 'nearby' | 'instant';

interface QuickFiltersProps {
  activeFilter: QuickFilterType | null;
  onFilterPress: (filter: QuickFilterType) => void;
  nearbyCount?: number;
  instantCount?: number;
}

export default function QuickFilters({ activeFilter, onFilterPress, nearbyCount, instantCount }: QuickFiltersProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
                color={isActive ? colors.neutral[0] : colors.secondary[400]}
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

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 0,
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterButtonActive: {
    backgroundColor: colors.secondary[400],
    borderColor: colors.secondary[400],
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.neutral[0],
  },
  countBadge: {
    backgroundColor: colors.secondary[400],
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
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  countTextActive: {
    color: colors.primary[900],
  },
  });
}
