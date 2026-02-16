import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { X, User, Briefcase, Calendar, MessageSquare } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameRequestService } from '@/services/gameRequestService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

interface JoinRequestModalProps {
  visible: boolean;
  requestId: string;
  onClose: () => void;
}

export default function JoinRequestModal({ visible, requestId, onClose }: JoinRequestModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);

  useEffect(() => {
    if (visible && requestId && user?.token) {
      loadRequestDetails();
    }
  }, [visible, requestId, user?.token]);

  const loadRequestDetails = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      const data = await gameRequestService.getRequestUserDetails(requestId, user.token);
      setRequestData(data);
    } catch (error: any) {
      console.error('[JoinRequestModal] Error loading request:', error);
      Alert.alert('Hata', 'İstek bilgileri yüklenemedi');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user?.token) return;

    setActionLoading(true);
    try {
      await gameRequestService.acceptJoinRequest(requestId, user.token);
      Alert.alert('Başarılı', 'Katılma isteği kabul edildi');
      onClose();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek kabul edilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user?.token) return;

    Alert.alert(
      'İsteği Reddet',
      'Bu kullanıcının katılma isteğini reddetmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await gameRequestService.rejectJoinRequest(requestId, user.token!);
              Alert.alert('İstek Reddedildi', 'Katılma isteği reddedildi');
              onClose();
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'İstek reddedilirken hata oluştu');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const getGenderLabel = (gender?: string) => {
    const labels: Record<string, string> = {
      male: 'Erkek',
      female: 'Kadın',
      other: 'Belirtilmemiş',
    };
    return labels[gender || 'other'] || 'Belirtilmemiş';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Katılma İsteği</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
          ) : requestData ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Profil Resmi */}
              <View style={styles.profileSection}>
                {requestData.user.profilePhoto ? (
                  <Image
                    source={{ uri: requestData.user.profilePhoto }}
                    style={styles.profilePhoto}
                  />
                ) : (
                  <View style={styles.profilePhotoPlaceholder}>
                    <User size={48} color={colors.neutral[400]} />
                  </View>
                )}

                <Text style={styles.userName}>
                  {requestData.user.firstName} {requestData.user.lastName}
                </Text>

                {/* Yaş ve Cinsiyet */}
                <View style={styles.infoRow}>
                  <Calendar size={16} color={colors.text.tertiary} />
                  <Text style={styles.infoText}>
                    {requestData.user.age ? `${requestData.user.age} yaşında` : 'Yaş belirtilmemiş'}
                  </Text>
                  <Text style={styles.infoDivider}>•</Text>
                  <Text style={styles.infoText}>{getGenderLabel(requestData.user.gender)}</Text>
                </View>
              </View>

              {/* Detay Bilgileri */}
              <View style={styles.detailsSection}>
                {/* Üniversite */}
                {requestData.user.university && (
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Briefcase size={20} color={colors.primary[500]} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Üniversite</Text>
                      <Text style={styles.detailValue}>{requestData.user.university}</Text>
                    </View>
                  </View>
                )}

                {/* Hakkımda */}
                {requestData.user.bio && (
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <MessageSquare size={20} color={colors.primary[500]} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Hakkımda</Text>
                      <Text style={styles.detailValue}>{requestData.user.bio}</Text>
                    </View>
                  </View>
                )}

                {/* Kullanıcının Mesajı */}
                {requestData.message && (
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageLabel}>Mesaj:</Text>
                    <Text style={styles.messageText}>{requestData.message}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>İstek bilgileri yüklenemedi</Text>
            </View>
          )}

          {/* Actions */}
          {!loading && requestData && (
            <View style={styles.actions}>
              <Button
                title="Reddet"
                onPress={handleReject}
                variant="danger"
                loading={actionLoading}
                style={styles.actionButton}
              />
              <Button
                title="Kabul Et"
                onPress={handleAccept}
                variant="primary"
                loading={actionLoading}
                style={styles.actionButton}
              />
            </View>
          )}
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
    maxHeight: '85%',
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
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
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
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  infoDivider: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  detailsSection: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  messageContainer: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  messageLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  errorContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButton: {
    flex: 1,
  },
});
