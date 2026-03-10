import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import Button from './Button';
import { ratingService } from '@/services/ratingService';

interface RatingModalProps {
  visible: boolean;
  userName: string;
  gameId: string;
  userId: string;
  token: string;
  onClose: () => void;
  onSuccess: (rating: number, comment: string) => void;
  onComplaint: () => void;
  viewOnly?: boolean;
  existingRating?: number;
  existingComment?: string;
}

export default function RatingModal({
  visible,
  userName,
  gameId,
  userId,
  token,
  onClose,
  onSuccess,
  onComplaint,
  viewOnly = false,
  existingRating,
  existingComment,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal açıldığında state'i sıfırla veya mevcut değerleri yükle
  useEffect(() => {
    if (visible) {
      if (viewOnly && existingRating) {
        setRating(existingRating);
        setComment(existingComment || '');
      } else {
        setRating(0);
        setComment('');
      }
    }
  }, [visible, viewOnly, existingRating, existingComment]);

  const handleStarPress = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Hata', 'Lütfen bir yıldız seçin');
      return;
    }

    // Oylamayı hemen göndermiyoruz, sadece kaydediyoruz
    // Kullanıcı tüm oylamaları yaptıktan sonra gönderecek
    onSuccess(rating, comment);
    setRating(0);
    setComment('');
    onClose();
  };

  const handleComplaint = () => {
    onClose();
    onComplaint();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {viewOnly ? 'Geçmiş Değerlendirme' : 'Kullanıcıyı Oyla'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.userName}>{userName}</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => !viewOnly && handleStarPress(value)}
                  style={styles.starButton}
                  disabled={viewOnly}
                >
                  <Star
                    size={40}
                    color={value <= rating ? colors.secondary[500] : colors.neutral[300]}
                    fill={value <= rating ? colors.secondary[500] : 'transparent'}
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.ratingText}>
              {rating === 0
                ? 'Yıldız seçin'
                : rating === 1
                ? 'Çok Kötü'
                : rating === 2
                ? 'Kötü'
                : rating === 3
                ? 'Orta'
                : rating === 4
                ? 'İyi'
                : 'Çok İyi'}
            </Text>

            <Text style={styles.label}>Yorum {viewOnly ? '' : '(İsteğe bağlı)'}</Text>
            <TextInput
              style={[styles.commentInput, viewOnly && styles.commentInputReadOnly]}
              placeholder={viewOnly ? 'Yorum yok' : 'Yorumunuzu yazın...'}
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={viewOnly ? undefined : setComment}
              maxLength={500}
              editable={!viewOnly}
            />
            {!viewOnly && <Text style={styles.charCount}>{comment.length}/500</Text>}

            {!viewOnly && (
              <Button
                title="Kullanıcıyı Şikayet Et"
                onPress={handleComplaint}
                variant="danger"
                style={styles.complaintButton}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            {viewOnly ? (
              <Button
                title="Kapat"
                onPress={onClose}
                variant="primary"
                style={styles.submitButton}
              />
            ) : (
              <>
                <Button
                  title="İptal"
                  onPress={onClose}
                  variant="secondary"
                  style={styles.cancelButton}
                />
                <Button
                  title="Gönder"
                  onPress={handleSubmit}
                  variant="primary"
                  loading={loading}
                  disabled={rating === 0}
                  style={styles.submitButton}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.md,
  },
  userName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  commentInput: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  commentInputReadOnly: {
    backgroundColor: colors.neutral[100],
    color: colors.text.secondary,
  },
  charCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  complaintButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
