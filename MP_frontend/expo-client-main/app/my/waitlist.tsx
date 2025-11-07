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
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { WaitlistEntry } from '@/types';
import { waitlistService } from '@/services/waitlistService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

export default function MyWaitlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWaitlist();
    }
  }, [user]);

  const loadWaitlist = async () => {
    if (!user) return;

    try {
      const data = await waitlistService.getUserWaitlist(user.id);
      setWaitlist(data);
    } catch (error) {
      console.error('Error loading waitlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadWaitlist();
  };

  const handleRemoveFromWaitlist = async (waitlistId: string) => {
    if (!user) return;

    setActionLoading(waitlistId);
    try {
      await waitlistService.removeFromWaitlist(waitlistId, user.id);
      await loadWaitlist();
    } catch (error: any) {
      console.error('Error removing from waitlist:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}` as any);
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

  const renderWaitlistEntry = ({ item }: { item: WaitlistEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>#{item.position}</Text>
      </View>

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
          <View style={styles.detailRow}>
            <Users size={14} color={colors.text.secondary} />
            <Text style={styles.detailText}>
              {item.game?.currentPlayers}/{item.game?.totalPlayers} Oyuncu
            </Text>
          </View>
        </View>
      </Pressable>

      <Button
        title="Listeden Çık"
        onPress={() => handleRemoveFromWaitlist(item.id)}
        variant="secondary"
        loading={actionLoading === item.id}
        style={styles.removeButton}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Users size={48} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Bekleme Listesi Boş</Text>
      <Text style={styles.emptyText}>
        Henüz hiçbir oyunun bekleme listesinde değilsiniz
      </Text>
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
          <Text style={styles.headerTitle}>Bekleme Listesi</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={waitlist}
          renderItem={renderWaitlistEntry}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={waitlist.length === 0 ? styles.emptyListContent : styles.listContent}
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
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  entryCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
    position: 'relative',
  },
  positionBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.secondary[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  positionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.neutral[0],
  },
  gameInfo: {
    marginBottom: spacing.md,
    paddingRight: 60,
  },
  sportName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
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
  removeButton: {
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
    fontWeight: typography.weights.bold,
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
