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
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { ratingService, ParticipantWithRating } from '@/services/ratingService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import RatingModal from '@/components/RatingModal';
import type { Game } from '@/types';

export default function RatingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<ParticipantWithRating[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRatingViewModal, setShowRatingViewModal] = useState(false);
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
      const [gameData, gameRatings] = await Promise.all([
        gameService.getGameById(gameId),
        ratingService.getGameRatings(gameId, user.token),
      ]);

      setGame(gameData);
      setParticipants(gameRatings.participants);
    } catch (error) {
      console.error('Error loading rating data:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const participant = participants.find((p) => p.id === userId);
    if (!participant) return;

    // Eğer zaten oy verilmişse, geçmiş değerlendirmeyi göster
    if (participant.hasRated) {
      setSelectedUserId(userId);
      setShowRatingViewModal(true);
    } else {
      // Oy verilmemişse, yeni oylama modal'ını aç
      setSelectedUserId(userId);
      setShowRatingModal(true);
    }
  };

  const handleRatingSave = (userId: string, rating: number, comment: string) => {
    // Local state'i güncelle (henüz backend'e gönderilmedi, ratingId yok)
    setParticipants((prev) => {
      const updated = prev.map((p) =>
        p.id === userId ? { ...p, hasRated: true, rating, comment } : p
      );
      // allRated sadece backend'den gelen (ratingId olan) değerlendirmeleri kontrol etmeli
      // Gönderilmemiş değerlendirmeleri saymamalı
      return updated;
    });
    setShowRatingModal(false);
    setSelectedUserId(null);
  };

  const handleSubmit = async () => {
    if (!user?.token || !gameId) return;

    // Sadece yeni oylamaları gönder (henüz kaydedilmemiş olanlar - ratingId yok)
    const ratingsToSubmit = participants.filter((p) => p.hasRated && p.rating && !p.ratingId);
    if (ratingsToSubmit.length === 0) {
      Alert.alert('Uyarı', 'En az bir kullanıcıyı oylamanız gerekiyor');
      return;
    }

    setSubmitting(true);
    try {
      // Tüm oylamaları gönder
      await Promise.all(
        ratingsToSubmit.map((p) =>
          ratingService.createRating(gameId, p.id, p.rating!, p.comment || '', user.token!)
        )
      );

      // Verileri yeniden yükle
      await loadData();

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
    const participant = participants.find((p) => p.id === userId);
    if (participant) {
      router.push({
        pathname: '/complaint',
        params: {
          reportedId: userId,
          reportedName: `${participant.firstName} ${participant.lastName}`,
          gameId: gameId!,
        },
      });
    }
  };

  const selectedUser = selectedUserId ? participants.find((p) => p.id === selectedUserId) : null;
  const hasNewRatings = participants.some((p) => p.hasRated && p.rating && !p.ratingId);
  
  // allRatedFromBackend: Sadece backend'den gelen (ratingId olan) değerlendirmeleri kontrol et
  // Gönderilmemiş değerlendirmeleri sayma
  const allRatedFromBackend = participants.every((p) => p.hasRated && p.ratingId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!game || participants.length === 0) {
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
              {allRatedFromBackend
                ? 'Tüm katılımcılar için değerlendirme yapılmıştır'
                : `${participants.filter((p) => !p.ratingId).length} kişiyi oylayabilirsiniz`}
            </Text>
          </View>

          {allRatedFromBackend && (
            <View style={styles.allRatedBanner}>
              <Text style={styles.allRatedText}>
                Tüm katılımcılar için değerlendirme yapılmıştır
              </Text>
            </View>
          )}

          <View style={styles.usersList}>
            {participants.map((participant) => (
              <Pressable
                key={participant.id}
                style={[
                  styles.userCard,
                  participant.hasRated && styles.userCardRated,
                ]}
                onPress={() => handleUserSelect(participant.id)}
              >
                <View style={styles.userInfo}>
                  {participant.profilePhoto ? (
                    <Image source={{ uri: participant.profilePhoto }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {participant.firstName[0]}{participant.lastName[0]}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {participant.firstName} {participant.lastName}
                    </Text>
                    {participant.hasRated && participant.rating && (
                      <View style={styles.ratingBadge}>
                        <Star size={14} color={colors.secondary[500]} fill={colors.secondary[500]} />
                        <Text style={styles.ratingText}>{participant.rating}/5</Text>
                      </View>
                    )}
                  </View>
                </View>
                {participant.hasRated ? (
                  <View style={styles.ratedIndicator}>
                    <Check size={20} color={colors.success[500]} />
                    <Text style={styles.ratedText}>Değerlendirildi</Text>
                  </View>
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
            disabled={submitting || !hasNewRatings || allRatedFromBackend}
            style={styles.footerButton}
          />
        </View>
      </View>

      {selectedUser && user?.token && (
        <>
          {/* Yeni oylama modal'ı */}
          <RatingModal
            visible={showRatingModal && !selectedUser.hasRated}
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

          {/* Geçmiş değerlendirme görüntüleme modal'ı */}
          {selectedUser.hasRated && (
            <RatingModal
              visible={showRatingViewModal}
              userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
              gameId={gameId!}
              userId={selectedUser.id}
              token={user.token}
              onClose={() => {
                setShowRatingViewModal(false);
                setSelectedUserId(null);
              }}
              onSuccess={() => {}}
              onComplaint={() => handleComplaint(selectedUser.id)}
              viewOnly={true}
              existingRating={selectedUser.rating}
              existingComment={selectedUser.comment}
            />
          )}
        </>
      )}
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
    backgroundColor: colors.background.secondary,
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
    backgroundColor: colors.background.secondary,
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
    backgroundColor: colors.background.secondary,
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
  allRatedBanner: {
    backgroundColor: colors.success[50],
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  allRatedText: {
    fontSize: typography.sizes.md,
    color: colors.success[700],
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },
  userCardRated: {
    opacity: 0.8,
  },
  ratedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratedText: {
    fontSize: typography.sizes.sm,
    color: colors.success[500],
    fontFamily: typography.fontFamily.medium,
  },
  });
}
