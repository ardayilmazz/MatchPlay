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
  Trash2,
  Edit,
  ChevronLeft,
  UserPlus,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService, GameSessionDraft } from '@/services/gameService';
import { cancellationVoteService } from '@/services/cancellationVoteService';
import { useAuth } from '@/contexts/AuthContext';
import { homeCacheService } from '@/utils/homeCache';
import { API_URL } from '@/config/api';

export default function MyGamesScreen() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadGames = async () => {
    try {
      if (!user?.token) return;
      const fetchedGames = await gameService.fetchMyGameSessions(user.token);
      setGames(fetchedGames);
    } catch (error) {
      console.error('Oyunlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Oyunlar yüklenemedi');
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

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    try {
      if (!user?.token) return;

      // Önce oyunu silmeyi dene
      const response = await fetch(`${API_URL}/games/sessions/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      // Eğer oylama gerekiyorsa
      if (!data.success && data.requiresVote) {
        Alert.alert(
          'Oyunu İptal Et',
          `Buluşmaya 3 saatten az bir süre kaldığı için katılımcıların izni olmadan buluşma iptal edilemez.`,
          [
            { text: 'Vazgeç', style: 'cancel' },
            {
              text: 'İptal için Oyla',
              style: 'default',
              onPress: async () => {
                try {
                  await cancellationVoteService.initiateCancellationVote(gameId, user!.token!);
                  Alert.alert(
                    'Oylama Başlatıldı',
                    'Katılımcılara iptal oylaması bildirimi gönderildi. Tüm katılımcılar onaylarsa oyun iptal edilecek.'
                  );
                  await loadGames();
                } catch (error: any) {
                  Alert.alert('Hata', error.message || 'Oylama başlatılamadı');
                }
              },
            },
          ]
        );
        return;
      }

      // Oylama gerekmiyorsa veya başarılıysa
      if (data.success) {
        await loadGames();
        await homeCacheService.clearCache();
        console.log('[MyGames] Home cache cleared after deleting game');
        Alert.alert('Başarılı', 'Oyun iptal edildi');
      } else {
        throw new Error(data.message || 'Oyun iptal edilemedi');
      }
    } catch (error: any) {
      console.error('Oyun silinirken hata:', error);
      Alert.alert('Hata', error.message || 'Oyun iptal edilemedi');
    }
  };

  const handleEditGame = (game: any) => {
    router.push(`/my/games/${game._id}` as any);
  };

  const handleViewRequests = (gameId: string) => {
    router.push({
      pathname: `/my/games/${gameId}/requests` as any,
      params: { from: 'profile' }
    });
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

  const renderGameCard = (game: any) => {
    const isFull = game.status === 'full' || game.neededPlayers === 0;
    
    return (
      <View key={game._id} style={styles.gameCard}>
        {isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>Doldu!</Text>
          </View>
        )}
        <View style={styles.gameHeader}>
          <View style={styles.gameHeaderLeft}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameType}>{game.gameType?.name || 'Oyun'}</Text>
          </View>
        <View style={styles.gameActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewRequests(game._id)}
          >
            <UserPlus size={20} color={colors.secondary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditGame(game)}
          >
            <Edit size={20} color={colors.primary[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteGame(game._id, game.title)}
          >
            <Trash2 size={20} color={colors.error[500]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>{formatDate(game.startDate)}</Text>
        </View>

        {game.duration && (
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>{game.duration} dk</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Users size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>
            {(game.totalPlayers || 0) - (game.neededPlayers || 0)}/{game.totalPlayers} kişi
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

      {game.hasFee && game.feeAmount && (
        <View style={styles.feeTag}>
          <Text style={styles.feeText}>{game.feeAmount} TL (Kişi başı)</Text>
        </View>
      )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Planladığım Oyunlar',
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
          <Calendar size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Henüz oyun planlamadınız</Text>
          <Text style={styles.emptyText}>
            Yeni oyun oluşturmak için Ana Sayfa'daki "Oyun Oluştur" butonunu kullanın
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
    position: 'relative',
    overflow: 'hidden',
  },
  fullBadge: {
    position: 'absolute',
    bottom: 18,
    right: -25,
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-45deg' }],
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fullBadgeText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
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
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameType: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  gameActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
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
    fontWeight: typography.weights.medium,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
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

