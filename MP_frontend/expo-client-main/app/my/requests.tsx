import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar, MapPin } from 'lucide-react-native';
import { spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { GameRequest } from '@/types/index';
import { gameRequestService } from '@/services/gameRequestService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

export default function MyRequestsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user?.token) return;

    try {
      const data = await gameRequestService.getUserRequests(user.token);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!user?.token) return;

    setActionLoading(requestId);
    try {
      await gameRequestService.cancelJoinRequest(requestId, user.token);
      await loadRequests();
    } catch (error: any) {
      console.error('Error cancelling request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} color={colors.secondary[500]} />;
      case 'accepted':
        return <CheckCircle2 size={18} color={colors.success[500]} />;
      case 'rejected':
        return <XCircle size={18} color={colors.error[500]} />;
      case 'cancelled':
        return <XCircle size={18} color={colors.neutral[500]} />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Beklemede',
      accepted: 'Kabul Edildi',
      rejected: 'Reddedildi',
      cancelled: 'İptal Edildi',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.secondary[100];
      case 'accepted':
        return colors.success[100];
      case 'rejected':
        return colors.error[100];
      case 'cancelled':
        return colors.neutral[200];
      default:
        return colors.neutral[100];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRequest = ({ item }: { item: GameRequest }) => (
    <View style={styles.requestCard}>
      <Pressable onPress={() => item.game && handleGamePress(item.game.id)} style={styles.gameInfo}>
        <Text style={styles.sportName}>{item.game?.sportName}</Text>
        <View style={styles.gameDetails}>
          <View style={styles.detailRow}>
            <Calendar size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {item.game?.startTime && formatDate(item.game.startTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {item.game?.venueName}, {item.game?.districtName}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={[styles.statusContainer, { backgroundColor: getStatusColor(item.status) }]}>
        {getStatusIcon(item.status)}
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
      </View>

      {item.status === 'pending' && (
        <Button
          title="İptal Et"
          onPress={() => handleCancelRequest(item.id)}
          variant="secondary"
          loading={actionLoading === item.id}
          style={styles.cancelButton}
        />
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Clock size={48} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>İstek Yok</Text>
      <Text style={styles.emptyText}>Henüz hiç katılım isteği göndermediniz</Text>
      <Button
        title="Oyunları Keşfet"
        onPress={() => router.push('/(tabs)/discover')}
        style={styles.discoverButton}
      />
    </View>
  );

  if (loading && !refreshing) {
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
          <Text style={styles.headerTitle}>İstek Geçmişi</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={requests.length === 0 ? styles.emptyListContent : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[900],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary[900],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  gameInfo: {
    marginBottom: spacing.md,
  },
  sportName: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  gameDetails: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  discoverButton: {
    minWidth: 200,
  },
});
}
