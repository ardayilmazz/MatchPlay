import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ArrowLeft, User, Star } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { calculateAge } from '@/utils/userHelpers';
import { ratingService } from '@/services/ratingService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlayerProfileModalProps {
  visible: boolean;
  player: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    gender?: string;
    birthDate?: string;
  } | null;
  onClose: () => void;
}

const getGenderLabel = (gender?: string) => {
  const labels: Record<string, string> = {
    male: 'Erkek',
    female: 'Kadın',
    other: 'Belirtilmemiş',
  };
  return labels[gender || 'other'] || 'Belirtilmemiş';
};

export default function PlayerProfileModal({
  visible,
  player,
  onClose,
}: PlayerProfileModalProps) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    if (visible && player?._id) {
      setLoadingRating(true);
      ratingService
        .getUserAverageRating(player._id)
        .then((data) => {
          setAverageRating(data.averageRating);
        })
        .catch((error) => {
          console.error('[PlayerProfileModal] Rating yüklenirken hata:', error);
          setAverageRating(null);
        })
        .finally(() => {
          setLoadingRating(false);
        });
    } else {
      setAverageRating(null);
    }
  }, [visible, player?._id]);

  if (!player) return null;

  const age = player.birthDate ? calculateAge(player.birthDate) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton} hitSlop={10}>
              <ArrowLeft size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.headerTitle}>Oyuncu Profili</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profil Resmi */}
            <View style={styles.profileSection}>
              {player.profilePhoto ? (
                <Image
                  source={{ uri: player.profilePhoto }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <User size={64} color={colors.neutral[400]} />
                </View>
              )}

              <Text style={styles.userName}>
                {player.firstName} {player.lastName}
              </Text>

              {/* Yaş ve Cinsiyet */}
              <View style={styles.infoRow}>
                {age !== null && (
                  <>
                    <Text style={styles.infoText}>{age} yaşında</Text>
                    <Text style={styles.infoDivider}>•</Text>
                  </>
                )}
                <Text style={styles.infoText}>{getGenderLabel(player.gender)}</Text>
              </View>

              {/* Değerlendirme Puanı */}
              {averageRating !== null && (
                <View style={styles.ratingContainer}>
                  <Star size={20} color={colors.secondary[500]} fill={colors.secondary[500]} />
                  <Text style={styles.ratingText}>{averageRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: SCREEN_HEIGHT * 0.9,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[100],
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  infoDivider: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.secondary[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.secondary[700],
  },
});
