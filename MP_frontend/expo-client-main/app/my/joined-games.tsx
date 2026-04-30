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
  UserCheck,
} from 'lucide-react-native';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';

export default function JoinedGamesScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadGames = async () => {
    try {
      if (!user?.token) return;
      const fetchedGames = await gameService.fetchJoinedGameSessions(user.token);
      setGames(fetchedGames);
    } catch (error) {
      console.error('Katıldığım oyunlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Katıldığınız oyunlar yüklenemedi');
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
    router.push(`/my/joined-games/${game._id}` as any);
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
          <UserCheck size={20} color={colors.primary[500]} />
        </View>

        <View style={styles.gameInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>{formatDate(game.startDate)}</Text>
          </View>

          {game.estimatedDuration ? (
            <View style={styles.infoRow}>
              <Clock size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{game.estimatedDuration} dk</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Users size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {currentPlayers}/{totalPlayers} kişi
            </Text>
          </View>

          {(game.cityName || game.venueName) && (
            <View style={styles.infoRow}>
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {game.venueName || game.cityName}
              </Text>
            </View>
          )}
        </View>

        {game.feeAmount && game.feeAmount > 0 ? (
          <View style={styles.feeTag}>
            <Text style={styles.feeText}>{game.feeAmount} TL (Kişi başı)</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Katıldığım Oyunlar',
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontFamily: typography.fontFamily.semibold,
            fontSize: typography.sizes.lg,
            color: colors.text.primary,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : games.length === 0 ? (
        <View style={styles.centerContainer}>
          <UserCheck size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Henüz katıldığınız oyun yok</Text>
          <Text style={styles.emptyText}>
            Keşfet sayfasından oyunlara katılma isteği gönderin ve kabul edildiğinde
            oyunlar burada görünecek
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.gamesContainer}>
            {games.map((game) => renderGameCard(game))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  gamesContainer: {
    padding: spacing.lg,
  },
  gameCard: {
    backgroundColor: colors.background.secondary,
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
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameType: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontFamily: typography.fontFamily.medium,
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
    flex: 1,
  },
  feeTag: {
    marginTop: spacing.md,
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  feeText: {
    fontSize: typography.sizes.sm,
    color: colors.success[700],
    fontFamily: typography.fontFamily.medium,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
}
