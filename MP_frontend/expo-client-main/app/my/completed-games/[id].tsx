import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  User,
  Trash2,
  Star,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import PlayerProfileModal from '@/components/PlayerProfileModal';
import { ratingService } from '@/services/ratingService';

export default function CompletedGameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerRatings, setPlayerRatings] = useState<Record<string, number | null>>({});

  const loadGameDetails = async () => {
    try {
      if (!id || typeof id !== 'string') return;
      const gameData = await gameService.fetchGameSession(id);
      setGame(gameData);

      // Tüm katılımcılar için bu oyundaki ortalama puanları yükle
      const ratings: Record<string, number | null> = {};
      const allPlayers: Array<any> = [];
      
      if (gameData.creatorId) {
        allPlayers.push(gameData.creatorId);
      }
      
      if (gameData.acceptedPlayers && Array.isArray(gameData.acceptedPlayers)) {
        allPlayers.push(...gameData.acceptedPlayers);
      }

      for (const player of allPlayers) {
        if (!player) continue;
        const playerId = (typeof player === 'object' && player._id) ? player._id : (typeof player === 'object' && player.id) ? player.id : (typeof player === 'string') ? player : null;
        if (playerId) {
          try {
            const ratingData = await ratingService.getGameUserAverageRating(id, playerId);
            ratings[playerId] = ratingData.averageRating;
          } catch (error) {
            console.error(`[CompletedGameDetailScreen] Rating yüklenirken hata (${playerId}):`, error);
            ratings[playerId] = null;
          }
        }
      }

      setPlayerRatings(ratings);
    } catch (error) {
      console.error('Oyun detayı yüklenirken hata:', error);
      Alert.alert('Hata', 'Oyun detayı yüklenemedi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameDetails();
  }, [id]);

  const handleDeleteGame = async () => {
    if (!game || !user?.token) return;

    Alert.alert(
      'Oyunu Sil',
      'Bu oyunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await gameService.deleteCompletedGame(game._id, user!.token!);
              Alert.alert('Başarılı', 'Oyun silindi', [
                {
                  text: 'Tamam',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Oyun silinirken hata oluştu');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer({
      _id: player._id,
      firstName: player.firstName,
      lastName: player.lastName,
      profilePhoto: player.profilePhoto,
      gender: player.gender,
      birthDate: player.birthDate,
    });
    setShowPlayerModal(true);
  };

  const handleRatingPress = () => {
    if (id && typeof id === 'string') {
      router.push(`/rating/${id}` as any);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      ilk_defa: 'İlk defa oynayacaklar',
      az_bilenler: 'Az çok bilenler',
      orta: 'Ortalama oyuncular',
      iyi: 'İyi oyuncular',
      profesyonel: 'Profesyonel oyuncular',
    };
    return labels[level] || level || 'Belirtilmemiş';
  };

  const getGenderLabel = (preference: string) => {
    const labels: Record<string, string> = {
      herkes: 'Herkes Katılabilir',
      kizlar: 'Sadece Kızlar',
      erkekler: 'Sadece Erkekler',
      karma_dengeli: 'Karma (Dengeli)',
    };
    return labels[preference] || 'Herkes Katılabilir';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Oyun bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  const creator = game.creatorId;
  const acceptedPlayers = game.acceptedPlayers || [];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Oyun Detayı',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: spacing.sm }}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>Tamamlanmış Oyun</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lobi Bilgileri</Text>
            <View style={styles.infoCard}>
              <Text style={styles.lobbyName}>{game.title}</Text>
              <Text style={styles.gameType}>
                {game.gameTypeId?.name || game.gameType?.name || 'Oyun'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konum ve Zaman</Text>
            <View style={styles.infoCard}>
              <View style={styles.detailRow}>
                <Calendar size={20} color={colors.text.secondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Tarih</Text>
                  <Text style={styles.detailValue}>{formatDate(game.startDate)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Clock size={20} color={colors.text.secondary} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Saat</Text>
                  <Text style={styles.detailValue}>{formatTime(game.startDate)}</Text>
                </View>
              </View>

              {game.estimatedDuration ? (
                <View style={styles.detailRow}>
                  <Clock size={20} color={colors.text.secondary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Süre</Text>
                    <Text style={styles.detailValue}>{game.estimatedDuration} dakika</Text>
                  </View>
                </View>
              ) : null}

              {game.venueName || game.venueAddress ? (
                <View style={styles.detailRow}>
                  <MapPin size={20} color={colors.text.secondary} />
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Mekan</Text>
                    <Text style={styles.detailValue}>
                      {game.venueName || 'Belirtilmemiş'}
                      {game.venueAddress ? `\n${game.venueAddress}` : ''}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizatör</Text>
            <View style={styles.infoCard}>
              {creator ? (
                <Pressable
                  style={styles.playerItem}
                  onPress={() => handlePlayerPress(creator)}
                >
                  <User size={16} color={colors.text.secondary} />
                  <Text style={[styles.playerName, styles.playerNameClickable]}>
                    {creator.firstName} {creator.lastName}
                  </Text>
                  {creator && (creator._id || creator.id) && playerRatings[creator._id || creator.id || ''] !== null && playerRatings[creator._id || creator.id || ''] !== undefined && (
                    <View style={styles.ratingBadge}>
                      <Star size={14} color={colors.secondary[500]} fill={colors.secondary[500]} />
                      <Text style={styles.ratingBadgeText}>
                        {playerRatings[creator._id || creator.id || '']?.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ) : (
                <Text style={styles.detailValue}>Belirtilmemiş</Text>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Katılan Oyuncular</Text>
            <View style={styles.infoCard}>
              {acceptedPlayers.length > 0 ? (
                <View style={styles.playersList}>
                  {acceptedPlayers.map((player: any, index: number) => (
                    <Pressable
                      key={player._id || index}
                      style={styles.playerItem}
                      onPress={() => handlePlayerPress(player)}
                    >
                      <User size={16} color={colors.text.secondary} />
                      <Text style={[styles.playerName, styles.playerNameClickable]}>
                        {player.firstName} {player.lastName}
                      </Text>
                      {(player._id || player.id) && playerRatings[player._id || player.id || ''] !== null && playerRatings[player._id || player.id || ''] !== undefined && (
                        <View style={styles.ratingBadge}>
                          <Star size={14} color={colors.secondary[500]} fill={colors.secondary[500]} />
                          <Text style={styles.ratingBadgeText}>
                            {playerRatings[player._id || player.id || '']?.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>Katılan oyuncu yok</Text>
              )}
            </View>
          </View>

          {game.skillLevel ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seviye</Text>
              <View style={styles.infoCard}>
                <View style={styles.detailRow}>
                  <Award size={20} color={colors.text.secondary} />
                  <Text style={styles.detailValue}>{getSkillLevelLabel(game.skillLevel)}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {game.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <View style={styles.infoCard}>
                <Text style={styles.descriptionText}>{game.description}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteGame}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={colors.neutral[0]} />
            ) : (
              <>
                <Trash2 size={20} color={colors.neutral[0]} />
                <Text style={styles.deleteButtonText}>Oyunu Sil</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PlayerProfileModal
        visible={showPlayerModal}
        player={selectedPlayer}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPlayer(null);
        }}
      />

      {/* Değerlendirme Butonu - Sağ Alt Köşe */}
      <TouchableOpacity
        style={styles.ratingButton}
        onPress={handleRatingPress}
        activeOpacity={0.8}
      >
        <Star size={20} color={colors.neutral[0]} fill={colors.neutral[0]} />
        <Text style={styles.ratingButtonText}>Değerlendirme</Text>
      </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  completedBadge: {
    backgroundColor: colors.success[100],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  completedBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.success[700],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  lobbyName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameType: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  playersList: {
    gap: spacing.sm,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  playerName: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  playerNameClickable: {
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: 'auto',
  },
  ratingBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.secondary[700],
  },
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: colors.error[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  deleteButtonText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  ratingButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    ...shadows.lg,
    zIndex: 1000,
  },
  ratingButtonText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
