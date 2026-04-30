import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { cancellationVoteService } from '@/services/cancellationVoteService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';

export default function VoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [vote, setVote] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadVoteDetails();
  }, [id]);

  const loadVoteDetails = async () => {
    try {
      if (!id || !user?.token) return;

      // VoteId ile oylama bilgisini getir
      const voteData = await cancellationVoteService.getCancellationVoteById(id, user.token);
      
      if (!voteData) {
        Alert.alert('Hata', 'Oylama bulunamadı');
        router.back();
        return;
      }

      setVote(voteData);

      // Oyun bilgilerini getir
      const gameData = await gameService.fetchGameSession(voteData.gameSessionId);
      setGame(gameData);

      // Kullanıcının oy kullanıp kullanmadığını kontrol et
      const userVote = voteData.votes.find((v: any) => v.userId?.toString() === user.id);
      if (userVote) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Oylama detayları yüklenirken hata:', error);
      Alert.alert('Hata', 'Oylama detayları yüklenemedi');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteChoice: 'approve' | 'reject') => {
    if (!user?.token || !vote) return;

    setActionLoading(true);
    try {
      await cancellationVoteService.submitVote(vote._id, voteChoice, user.token);
      
      const message = voteChoice === 'approve'
        ? 'Oyunun iptal edilmesini onayladınız'
        : 'Oyunun iptal edilmesini reddettiniz. Oyun devam edecek.';
      
      Alert.alert('Başarılı', message);
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Oy kullanılamadı');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Oyun İptal Oylaması',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: spacing.sm }}>
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

  if (!vote || !game) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Oyun İptal Oylaması',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: spacing.sm }}>
              <ChevronLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Oylama Durumu */}
          <View style={styles.voteStatusCard}>
            <Text style={styles.voteTitle}>Oyun İptal Oylaması</Text>
            <Text style={styles.voteMessage}>
              Katıldığınız oyunun iptal edilmesini kabul ediyor musunuz?
            </Text>
            {vote.status === 'pending' && (
              <Text style={styles.voteInfo}>
                {vote.votes.length} / {game.acceptedPlayers?.length || 0} katılımcı oy kullandı
              </Text>
            )}
          </View>

          {/* Oyun Detayları */}
          <View style={styles.gameCard}>
            <Text style={styles.sectionTitle}>Oyun Detayları</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Oyun Adı:</Text>
              <Text style={styles.detailValue}>{game.title}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Oyun Türü:</Text>
              <Text style={styles.detailValue}>{game.gameType?.name || 'Oyun'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Calendar size={16} color={colors.text.secondary} />
              <Text style={styles.detailValue}>{formatDate(game.startDate)}</Text>
            </View>

            {game.duration && (
              <View style={styles.detailRow}>
                <Clock size={16} color={colors.text.secondary} />
                <Text style={styles.detailValue}>{game.duration} dk</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={styles.detailValue}>
                {game.venueName || game.cityName}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Users size={16} color={colors.text.secondary} />
              <Text style={styles.detailValue}>
                {(game.acceptedPlayers?.length || 0) + 1} / {game.totalPlayers} kişi
              </Text>
            </View>
          </View>

          {/* Organizatör */}
          <View style={styles.organizerCard}>
            <Text style={styles.sectionTitle}>Organizatör</Text>
            <View style={styles.organizerInfo}>
              {game.creatorId?.profilePhoto ? (
                <Image source={{ uri: game.creatorId.profilePhoto }} style={styles.organizerAvatar} />
              ) : (
                <View style={[styles.organizerAvatar, styles.avatarPlaceholder]}>
                  <User size={20} color={colors.neutral[400]} />
                </View>
              )}
              <Text style={styles.organizerName}>
                {game.creatorId?.firstName} {game.creatorId?.lastName}
              </Text>
            </View>
          </View>

          {/* Oy Kullan Butonları */}
          {!hasVoted && vote.status === 'pending' && (
            <View style={styles.voteActions}>
              <TouchableOpacity
                style={[styles.voteButton, styles.approveButton]}
                onPress={() => handleVote('approve')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={colors.neutral[0]} />
                ) : (
                  <>
                    <CheckCircle size={20} color={colors.neutral[0]} />
                    <Text style={styles.voteButtonText}>İptal Etmeyi Onayla</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voteButton, styles.rejectButton]}
                onPress={() => handleVote('reject')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={colors.neutral[0]} />
                ) : (
                  <>
                    <XCircle size={20} color={colors.neutral[0]} />
                    <Text style={styles.voteButtonText}>İptal Etme</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Zaten Oy Kullandıysa */}
          {hasVoted && (
            <View style={styles.votedCard}>
              <CheckCircle size={24} color={colors.success[500]} />
              <Text style={styles.votedText}>Oyunuzu kullandınız</Text>
            </View>
          )}

          {/* Oylama Tamamlandıysa */}
          {vote.status !== 'pending' && (
            <View style={[styles.resultCard, vote.status === 'approved' ? styles.approvedCard : styles.rejectedCard]}>
              <Text style={styles.resultTitle}>
                {vote.status === 'approved' ? 'Oyun İptal Edildi' : 'Oyun Devam Ediyor'}
              </Text>
              <Text style={styles.resultMessage}>
                {vote.status === 'approved'
                  ? 'Tüm katılımcılar iptal etmeyi onayladı. Oyun iptal edildi.'
                  : 'En az bir katılımcı iptal etmeyi reddetti. Oyun devam edecek.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
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
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  voteStatusCard: {
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  voteTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.secondary[700],
    marginBottom: spacing.sm,
  },
  voteMessage: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  voteInfo: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  gameCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  organizerCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  voteActions: {
    gap: spacing.md,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  approveButton: {
    backgroundColor: colors.success[500],
  },
  rejectButton: {
    backgroundColor: colors.error[500],
  },
  voteButtonText: {
    color: colors.neutral[0],
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  votedCard: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  votedText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.success[700],
  },
  resultCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  approvedCard: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
  },
  rejectedCard: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  resultTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  resultMessage: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  });
}
