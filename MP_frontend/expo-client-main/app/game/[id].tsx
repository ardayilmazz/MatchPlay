import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Award, MessageCircle, UserPlus } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { Game, GameRequest, WaitlistEntry, User } from '@/types';
import { gameService } from '@/services/gameService';
import { gameRequestService } from '@/services/gameRequestService';
import { waitlistService } from '@/services/waitlistService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRequest, setUserRequest] = useState<GameRequest | null>(null);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadGameDetails();
      checkUserStatus();
    }
  }, [id, user]);

  const loadGameDetails = async () => {
    try {
      setLoading(true);
      const gameData = await gameService.getGameById(id!);
      setGame(gameData);

      if (user && gameData) {
        setIsCreator(gameData.creatorId === user.id);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Oyun yüklenirken hata oluştu');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!user || !id) return;

    try {
      const request = await gameRequestService.getRequestForGame(id, user.id);
      setUserRequest(request);

      const waitlist = await waitlistService.getWaitlistEntry(id, user.id);
      setWaitlistEntry(waitlist);

      // TODO: Replace with new backend logic
      setIsParticipant(false);
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !game) return;

    setActionLoading(true);
    try {
      await gameRequestService.sendJoinRequest(game.id, user.id);
      Alert.alert('Başarılı', 'Katılım isteğiniz gönderildi');
      await checkUserStatus();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek gönderilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user || !game) return;

    setActionLoading(true);
    try {
      await waitlistService.addToWaitlist(game.id, user.id);
      Alert.alert('Başarılı', 'Bekleme listesine eklendiniz');
      await checkUserStatus();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bekleme listesine eklenirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!userRequest) return;

    setActionLoading(true);
    try {
      await gameRequestService.cancelJoinRequest(userRequest.id, user!.id);
      Alert.alert('Başarılı', 'İsteğiniz iptal edildi');
      await checkUserStatus();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek iptal edilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromWaitlist = async () => {
    if (!waitlistEntry) return;

    setActionLoading(true);
    try {
      await waitlistService.removeFromWaitlist(waitlistEntry.id, user!.id);
      Alert.alert('Başarılı', 'Bekleme listesinden çıkarıldınız');
      setWaitlistEntry(null);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bekleme listesinden çıkarılırken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageRequests = () => {
    router.push(`/game/${id}/requests` as any);
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
      everyone: 'Herkes',
      beginner: 'Başlangıç',
      intermediate: 'Orta',
      advanced: 'İleri',
      competitive: 'Rekabetçi',
    };
    return labels[level] || level;
  };

  const renderActionButton = () => {
    if (!game || !user) return null;

    if (game.creatorId === user.id) {
      return (
        <Button
          title="İstekleri Yönet"
          onPress={handleManageRequests}
          variant="primary"
          leftIcon={<MessageCircle size={20} color={colors.neutral[0]} />}
        />
      );
    }

    if (isParticipant) {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Oyuna Katıldınız</Text>
        </View>
      );
    }

    if (userRequest) {
      if (userRequest.status === 'pending') {
        return (
          <Button
            title="İsteği İptal Et"
            onPress={handleCancelRequest}
            variant="secondary"
            loading={actionLoading}
          />
        );
      }
      if (userRequest.status === 'accepted') {
        return (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>İsteğiniz Kabul Edildi</Text>
          </View>
        );
      }
      if (userRequest.status === 'rejected') {
        return (
          <View style={[styles.statusBadge, { backgroundColor: colors.error[100] }]}>
            <Text style={[styles.statusText, { color: colors.error[700] }]}>İstek Reddedildi</Text>
          </View>
        );
      }
    }

    if (waitlistEntry) {
      return (
        <View style={styles.actionContainer}>
          <View style={styles.waitlistInfo}>
            <Text style={styles.waitlistText}>
              Bekleme Listesi - Sıra: {waitlistEntry.position}
            </Text>
          </View>
          <Button
            title="Listeden Çık"
            onPress={handleRemoveFromWaitlist}
            variant="secondary"
            loading={actionLoading}
          />
        </View>
      );
    }

    if (game.status === 'full') {
      return (
        <Button
          title="Bekleme Listesine Katıl"
          onPress={handleJoinWaitlist}
          variant="secondary"
          loading={actionLoading}
          leftIcon={<UserPlus size={20} color={colors.primary[500]} />}
        />
      );
    }

    if (game.status === 'open') {
      return (
        <Button
          title="Katılma İsteği Gönder"
          onPress={handleSendRequest}
          variant="primary"
          loading={actionLoading}
          leftIcon={<UserPlus size={20} color={colors.neutral[0]} />}
        />
      );
    }

    return null;
  };

  if (loading || !game) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Oyun Detayı</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.mainCard}>
            <View style={styles.titleSection}>
              <Text style={styles.sportName}>{game.sportName}</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      game.status === 'full'
                        ? colors.error[500]
                        : game.status === 'open'
                        ? colors.success[500]
                        : colors.neutral[400],
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {game.status === 'full' ? 'Dolu' : game.status === 'open' ? 'Açık' : 'Tamamlandı'}
                </Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Calendar size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>{formatDate(game.startTime)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Clock size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>
                  {formatTime(game.startTime)} - {formatTime(game.endTime)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={20} color={colors.text.secondary} />
                <View style={styles.locationInfo}>
                  <Text style={styles.infoText}>{game.venueName}</Text>
                  <Text style={styles.addressText}>
                    {game.venueAddress}, {game.districtName}, {game.cityName}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Users size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>
                  {game.currentPlayers}/{game.totalPlayers} Oyuncu
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Award size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>{getSkillLevelLabel(game.skillLevel)}</Text>
              </View>
            </View>

            {game.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Açıklama</Text>
                <Text style={styles.descriptionText}>{game.description}</Text>
              </View>
            )}
          </View>

          <View style={styles.actionSection}>{renderActionButton()}</View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: colors.neutral[0],
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sportName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[0],
  },
  infoSection: {
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    flex: 1,
  },
  locationInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  descriptionSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  actionSection: {
    padding: spacing.md,
  },
  actionContainer: {
    gap: spacing.md,
  },
  waitlistInfo: {
    backgroundColor: colors.secondary[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  waitlistText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.secondary[700],
  },
  statusBadge: {
    backgroundColor: colors.success[100],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.success[700],
  },
});
