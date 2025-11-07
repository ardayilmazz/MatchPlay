import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Zap } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { Game } from '@/types';
import GameCard from '@/components/GameCard';
import Button from '@/components/Button';
import { router } from 'expo-router';

interface InstantGamesSectionProps {
  games: Game[];
  isLoading?: boolean;
}

export default function InstantGamesSection({ games, isLoading }: InstantGamesSectionProps) {
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
            <Zap size={20} color={colors.secondary[500]} />
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
            <Zap size={20} color={colors.secondary[500]} />
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
          <Zap size={20} color={colors.secondary[500]} />
          <Text style={styles.title}>Anlık Oyunlar</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{games.length}</Text>
          </View>
        </View>
        {games.length > 3 && (
          <Pressable onPress={handleViewAll}>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
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

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.neutral[0],
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  cardWrapper: {
    width: 320,
    marginRight: spacing.md,
  },
  emptyContainer: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  createButton: {
    minWidth: 150,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
