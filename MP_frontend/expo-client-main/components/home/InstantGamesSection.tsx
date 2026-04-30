import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useMemo } from 'react';
import { Zap, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { Game } from '@/types';
import GameCard from '@/components/GameCard';
import Button from '@/components/Button';
import { router } from 'expo-router';

interface InstantGamesSectionProps {
  games: Game[];
  isLoading?: boolean;
}

export default function InstantGamesSection({ games, isLoading }: InstantGamesSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleGamePress = (game: Game) => {
    router.push(`/game/${game.id}` as any);
  };

  const handleViewAll = () => {
    router.push('/(tabs)/discover');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Zap size={20} color={colors.secondary[400]} />
            <Text style={styles.title}>Anlık Oyunlar</Text>
          </View>
        </View>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (games.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Zap size={20} color={colors.secondary[400]} />
            <Text style={styles.title}>Anlık Oyunlar</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Yakınınızda önümüzdeki 2 saat içinde başlayacak oyun bulunamadı.
          </Text>
          <Button
            title="Yeni Oyun Oluştur"
            onPress={() => router.push('/(tabs)/create')}
            size="small"
            style={styles.createButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Zap size={20} color={colors.secondary[400]} />
          <Text style={styles.title}>Anlık Oyunlar</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{games.length}</Text>
          </View>
        </View>
        {games.length > 3 && (
          <Pressable
            onPress={handleViewAll}
            style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
            <ChevronRight size={16} color={colors.secondary[400]} />
          </Pressable>
        )}
      </View>
      <Text style={styles.subtitle}>
        Önümüzdeki 2 saat içinde başlayacak ve yakınınızdaki oyunlar
      </Text>
      <FlatList
        horizontal
        data={games.slice(0, 5)}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <GameCard game={item} onPress={handleGamePress} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.secondary[400],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.secondary[400],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  cardWrapper: {
    width: 320,
    marginRight: spacing.md,
  },
  emptyContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.cardLarge,
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  createButton: {
    minWidth: 150,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  });
}
