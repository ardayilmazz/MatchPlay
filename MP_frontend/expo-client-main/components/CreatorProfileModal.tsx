import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { ArrowLeft, User, Calendar } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { calculateAge } from '../utils/userHelpers';

interface CreatorProfileModalProps {
  visible: boolean;
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    gender?: string;
    birthDate?: string;
    bio?: string;
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

export default function CreatorProfileModal({
  visible,
  creator,
  onClose,
}: CreatorProfileModalProps) {
  if (!creator) return null;

  const age = creator.birthDate ? calculateAge(creator.birthDate) : null;

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
            <Text style={styles.headerTitle}>Oyun Kurucu</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profil Resmi */}
            <View style={styles.profileSection}>
              {creator.profilePhoto ? (
                <Image
                  source={{ uri: creator.profilePhoto }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <User size={64} color={colors.neutral[400]} />
                </View>
              )}

              <Text style={styles.userName}>
                {creator.firstName} {creator.lastName}
              </Text>

              {/* Yaş ve Cinsiyet */}
              <View style={styles.infoRow}>
                {age !== null && (
                  <>
                    <Calendar size={16} color={colors.text.tertiary} />
                    <Text style={styles.infoText}>{age} yaşında</Text>
                    <Text style={styles.infoDivider}>•</Text>
                  </>
                )}
                <Text style={styles.infoText}>{getGenderLabel(creator.gender)}</Text>
              </View>
            </View>

            {/* Hakkımda */}
            {creator.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.sectionTitle}>Hakkımda</Text>
                <Text style={styles.bioText}>{creator.bio}</Text>
              </View>
            )}
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
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '90%',
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
    fontFamily: typography.fontFamily.bold,
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
    fontFamily: typography.fontFamily.bold,
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
  bioSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primary[900],
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
});
