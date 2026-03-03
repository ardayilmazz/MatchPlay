import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft, Check, Star } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { ratingService } from '@/services/ratingService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import RatingModal from '@/components/RatingModal';
import type { Game } from '@/types';

interface UserToRate {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  rating?: number;
  comment?: string;
}

export default function RatingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [usersToRate, setUsersToRate] = useState<UserToRate[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (gameId && user?.token) {
      loadData();
    }
  }, [gameId, user]);

  const loadData = async () => {
    if (!gameId || !user?.token) return;

    try {
      setLoading(true);
      const [gameData, pendingRatings] = await Promise.all([
        gameService.getGameById(gameId),
        ratingService.getPendingRatings(user.token),
      ]);

      setGame(gameData);

      // Bu oyun için bekleyen oylamaları bul
      const gamePending = pendingRatings.find((p) => p.gameId === gameId);
      if (gamePending) {
        setUsersToRate(
          gamePending.usersToRate.map((u) => ({
            ...u,
            rating: undefined,
            comment: undefined,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setShowRatingModal(true);
  };

  const handleRatingSave = (userId: string, rating: number, comment: string) => {
    setUsersToRate((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, rating, comment } : u
      )
    );
    setShowRatingModal(false);
    setSelectedUserId(null);
  };

  const handleSubmit = async () => {
    if (!user?.token || !gameId) return;

    const ratingsToSubmit = usersToRate.filter((u) => u.rating !== undefined);
    if (ratingsToSubmit.length === 0) {
      Alert.alert('Uyarı', 'En az bir kullanıcıyı oylamanız gerekiyor');
      return;
    }

    setSubmitting(true);
    try {
      // Tüm oylamaları gönder
      await Promise.all(
        ratingsToSubmit.map((u) =>
          ratingService.createRating(gameId, u.id, u.rating!, u.comment || '', user.token!)
        )
      );

      Alert.alert('Başarılı', 'Oylamalarınız gönderildi', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Oylamalar gönderilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplaint = (userId: string) => {
    const user = usersToRate.find((u) => u.id === userId);
    if (user) {
      router.push({
        pathname: '/complaint',
        params: {
          reportedId: userId,
          reportedName: `${user.firstName} ${user.lastName}`,
          gameId: gameId!,
        },
      });
    }
  };

  const selectedUser = selectedUserId ? usersToRate.find((u) => u.id === selectedUserId) : null;
  const hasRatings = usersToRate.some((u) => u.rating !== undefined);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!game || usersToRate.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Oylama</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bu oyun için oylama yapılacak kişi bulunamadı</Text>
          </View>
        </View>
      </>
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
          <Text style={styles.headerTitle}>Oyun Sonrası Oylama</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title || game.sportName}</Text>
            <Text style={styles.gameSubtitle}>
              {usersToRate.length} kişiyi oylayabilirsiniz
            </Text>
          </View>

          <View style={styles.usersList}>
            {usersToRate.map((user) => (
              <Pressable
                key={user.id}
                style={styles.userCard}
                onPress={() => handleUserSelect(user.id)}
              >
                <View style={styles.userInfo}>
                  {user.profilePhoto ? (
                    <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    {user.rating && (
                      <View style={styles.ratingBadge}>
                        <Star size={14} color={colors.secondary[500]} fill={colors.secondary[500]} />
                        <Text style={styles.ratingText}>{user.rating}/5</Text>
                      </View>
                    )}
                  </View>
                </View>
                {user.rating ? (
                  <Check size={20} color={colors.success[500]} />
                ) : (
                  <Text style={styles.selectText}>Seç</Text>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="İptal"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.footerButton}
            disabled={submitting}
          />
          <Button
            title="Gönder"
            onPress={handleSubmit}
            variant="primary"
            loading={submitting}
            disabled={submitting || !hasRatings}
            style={styles.footerButton}
          />
        </View>
      </View>

      {selectedUser && user?.token && (
        <RatingModal
          visible={showRatingModal}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          gameId={gameId!}
          userId={selectedUser.id}
          token={user.token}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedUserId(null);
          }}
          onSuccess={(rating, comment) => {
            handleRatingSave(selectedUser.id, rating, comment);
          }}
          onComplaint={() => handleComplaint(selectedUser.id)}
        />
      )}
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
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  gameInfo: {
    backgroundColor: colors.neutral[0],
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  gameTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  usersList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  userCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  selectText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  footerButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
