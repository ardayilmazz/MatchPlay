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
  LogOut,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { gameRequestService } from '@/services/gameRequestService';
import { useAuth } from '@/contexts/AuthContext';
import PlayerProfileModal from '@/components/PlayerProfileModal';

export default function JoinedGameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const loadGameDetails = async () => {
    try {
      if (!id || typeof id !== 'string') return;
      const gameData = await gameService.fetchGameSession(id);
      setGame(gameData);
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

  const handleLeaveGame = async () => {
    if (!game || !user?.token) return;

    Alert.alert(
      'Oyundan Ayrıl',
      'Bu oyundan ayrılmak istediğinizden emin misiniz? Oyun için ihtiyaç duyulan oyuncu sayısı 1 artacaktır.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Ayrıl',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await gameRequestService.leaveGame(game._id, user!.token!);
              Alert.alert('Başarılı', 'Oyundan ayrıldınız', [
                {
                  text: 'Tamam',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Oyundan ayrılırken hata oluştu');
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

  const creator = game.creatorId && typeof game.creatorId === 'object' ? game.creatorId : null;
  const acceptedPlayers = game.acceptedPlayers || [];
  const totalPlayers = game.totalPlayers || 2;
  const currentPlayers = acceptedPlayers.length + 1;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Oyun Detayı',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Oyun Bilgileri Kartı */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{game.title}</Text>
          <Text style={styles.gameTypeName}>
            {game.gameTypeId?.name || game.gameType?.name || 'Oyun'}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{formatDate(game.startDate)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Clock size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                {formatTime(game.startDate)}
                {game.estimatedDuration ? ` • ${game.estimatedDuration} dk` : ''}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={20} color={colors.text.secondary} />
              <View style={styles.locationInfo}>
                <Text style={styles.infoText}>
                  {game.venueName || game.districtName || game.cityName || 'Belirtilmemiş'}
                </Text>
                {game.venueAddress ? (
                  <Text style={styles.addressText}>{game.venueAddress}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Users size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                {currentPlayers}/{totalPlayers} Oyuncu
              </Text>
            </View>

            {game.skillLevel ? (
              <View style={styles.infoRow}>
                <Award size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>{getSkillLevelLabel(game.skillLevel)}</Text>
              </View>
            ) : null}

            {game.genderPreference ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cinsiyet Tercihi: </Text>
                <Text style={styles.infoText}>{getGenderLabel(game.genderPreference)}</Text>
              </View>
            ) : null}

            {game.feeAmount && game.feeAmount > 0 ? (
              <View style={styles.infoRow}>
                <Text style={styles.feeText}>{game.feeAmount} TL (Kişi başı)</Text>
              </View>
            ) : null}
          </View>

          {game.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.descriptionText}>{game.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Katılımcılar Bölümü */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Katılımcılar</Text>

          {/* Oyun Kurucusu */}
          {creator ? (
            <View style={styles.participantSection}>
              <Text style={styles.participantLabel}>Oyun Kurucusu</Text>
              <Pressable
                style={styles.participantItem}
                onPress={() =>
                  handlePlayerPress({
                    _id: creator._id,
                    firstName: creator.firstName,
                    lastName: creator.lastName,
                    profilePhoto: creator.profilePhoto,
                    gender: creator.gender,
                    birthDate: creator.birthDate,
                  })
                }
              >
                <User size={20} color={colors.primary[500]} />
                <Text style={styles.participantName}>
                  {creator.firstName} {creator.lastName}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Diğer Katılımcılar */}
          {acceptedPlayers.length > 0 ? (
            <View style={styles.participantSection}>
              <Text style={styles.participantLabel}>
                Katılım Sağlayanlar ({acceptedPlayers.length})
              </Text>
              {acceptedPlayers.map((player: any) => (
                <Pressable
                  key={player._id}
                  style={styles.participantItem}
                  onPress={() => handlePlayerPress(player)}
                >
                  <User size={20} color={colors.primary[500]} />
                  <Text style={styles.participantName}>
                    {player.firstName} {player.lastName}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        {/* Ayrıl Butonu */}
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveGame}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator size="small" color={colors.neutral[0]} />
          ) : (
            <>
              <LogOut size={20} color={colors.neutral[0]} />
              <Text style={styles.leaveButtonText}>Oyundan Ayrıl</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <PlayerProfileModal
        visible={showPlayerModal}
        player={selectedPlayer}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPlayer(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    padding: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameTypeName: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
    marginBottom: spacing.md,
  },
  infoSection: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  feeText: {
    fontSize: typography.sizes.md,
    color: colors.success[700],
    fontWeight: typography.weights.medium,
  },
  descriptionSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  participantSection: {
    marginBottom: spacing.md,
  },
  participantLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  participantName: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  leaveButtonText: {
    fontSize: typography.sizes.md,
    color: colors.neutral[0],
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
  },
});
