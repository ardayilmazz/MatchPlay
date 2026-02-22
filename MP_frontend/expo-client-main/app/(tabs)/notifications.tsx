import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle2,
  XCircle,
  UserPlus,
  Calendar,
  Trash2,
  Check,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import JoinRequestModal from '@/components/JoinRequestModal';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
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
      // Tüm okunmamışları tek tek işaretle
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
    // İşlenmiş katılma istekleri için detay açma
    const isProcessed = 
      notification.type === 'join_request_accepted' || 
      notification.type === 'join_request_rejected' ||
      (notification.type === 'join_request_received' && notification.isProcessed === true);
    
    if (isProcessed) {
      return; // İşlenmiş bildirimler tıklanamaz
    }

    if (!notification.read) {
      await handleMarkAsRead(notification._id);
    }

    // Katılma isteği bildirimi ise modal aç
    if (notification.type === 'join_request_received' && notification.data.requestId) {
      setSelectedRequestId(notification.data.requestId);
    } 
    // Diğer bildirimler için oyun detayına git
    else if (notification.data.gameSessionId) {
      router.push(`/game/${notification.data.gameSessionId}` as any);
    }
  };

  const handleRequestModalClose = () => {
    setSelectedRequestId(null);
    loadNotifications(); // Bildirimleri yenile
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'join_request_received':
        return <UserPlus size={20} color={colors.primary[500]} />;
      case 'join_request_accepted':
        return <CheckCircle2 size={20} color={colors.success[500]} />;
      case 'join_request_rejected':
        return <XCircle size={20} color={colors.error[500]} />;
      case 'join_request_cancelled':
        return <XCircle size={20} color={colors.neutral[500]} />;
      case 'game_cancelled':
        return <XCircle size={20} color={colors.error[500]} />;
      case 'game_full':
        return <Bell size={20} color={colors.secondary[500]} />;
      case 'game_reminder':
        return <Calendar size={20} color={colors.secondary[500]} />;
      case 'player_left':
        return <XCircle size={20} color={colors.secondary[500]} />;
      default:
        return <Bell size={20} color={colors.neutral[500]} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'join_request_received':
        return colors.primary[100];
      case 'join_request_accepted':
        return colors.success[100];
      case 'join_request_rejected':
        return colors.error[100];
      case 'join_request_cancelled':
        return colors.neutral[100];
      case 'game_cancelled':
        return colors.error[100];
      case 'game_full':
        return colors.secondary[100];
      case 'game_reminder':
        return colors.secondary[100];
      case 'player_left':
        return colors.secondary[100];
      default:
        return colors.neutral[100];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    // İşlenmiş bildirimler: accepted/rejected bildirimleri VEYA işlenmiş join_request_received bildirimleri
    const isProcessed = 
      item.type === 'join_request_accepted' || 
      item.type === 'join_request_rejected' ||
      (item.type === 'join_request_received' && item.isProcessed === true);
    
    return (
      <Pressable
        style={[
          styles.notificationCard, 
          !item.read && styles.unreadCard,
          isProcessed && styles.processedCard
        ]}
        onPress={() => handleNotificationPress(item)}
        disabled={isProcessed}
      >
        <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) }]}>
          {getNotificationIcon(item.type)}
        </View>

        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.rightSide}>
          {isProcessed && (
            <Check size={20} color={colors.success[500]} style={styles.processedIcon} />
          )}
          {!item.read && !isProcessed && <View style={styles.unreadDot} />}
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Bell size={48} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Bildirim Yok</Text>
      <Text style={styles.emptyText}>
        Henüz hiç bildiriminiz yok. Oyun istekleri ve güncellemeler burada görünecek.
      </Text>
    </View>
  );

  const renderHeader = () => {
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Bildirimler</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllAsRead} style={styles.headerActionButton}>
              <Check size={16} color={colors.primary[500]} />
              <Text style={styles.headerActionText}>Tümünü Okundu İşaretle</Text>
            </Pressable>
          )}
          
          {notifications.length > 0 && (
            <Pressable onPress={handleDeleteAll} style={styles.headerActionButton}>
              <Trash2 size={16} color={colors.error[500]} />
              <Text style={[styles.headerActionText, { color: colors.error[500] }]}>Tümünü Sil</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Katılma İsteği Modal */}
      {selectedRequestId && (
        <JoinRequestModal
          visible={true}
          requestId={selectedRequestId}
          onClose={handleRequestModalClose}
        />
      )}
    </View>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.neutral[0],
    padding: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.error[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[0],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  headerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  unreadCard: {
    backgroundColor: colors.primary[50],
  },
  processedCard: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  rightSide: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
    position: 'relative',
  },
  processedIcon: {
    marginRight: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  unreadText: {
    color: colors.primary[700],
  },
  notificationMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
