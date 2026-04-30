import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MessageCircle,
  UserPlus,
  User as UserIcon,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '@/constants/theme';
import type { Game, User } from '@/types';
import { gameService } from '@/services/gameService';
import { gameRequestService } from '@/services/gameRequestService';
import { waitlistService } from '@/services/waitlistService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import CreatorProfileModal from '@/components/CreatorProfileModal';
import AppBackground from '@/components/AppBackground';
import { resolveSportImageOrNull } from '@/utils/sportImages';

interface GameRequest {
  id: string;
  gameId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

interface WaitlistEntry {
  id: string;
  gameId: string;
  userId: string;
  position: number;
  status: 'waiting' | 'invited' | 'expired' | 'cancelled';
  createdAt: string;
}

const BADGE_MUTED_BLUE = '#4A69BD';

function headlineText(game: Game): string {
  const t = game.title?.trim();
  if (t) return t;
  const d = (game.description && String(game.description).trim()) || '';
  if (d) return d;
  return '';
}

function locationLine(game: Game): string {
  const parts = [game.districtName, game.venueAddress, game.venueName].filter(
    (p) => typeof p === 'string' && p.trim().length > 0
  ) as string[];
  return [...new Set(parts)].join(', ');
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRequest, setUserRequest] = useState<GameRequest | null>(null);
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadGameDetails();
  }, [id]);

  useEffect(() => {
    if (game && user) {
      setIsCreator(game.creatorId === user.id);
      checkUserStatus();
    }
  }, [game, user]);

  const loadGameDetails = async () => {
    try {
      setLoading(true);
      const gameData = await gameService.getGameById(id!);
      setGame(gameData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Oyun yüklenirken hata oluştu';
      Alert.alert('Hata', msg);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!user || !id || !user.token || !game) return;

    try {
      const request = await gameRequestService.getRequestForGame(id, user.token);
      setUserRequest(request);

      const waitlist = await waitlistService.getWaitlistEntry(id, user.token);
      setWaitlistEntry(waitlist);

      if (game.acceptedPlayers && Array.isArray(game.acceptedPlayers)) {
        const isAccepted = game.acceptedPlayers.some((p: { _id?: string } | string) => {
          const playerId = typeof p === 'object' && p && '_id' in p ? p._id : p;
          return playerId === user.id;
        });
        setIsParticipant(isAccepted);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleSendRequest = async () => {
    if (!user || !game || !user.token) return;

    setActionLoading(true);
    try {
      await gameRequestService.sendJoinRequest(game.id, user.token);
      Alert.alert('Başarılı', 'Katılım isteğiniz gönderildi');
      await checkUserStatus();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'İstek gönderilirken hata oluştu';
      Alert.alert('Hata', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user || !game || !user.token) return;

    setActionLoading(true);
    try {
      await waitlistService.addToWaitlist(game.id, user.token);
      Alert.alert('Başarılı', 'Bekleme listesine eklendiniz');
      await checkUserStatus();
      await loadGameDetails();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bekleme listesine eklenirken hata oluştu';
      Alert.alert('Hata', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!userRequest || !user?.token) return;

    setActionLoading(true);
    try {
      await gameRequestService.cancelJoinRequest(userRequest.id, user.token);
      Alert.alert('Başarılı', 'İsteğiniz iptal edildi');
      await checkUserStatus();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'İstek iptal edilirken hata oluştu';
      Alert.alert('Hata', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    if (!game || !user?.token) return;

    Alert.alert('Oyundan Ayrıl', 'Bu oyundan ayrılmak istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Ayrıl',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await gameRequestService.leaveGame(game.id, user.token!);
            Alert.alert('Başarılı', 'Oyundan ayrıldınız', [{ text: 'Tamam', onPress: () => router.back() }]);
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Oyundan ayrılırken hata oluştu';
            Alert.alert('Hata', msg);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleRemoveFromWaitlist = async () => {
    if (!waitlistEntry || !user?.token) return;

    setActionLoading(true);
    try {
      await waitlistService.removeFromWaitlist(waitlistEntry.id, user.token);
      Alert.alert('Başarılı', 'Bekleme listesinden çıkarıldınız');
      setWaitlistEntry(null);
      await loadGameDetails();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Bekleme listesinden çıkarılırken hata oluştu';
      Alert.alert('Hata', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageRequests = () => {
    router.push({
      pathname: `/my/games/${id}/requests` as any,
      params: { from: 'notification' },
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const heroSource = useMemo(
    () => (game?.sportName ? resolveSportImageOrNull(game.sportName) : null),
    [game?.sportName]
  );

  const headlineDisplay = game ? headlineText(game) : '';
  const locationDisplay = game ? locationLine(game).trim() : '';

  const renderActionButton = () => {
    if (!game) return null;
    if (!user) {
      return (
        <Text style={styles.loginHint}>Katılmak için giriş yapın.</Text>
      );
    }

    if (game.creatorId === user.id) {
      return (
        <Button
          title="İstekleri Yönet"
          onPress={handleManageRequests}
          variant="primary"
          leftIcon={<MessageCircle size={20} color={colors.neutral[0]} />}
          style={styles.actionBtnFull}
        />
      );
    }

    if (isParticipant) {
      return (
        <Button
          title="Buluşmadan Ayrıl"
          onPress={handleLeaveGame}
          variant="danger"
          loading={actionLoading}
          style={styles.actionBtnFull}
        />
      );
    }

    if (userRequest) {
      if (userRequest.status === 'pending') {
        return (
          <Button
            title="İsteği İptal Et"
            onPress={handleCancelRequest}
            variant="danger"
            loading={actionLoading}
            style={styles.actionBtnFull}
          />
        );
      }
      if (userRequest.status === 'accepted') {
        return (
          <Button
            title="Buluşmadan Ayrıl"
            onPress={handleLeaveGame}
            variant="danger"
            loading={actionLoading}
            style={styles.actionBtnFull}
          />
        );
      }
      if (userRequest.status === 'rejected') {
        return (
          <View style={styles.inlineStatusBadge}>
            <Text style={styles.inlineStatusText}>İstek Reddedildi</Text>
          </View>
        );
      }
    }

    if (waitlistEntry && game.status === 'open') {
      return (
        <View style={styles.actionStack}>
          <View style={[styles.waitlistBanner, { marginBottom: spacing.sm }]}>
            <Text style={styles.waitlistBannerText}>Bekleme listesi — sıra: {waitlistEntry.position}</Text>
          </View>
          <Button
            title="Katıl"
            onPress={handleSendRequest}
            variant="primary"
            loading={actionLoading}
            leftIcon={<UserPlus size={20} color={colors.neutral[0]} />}
            style={styles.actionBtnSpaced}
          />
          <Button
            title="Listeden Çık"
            onPress={handleRemoveFromWaitlist}
            variant="secondary"
            loading={actionLoading}
            style={styles.actionBtnFull}
          />
        </View>
      );
    }

    if (waitlistEntry) {
      return (
        <View style={styles.actionStack}>
          <View style={[styles.waitlistBanner, { marginBottom: spacing.sm }]}>
            <Text style={styles.waitlistBannerText}>Bekleme listesi — sıra: {waitlistEntry.position}</Text>
          </View>
          <Button
            title="Listeden Çık"
            onPress={handleRemoveFromWaitlist}
            variant="secondary"
            loading={actionLoading}
            style={styles.actionBtnFull}
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
          style={styles.actionBtnFull}
        />
      );
    }

    if (game.status === 'open') {
      return (
        <Button
          title="Katıl"
          onPress={handleSendRequest}
          variant="primary"
          loading={actionLoading}
          leftIcon={<UserPlus size={20} color={colors.neutral[0]} />}
          style={styles.actionBtnFull}
        />
      );
    }

    return null;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          {loading || !game ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.secondary[400]} />
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backSquare, pressed && styles.backSquarePressed]}
                accessibilityRole="button"
                accessibilityLabel="Geri"
              >
                <ArrowLeft size={22} color={colors.secondary[400]} strokeWidth={2.5} />
              </Pressable>

              <View style={styles.shellCard}>
                {heroSource ? (
                  <Image source={heroSource} style={styles.heroImage} resizeMode="cover" />
                ) : null}

                <View style={styles.infoCard}>
                  <View style={[styles.typeBadge, { backgroundColor: BADGE_MUTED_BLUE }]}>
                    <Text style={styles.typeBadgeText}>{game.sportName}</Text>
                  </View>

                  {headlineDisplay ? <Text style={styles.headline}>{headlineDisplay}</Text> : null}

                  <Text style={styles.timeRange}>
                    {formatTime(game.startTime)} - {formatTime(game.endTime)}
                  </Text>

                  {locationDisplay ? (
                    <Text style={styles.locationText} numberOfLines={4}>
                      {locationDisplay}
                    </Text>
                  ) : null}

                  <Text style={styles.capacityLarge}>
                    {game.currentPlayers}/{game.totalPlayers}
                  </Text>

                  <View style={styles.actionSection}>{renderActionButton()}</View>
                </View>
              </View>

              {!isCreator && (game as Game & { creator?: unknown }).creator ? (
                <Pressable
                  style={styles.creatorLink}
                  onPress={() => setShowCreatorModal(true)}
                  accessibilityRole="button"
                >
                  <View style={{ marginRight: spacing.sm }}>
                    <UserIcon size={18} color={colors.secondary[400]} />
                  </View>
                  <Text style={styles.creatorLinkText}>Oyun kurucu bilgileri</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          )}
        </SafeAreaView>
      </AppBackground>

      <CreatorProfileModal
        visible={showCreatorModal}
        creator={(game as Game & { creator?: User })?.creator ?? null}
        onClose={() => setShowCreatorModal(false)}
      />
    </>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 280,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xxl,
    },
    backSquare: {
      alignSelf: 'flex-start',
      marginBottom: spacing.md,
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: `${colors.secondary[400]}cc`,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backSquarePressed: {
      opacity: 0.85,
    },
    shellCard: {
      borderRadius: borderRadius.cardLarge,
      borderWidth: 1,
      borderColor: 'rgba(130, 170, 255, 0.35)',
      backgroundColor: colors.background.secondary,
      padding: spacing.lg,
      ...shadows.md,
    },
    heroImage: {
      width: '100%',
      height: 200,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      backgroundColor: colors.primary[900],
    },
    infoCard: {
      alignItems: 'center',
      backgroundColor: colors.primary[700],
      borderRadius: borderRadius.cardLarge,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      width: '100%',
    },
    typeBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    typeBadgeText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.semibold,
      color: colors.neutral[0],
    },
    headline: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
    timeRange: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    locationText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.neutral[0],
      textAlign: 'center',
      marginBottom: spacing.lg,
      opacity: 0.95,
    },
    capacityLarge: {
      fontSize: typography.sizes.xxxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    actionSection: {
      width: '100%',
      alignItems: 'stretch',
    },
    actionBtnFull: {
      alignSelf: 'stretch',
      width: '100%',
    },
    actionBtnSpaced: {
      alignSelf: 'stretch',
      width: '100%',
      marginBottom: spacing.sm,
    },
    actionStack: {
      width: '100%',
    },
    waitlistBanner: {
      backgroundColor: 'rgba(255,121,88,0.15)',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
    },
    waitlistBannerText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.secondary[300],
      textAlign: 'center',
    },
    inlineStatusBadge: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(211,47,47,0.2)',
      width: '100%',
      alignItems: 'center',
    },
    inlineStatusText: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.semibold,
      color: colors.error[400],
      textAlign: 'center',
    },
    loginHint: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    creatorLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
      paddingVertical: spacing.sm,
    },
    creatorLinkText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.secondary[400],
    },
  });
}
