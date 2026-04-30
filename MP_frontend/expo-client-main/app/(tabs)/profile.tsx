import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Settings,
  Star,
  MessageCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { authService } from '@/services/authService';
import { ratingService } from '@/services/ratingService';
import AppBackground from '@/components/AppBackground';

type MenuItem = {
  label: string;
  href?: string;
  onPress?: () => void;
};

const GAME_MENU_ITEMS: MenuItem[] = [
  { label: 'Planladığım Oyunlar', href: '/my/games' },
  { label: 'Katıldığım Oyunlar', href: '/my/joined-games' },
  { label: 'Bekleme Listesi', href: '/my/waitlist' },
  { label: 'Geçmiş Oyunlar', href: '/my/completed-games' },
  { label: 'İstek Geçmişi', href: '/my/requests' },
  {
    label: 'Arkadaşlarım',
    onPress: () =>
      Alert.alert('Yakında', 'Bu özellik üzerinde çalışıyoruz.'),
  },
  { label: 'Şikayetlerim', href: '/my/complaints' },
];

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [, setLoadingRating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const refreshUser = async () => {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userId = currentUser.id || (currentUser as { _id?: string })._id;
          if (userId) {
            setLoadingRating(true);
            try {
              const ratingData = await ratingService.getUserAverageRating(userId);
              setAverageRating(ratingData.averageRating);
            } catch (error) {
              console.error('[ProfileScreen] Rating yüklenirken hata:', error);
            } finally {
              setLoadingRating(false);
            }
          }
        }
      };
      refreshUser();
    }, [setUser])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/(tabs)/settings');
  };

  const activityCount =
    typeof user?.totalGames === 'number' ? user.totalGames : user?.points ?? 0;

  const navigateMenu = (item: MenuItem) => {
    if (item.onPress) {
      item.onPress();
      return;
    }
    if (item.href) {
      router.push(item.href as any);
    }
  };

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>Profil</Text>
            <TouchableOpacity onPress={handleSettings} hitSlop={12}>
              <Settings size={26} color={colors.secondary[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handleEditProfile} activeOpacity={0.85}>
              {user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>
                    {user?.firstName?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileTexts}>
              <Text style={styles.displayName} numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.university} numberOfLines={2}>
                {user?.university || 'Üniversite eklenmedi'}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Star
                    size={18}
                    color={colors.secondary[400]}
                    fill={colors.secondary[400]}
                  />
                  <Text style={styles.statValue}>
                    {averageRating != null ? averageRating.toFixed(1) : '—'}
                  </Text>
                </View>
                <View style={styles.statChip}>
                  <MessageCircle size={18} color={colors.primary[300]} />
                  <Text style={styles.statValue}>{activityCount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.commentsBtn}
                  onPress={() => router.push('/my/ratings' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.commentsBtnText}>Yorumları görüntüle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleEditProfile} style={styles.editLink}>
            <Text style={styles.editLinkText}>Profili düzenle</Text>
          </TouchableOpacity>

          <View style={styles.gameDetailsSection}>
            <Text style={styles.sectionHeading}>Oyun Detayları</Text>
            <View style={styles.menuList}>
              {GAME_MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => navigateMenu(item)}
                  style={({ pressed }) => [
                    styles.menuPressable,
                    pressed && styles.menuPressablePressed,
                  ]}
                >
                  <LinearGradient
                    colors={[colors.primary[800], colors.primary[700]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.menuGradient}
                  >
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <ChevronRight size={20} color={colors.text.tertiary} />
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.xxl,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    screenTitle: {
      fontSize: typography.sizes.xxxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
      borderColor: `${colors.secondary[400]}66`,
    },
    avatarPlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.primary[700],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: `${colors.secondary[400]}66`,
    },
    avatarLetter: {
      fontSize: 36,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    profileTexts: {
      flex: 1,
      minWidth: 0,
    },
    displayName: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    university: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      lineHeight: typography.sizes.sm * typography.lineHeights.normal,
      marginBottom: spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
    },
    statChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.06)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
    },
    statValue: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.semibold,
      color: colors.text.primary,
    },
    commentsBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.secondary[400],
      backgroundColor: 'transparent',
    },
    commentsBtnText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.semibold,
      color: colors.text.primary,
    },
    editLink: {
      alignSelf: 'flex-start',
      marginLeft: spacing.lg,
      marginTop: spacing.md,
      paddingVertical: spacing.xs,
    },
    editLinkText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.secondary[400],
    },
    gameDetailsSection: {
      marginTop: spacing.xl,
      marginHorizontal: spacing.lg,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.xxl,
      borderTopWidth: 2,
      borderTopColor: colors.secondary[400],
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      overflow: 'hidden',
    },
    sectionHeading: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    menuList: {
      gap: spacing.sm,
    },
    menuPressable: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    menuPressablePressed: {
      opacity: 0.92,
    },
    menuGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: `${colors.secondary[400]}99`,
    },
    menuLabel: {
      flex: 1,
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
    },
  });
}
