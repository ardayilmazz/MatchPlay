import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  CheckCircle2,
  XCircle,
  UserPlus,
  Calendar,
  Trash2,
  Check,
  Star,
  ListChecks,
  User,
  ClipboardList,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import JoinRequestModal from '@/components/JoinRequestModal';
import AppBackground from '@/components/AppBackground';

function typeLabel(type: Notification['type']): string {
  const map: Record<Notification['type'], string> = {
    join_request_received: 'Katılım İsteği',
    join_request_accepted: 'İsteğiniz Kabul Edildi',
    join_request_rejected: 'İstek Reddedildi',
    join_request_cancelled: 'İstek İptal Edildi',
    cancellation_vote_request: 'İptal Oylaması',
    cancellation_vote_result: 'Oylama Sonucu',
    game_cancelled: 'Oyun İptal Edildi',
    game_full: 'Oyun Doldu',
    game_reminder: 'Oyun Hatırlatması',
    player_left: 'Oyuncu Ayrıldı',
    waitlist_joined: 'Bekleme Listesi',
    waitlist_slot_available: 'Yer Açıldı',
    rating_pending: 'Değerlendirme',
  };
  return map[type] ?? 'Bildirim';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.token) return;

    try {
      const data = await notificationService.getNotifications(user.token);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.token) return;

    try {
      await notificationService.markAsRead(notificationId, user.token);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.token) return;

    try {
      const unreadNotifications = notifications.filter((n) => !n.read);
      await Promise.all(
        unreadNotifications.map((n) => notificationService.markAsRead(n._id, user.token!))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!user?.token) return;

    Alert.alert(
      'Tüm Bildirimleri Sil',
      'Tüm bildirimlerinizi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAllNotifications(user.token!);
              setNotifications([]);
              Alert.alert('Başarılı', 'Tüm bildirimler silindi');
            } catch (error) {
              console.error('Error deleting all notifications:', error);
              Alert.alert('Hata', 'Bildirimler silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (notification.type === 'rating_pending' && notification.data?.gameSessionId) {
      await handleMarkAsRead(notification._id);
      router.push(`/rating/${notification.data.gameSessionId}` as any);
      return;
    }

    if (notification.type === 'waitlist_slot_available' && notification.data?.gameSessionId) {
      await handleMarkAsRead(notification._id);
      router.push(`/game/${notification.data.gameSessionId}` as any);
      return;
    }

    if (notification.type === 'waitlist_joined' && notification.data?.gameSessionId) {
      await handleMarkAsRead(notification._id);
      router.push(`/game/${notification.data.gameSessionId}` as any);
      return;
    }

    const isProcessed =
      notification.type === 'join_request_accepted' ||
      notification.type === 'join_request_rejected' ||
      (notification.type === 'join_request_received' && notification.isProcessed === true);

    if (isProcessed) {
      return;
    }

    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.type === 'join_request_received' && notification.data.requestId) {
      setSelectedRequestId(notification.data.requestId);
    } else if (notification.type === 'cancellation_vote_request' && notification.data.voteId) {
      router.push(`/vote/${notification.data.voteId}` as any);
    } else if (notification.data.gameSessionId) {
      router.push(`/game/${notification.data.gameSessionId}` as any);
    }
  };

  const handleRequestModalClose = () => {
    setSelectedRequestId(null);
    loadNotifications();
  };

  const leftGlyph = (type: Notification['type'], size = 26) => {
    const glyph = colors.neutral[0];
    switch (type) {
      case 'join_request_received':
        return <UserPlus size={size} color={glyph} />;
      case 'join_request_accepted':
        return <CheckCircle2 size={size} color={glyph} />;
      case 'join_request_rejected':
        return <XCircle size={size} color={glyph} />;
      case 'join_request_cancelled':
        return <XCircle size={size} color={glyph} />;
      case 'cancellation_vote_request':
        return <ClipboardList size={size} color={glyph} />;
      case 'cancellation_vote_result':
        return <ClipboardList size={size} color={glyph} />;
      case 'game_cancelled':
        return <XCircle size={size} color={glyph} />;
      case 'game_full':
        return <Bell size={size} color={glyph} />;
      case 'game_reminder':
        return <Calendar size={size} color={glyph} />;
      case 'player_left':
        return <UserPlus size={size} color={glyph} />;
      case 'waitlist_joined':
        return <UserPlus size={size} color={glyph} />;
      case 'waitlist_slot_available':
        return <CheckCircle2 size={size} color={glyph} />;
      case 'rating_pending':
        return <Star size={size} color={glyph} />;
      default:
        return <Bell size={size} color={glyph} />;
    }
  };

  const rightActionIcon = (item: Notification) => {
    const isProcessed =
      item.type === 'join_request_accepted' ||
      item.type === 'join_request_rejected' ||
      (item.type === 'join_request_received' && item.isProcessed === true);

    if (isProcessed) {
      return <Check size={22} color={colors.primary[900]} />;
    }

    switch (item.type) {
      case 'join_request_received':
        return <User size={22} color={colors.primary[900]} />;
      case 'cancellation_vote_request':
        return <ClipboardList size={22} color={colors.primary[900]} />;
      case 'join_request_accepted':
      case 'waitlist_slot_available':
        return <Check size={22} color={colors.primary[900]} />;
      default:
        return <ChevronRight size={22} color={colors.primary[900]} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isProcessed =
      item.type === 'join_request_accepted' ||
      item.type === 'join_request_rejected' ||
      (item.type === 'join_request_received' && item.isProcessed === true);

    return (
      <Pressable
        style={[styles.cardOuter, !item.read && styles.cardUnread]}
        onPress={() => handleNotificationPress(item)}
        disabled={isProcessed}
      >
        <LinearGradient
          colors={['#252e45', '#3a2848']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.cardGradient, isProcessed && styles.cardProcessed]}
        >
          <View style={styles.glyphCircle}>{leftGlyph(item.type)}</View>

          <View style={styles.cardCenter}>
            <Text style={styles.cardCategory}>{typeLabel(item.type)}</Text>
            <Text style={styles.cardMessage} numberOfLines={3}>
              {item.message}
            </Text>
            <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
          </View>

          <View style={styles.orangeFab}>{rightActionIcon(item)}</View>
        </LinearGradient>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyInner}>
      <Bell size={48} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>Bildirim Yok</Text>
      <Text style={styles.emptyText}>
        Henüz bildiriminiz yok. Oyun istekleri ve güncellemeler burada görünecek.
      </Text>
    </View>
  );

  const subtitle =
    notifications.length === 0
      ? 'Henüz bildiriminiz yok'
      : `${notifications.length} adet bildiriminiz var!`;

  const listHeader = (
    <View style={styles.screenHeader}>
      <View style={styles.screenHeaderLeft}>
        <Text style={styles.screenTitle}>Bildirimler</Text>
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.screenHeaderActions}>
        <Pressable
          style={styles.iconSquare}
          onPress={handleMarkAllAsRead}
          disabled={notifications.filter((n) => !n.read).length === 0}
        >
          <ListChecks size={22} color={colors.neutral[0]} />
        </Pressable>
        <Pressable
          style={styles.iconSquare}
          onPress={handleDeleteAll}
          disabled={notifications.length === 0}
        >
          <Trash2 size={22} color={colors.neutral[0]} />
        </Pressable>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <AppBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary[400]} />
          <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.page}>
          {listHeader}

          <View style={styles.listShell}>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={
                notifications.length === 0 ? styles.emptyListContent : styles.listContent
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.secondary[400]}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        {selectedRequestId && (
          <JoinRequestModal
            visible={true}
            requestId={selectedRequestId}
            onClose={handleRequestModalClose}
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    page: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.sizes.md,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    screenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    screenHeaderLeft: {
      flex: 1,
      paddingRight: spacing.md,
    },
    screenTitle: {
      fontSize: typography.sizes.xxxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    screenSubtitle: {
      marginTop: spacing.xs,
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    screenHeaderActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    iconSquare: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(0,0,0,0.35)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    listShell: {
      flex: 1,
      borderTopWidth: 2,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: `${colors.secondary[400]}cc`,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      overflow: 'hidden',
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.xs,
      marginBottom: spacing.md,
    },
    listContent: {
      paddingBottom: spacing.xxl,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    cardOuter: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      marginBottom: spacing.sm,
      ...shadows.md,
    },
    cardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: colors.secondary[400],
    },
    cardGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      gap: spacing.sm,
    },
    cardProcessed: {
      opacity: 0.72,
    },
    glyphCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardCenter: {
      flex: 1,
      minWidth: 0,
    },
    cardCategory: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: 4,
    },
    cardMessage: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    },
    cardTime: {
      marginTop: spacing.xs,
      fontSize: typography.sizes.xs,
      color: colors.text.tertiary,
      fontFamily: typography.fontFamily.regular,
    },
    orangeFab: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: colors.secondary[400],
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      ...shadows.sm,
    },
    emptyInner: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    },
  });
}
