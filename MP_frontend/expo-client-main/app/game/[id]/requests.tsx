import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, Trophy, Calendar, X, Check, XCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import { GameRequest, User as UserType } from '@/types';
import { gameRequestService } from '@/services/gameRequestService';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';

export default function GameRequestsScreen() {
  const { id } = useLocalSearchParams<{ id: string[] }>();
  const gameId = id?.[0];
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadRequests();
    }
  }, [gameId]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await gameRequestService.getGameRequests(gameId!);
      setRequests(data);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstekler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await gameRequestService.acceptJoinRequest(requestId, gameId!);
      Alert.alert('Başarılı', 'İstek kabul edildi');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek kabul edilirken hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await gameRequestService.rejectJoinRequest(requestId);
      Alert.alert('Başarılı', 'İstek reddedildi');
      await loadRequests();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İstek reddedilirken hata oluştu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (requestUser: UserType) => {
    setSelectedUser(requestUser);
    setModalVisible(true);
  };

  const getSkillLevelLabel = (level?: string) => {
    if (!level) return 'Belirtilmemiş';
    const labels: Record<string, string> = {
      beginner: 'Başlangıç',
      intermediate: 'Orta',
      advanced: 'İleri',
    };
    return labels[level] || level;
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Katılım İstekleri</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {requests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>İstek Yok</Text>
              <Text style={styles.emptyText}>Henüz bu oyun için katılım isteği gelmedi</Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {requests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <Pressable
                    onPress={() => request.user && handleViewProfile(request.user)}
                    style={styles.userInfo}
                  >
                    <View style={styles.avatar}>
                      <User size={24} color={colors.neutral[600]} />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {request.user?.firstName} {request.user?.lastName}
                      </Text>
                      <View style={styles.userStats}>
                        <View style={styles.statItem}>
                          <Trophy size={14} color={colors.secondary[500]} />
                          <Text style={styles.statText}>
                            {request.user?.averageRating?.toFixed(1) || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Calendar size={14} color={colors.text.tertiary} />
                          <Text style={styles.statText}>
                            {request.user?.totalGames || 0} oyun
                          </Text>
                        </View>
                      </View>
                      {request.user?.skillLevel && (
                        <Text style={styles.skillLevel}>
                          {getSkillLevelLabel(request.user.skillLevel)}
                        </Text>
                      )}
                    </View>
                  </Pressable>

                  {request.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageLabel}>Mesaj:</Text>
                      <Text style={styles.messageText}>{request.message}</Text>
                    </View>
                  )}

                  <View style={styles.actionsContainer}>
                    <Button
                      title="Reddet"
                      onPress={() => handleRejectRequest(request.id)}
                      variant="secondary"
                      loading={actionLoading === request.id}
                      style={styles.actionButton}
                      leftIcon={<XCircle size={18} color={colors.error[500]} />}
                    />
                    <Button
                      title="Kabul Et"
                      onPress={() => handleAcceptRequest(request.id)}
                      variant="primary"
                      loading={actionLoading === request.id}
                      style={styles.actionButton}
                      leftIcon={<Check size={18} color={colors.neutral[0]} />}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kullanıcı Profili</Text>
                <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <X size={24} color={colors.text.primary} />
                </Pressable>
              </View>

              {selectedUser && (
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.profileSection}>
                    <View style={styles.profileAvatar}>
                      <User size={48} color={colors.neutral[600]} />
                    </View>
                    <Text style={styles.profileName}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Text>
                    <Text style={styles.profileEmail}>{selectedUser.email}</Text>
                  </View>

                  <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                      <Trophy size={24} color={colors.secondary[500]} />
                      <Text style={styles.statCardValue}>
                        {selectedUser.averageRating?.toFixed(1) || 'N/A'}
                      </Text>
                      <Text style={styles.statCardLabel}>Ortalama Puan</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Calendar size={24} color={colors.primary[500]} />
                      <Text style={styles.statCardValue}>{selectedUser.totalGames || 0}</Text>
                      <Text style={styles.statCardLabel}>Toplam Oyun</Text>
                    </View>
                  </View>

                  {selectedUser.bio && (
                    <View style={styles.bioSection}>
                      <Text style={styles.sectionTitle}>Hakkında</Text>
                      <Text style={styles.bioText}>{selectedUser.bio}</Text>
                    </View>
                  )}

                  {selectedUser.sports && selectedUser.sports.length > 0 && (
                    <View style={styles.sportsSection}>
                      <Text style={styles.sectionTitle}>İlgi Alanları</Text>
                      <View style={styles.sportsList}>
                        {selectedUser.sports.map((sport, index) => (
                          <View key={index} style={styles.sportChip}>
                            <Text style={styles.sportChipText}>{sport}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedUser.skillLevel && (
                    <View style={styles.skillSection}>
                      <Text style={styles.sectionTitle}>Yetenek Seviyesi</Text>
                      <Text style={styles.skillText}>
                        {getSkillLevelLabel(selectedUser.skillLevel)}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  requestsList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  skillLevel: {
    fontSize: typography.sizes.sm,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
  messageContainer: {
    backgroundColor: colors.neutral[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  messageLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '80%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  statsSection: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  bioSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  bioText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  sportsSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  sportsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sportChip: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sportChipText: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    fontWeight: typography.weights.medium,
  },
  skillSection: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  skillText: {
    fontSize: typography.sizes.md,
    color: colors.primary[500],
    fontWeight: typography.weights.medium,
  },
});
