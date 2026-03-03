import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { ratingService, Rating } from '@/services/ratingService';
import { useAuth } from '@/contexts/AuthContext';

export default function UserRatingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRatings();
    }
  }, [user]);

  const loadRatings = async () => {
    if (!user?.id) return;

    try {
      const data = await ratingService.getUserRatings(user.id);
      setRatings(data);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRatings();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            size={20}
            color={value <= rating ? colors.secondary[500] : colors.neutral[300]}
            fill={value <= rating ? colors.secondary[500] : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderRating = ({ item }: { item: Rating }) => (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <View>
          <Text style={styles.raterName}>
            {item.rater.firstName} {item.rater.lastName}
          </Text>
          <Text style={styles.gameTitle}>{item.game.title}</Text>
        </View>
        {renderStars(item.rating)}
      </View>
      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Star size={48} color={colors.neutral[400]} />
      <Text style={styles.emptyTitle}>Henüz Yorum Yok</Text>
      <Text style={styles.emptyText}>
        Size henüz yorum yapılmamış
      </Text>
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
          <Text style={styles.headerTitle}>Kullanıcı Yorumları</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={ratings}
          renderItem={renderRating}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={ratings.length === 0 ? styles.emptyListContent : styles.listContent}
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
    minWidth: 40,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
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
  ratingCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  raterName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  gameTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  comment: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
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
