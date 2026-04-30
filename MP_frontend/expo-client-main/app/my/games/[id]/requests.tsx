import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  UserPlus,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameRequestService } from '@/services/gameRequestService';
import { useAuth } from '@/contexts/AuthContext';

export default function GameRequestsScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      if (!id || !user?.token) return;
      const fetchedRequests = await gameRequestService.getGameRequests(id, user.token);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('İstekler yüklenirken hata:', error);
      Alert.alert('Hata', 'İstekler yüklenemedi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAccept = async (requestId: string) => {
    if (!user?.token) return;

    setActionLoading(requestId);
    try {
      await gameRequestService.acceptJoinRequest(requestId, user.token);
      Alert.alert('Başarılı', 'Katılım isteği kabul edildi');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek kabul edilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user?.token) return;

    setActionLoading(requestId);
    try {
      await gameRequestService.rejectJoinRequest(requestId, user.token);
      Alert.alert('Başarılı', 'Katılım isteği reddedildi');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek reddedilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const renderRequestCard = (request: any) => {
    const requestUser = request.userId;
    const age = requestUser?.birthDate ? calculateAge(requestUser.birthDate) : null;
    const isLoading = actionLoading === request._id;

    return (
      <View key={request._id} style={styles.requestCard}>
        <View style={styles.userInfo}>
          {requestUser?.profilePhoto ? (
            <Image source={{ uri: requestUser.profilePhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <User size={24} color={colors.neutral[400]} />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {requestUser?.firstName} {requestUser?.lastName}
            </Text>
            {age && (
              <Text style={styles.userAge}>{age} yaşında</Text>
            )}
            {requestUser?.gender && (
              <Text style={styles.userGender}>
                {requestUser.gender === 'male' ? 'Erkek' : 'Kadın'}
              </Text>
            )}
            {request.message && (
              <Text style={styles.requestMessage}>{request.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(request._id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.neutral[0]} />
            ) : (
              <>
                <CheckCircle size={18} color={colors.neutral[0]} />
                <Text style={styles.acceptButtonText}>Kabul Et</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(request._id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.neutral[0]} />
            ) : (
              <>
                <XCircle size={18} color={colors.neutral[0]} />
                <Text style={styles.rejectButtonText}>Reddet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleBack = () => {
    // Her iki durumda da stack’teki bir önceki sayfaya dön (döngüyü önlemek için push kullanmıyoruz)
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Katılma İstekleri',
            headerLeft: () => (
              <TouchableOpacity onPress={handleBack} style={{ marginLeft: spacing.sm }}>
                <ChevronLeft size={24} color={colors.text.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Katılma İstekleri',
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={{ marginLeft: spacing.sm }}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <UserPlus size={64} color={colors.neutral[300]} />
            <Text style={styles.emptyText}>Henüz katılma isteği yok</Text>
            <Text style={styles.emptySubtext}>
              Oyununuza katılma istekleri burada görünecek
            </Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            {requests.map((request) => renderRequestCard(request))}
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  userAge: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  userGender: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  requestMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.success[500],
  },
  acceptButtonText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  rejectButton: {
    backgroundColor: colors.error[500],
  },
  rejectButtonText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
