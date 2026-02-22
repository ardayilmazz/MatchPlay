import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';

export default function CompletedGamesScreen() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadGames = async () => {
    try {
      if (!user?.token) return;
      const fetchedGames = await gameService.fetchCompletedGames(user.token);
      setGames(fetchedGames);
    } catch (error) {
      console.error('Geçmiş oyunlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Geçmiş oyunlarınız yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleGamePress = (game: any) => {
    router.push(`/my/completed-games/${game._id}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} - ${hours}:${minutes}`;
  };

  const getAcceptedPlayersCount = (game: any) => {
    return game.acceptedPlayers?.length || 0;
  };

  const renderGameCard = (game: any) => {
    const acceptedCount = getAcceptedPlayersCount(game);
    const totalPlayers = game.totalPlayers || 2;
    const currentPlayers = acceptedCount + 1;

    return (
      <TouchableOpacity
        key={game._id}
        style={styles.gameCard}
        onPress={() => handleGamePress(game)}
        activeOpacity={0.7}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameHeaderLeft}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameType}>
              {game.gameTypeId?.name || game.gameType?.name || 'Oyun'}
            </Text>
          </View>
          <CheckCircle size={20} color={colors.success[500]} />
        </View>

        <View style={styles.gameInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(game.startDate)}</Text>
          </View>

          {game.estimatedDuration ? (
            <View style={styles.infoRow}>
              <Clock size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{game.estimatedDuration} dakika</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {game.venueName || game.districtName || game.cityName || 'Konum belirtilmemiş'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {currentPlayers}/{totalPlayers} Oyuncu
            </Text>
          </View>
        </View>

        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>Tamamlandı</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Geçmiş Oyunlar',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: spacing.sm }}>
                <ChevronLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Geçmiş Oyunlar',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: spacing.sm }}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {games.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>Henüz tamamlanmış oyununuz yok</Text>
            <Text style={styles.emptySubtext}>
              Oynadığınız oyunlar burada görünecek
            </Text>
          </View>
        ) : (
          <View style={styles.gamesContainer}>
            {games.map((game) => renderGameCard(game))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamesContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  gameCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  gameHeaderLeft: {
    flex: 1,
  },
  gameTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameType: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  gameInfo: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  completedBadge: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success[100],
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.success[700],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
