import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  ImageBackground,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, AlertCircle } from 'lucide-react-native';
import { darkColors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { statisticsService } from '@/services/statisticsService';
import { Game } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { homeCacheService } from '@/utils/homeCache';
import { resolveSportImage } from '@/utils/sportImages';

const BG = require('@/assets/images/app background.png');

type Palette = typeof darkColors;

const rowStyles = StyleSheet.create({
  rowWrap: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  rowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: 0,
    borderRadius: borderRadius.lg,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    paddingLeft: spacing.md,
  },
  leftIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sportImage: {
    width: 40,
    height: 40,
  },
  mid: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.semibold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
  },
  joinBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});

function FeaturedRow({
  game,
  colors,
  onOpen,
  onJoin,
}: {
  game: Game;
  colors: Palette;
  onOpen: (g: Game) => void;
  onJoin: (g: Game) => void;
}) {
  const source = useMemo(() => resolveSportImage(game.sportName), [game.sportName]);
  const line = useMemo(
    () => `${game.districtName} · ${game.venueName}`.replace(/\s·\s$/, '').trim(),
    [game.districtName, game.venueName]
  );
  return (
    <View style={rowStyles.rowWrap}>
      <LinearGradient
        colors={['#2A3348', colors.background.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={rowStyles.rowGradient}
      >
        <Pressable
          onPress={() => onOpen(game)}
          style={({ pressed }) => [rowStyles.rowMain, { opacity: pressed ? 0.92 : 1 }]}
        >
          <View style={rowStyles.leftIcon}>
            <Image source={source} style={rowStyles.sportImage} resizeMode="contain" />
          </View>
          <View style={rowStyles.mid}>
            <Text style={[rowStyles.title, { color: colors.text.primary }]} numberOfLines={1}>
              {game.title ? game.title : game.sportName}
            </Text>
            <View style={rowStyles.metaRow}>
              <Text style={[rowStyles.meta, { color: colors.text.tertiary }]} numberOfLines={1}>
                {game.currentPlayers}/{game.totalPlayers}
              </Text>
              <Text
                style={[rowStyles.meta, { color: colors.text.tertiary, flex: 1, marginLeft: spacing.sm }]}
                numberOfLines={1}
              >
                {line}
              </Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={() => onJoin(game)}
          style={({ pressed }) => [
            rowStyles.joinBtn,
            { backgroundColor: colors.secondary[400] },
            pressed && { opacity: 0.85 },
          ]}
          hitSlop={8}
        >
          <UserPlus size={20} color={colors.neutral[0]} />
        </Pressable>
      </LinearGradient>
    </View>
  );
}

export default function HomeScreen() {
  const [todayGames, setTodayGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const palette = darkColors;
  const styles = useMemo(() => createStyles(palette, insets.top, insets.bottom), [insets.top, insets.bottom]);

  const twoColWidth = (Dimensions.get('window').width - spacing.lg * 2 - spacing.sm) / 2;

  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setError(null);

      if (!forceRefresh) {
        const cachedData = await homeCacheService.loadCache();
        if (cachedData) {
          setTodayGames(cachedData.todayGames ?? []);
          setIsLoading(false);
          setRefreshing(false);
          return;
        }
      }

      setIsLoading(true);
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const [stats, instant, todayG] = await Promise.all([
        statisticsService.getHomeStatistics(),
        gameService.getGames({
          startDateFrom: now,
          startDateTo: twoHoursLater,
          availableOnly: true,
        }),
        gameService.getGames({
          startDateFrom: today,
          startDateTo: tomorrow,
          availableOnly: true,
        }),
      ]);

      setTodayGames(todayG);

      await homeCacheService.saveCache({
        statistics: stats,
        instantGames: instant,
        todayGames: todayG,
      });
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Error loading home data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && pathname === '/home') {
      loadData();
    }
  }, [user?.id, isAuthenticated, pathname]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, []);

  const onOpenGame = useCallback(
    (game: Game) => {
      router.push(`/game/${game.id}` as any);
    },
    [router]
  );

  const onJoinGame = useCallback(
    (game: Game) => {
      router.push(`/game/${game.id}` as any);
    },
    [router]
  );

  if (isLoading && !refreshing) {
    return (
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.secondary[400]} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </ImageBackground>
    );
  }

  const featured = todayGames.slice(0, 10);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary[200]}
            progressViewOffset={insets.top}
          />
        }
      >
        <View style={[styles.topPad, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.headline}>
            Hemen bir odaya katıl ve{'\n'}sosyalleşmeye başla!
          </Text>
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/discover')}
            style={({ pressed }) => [styles.ctaCell, { width: twoColWidth }, { opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={['#3D5A8C', palette.primary[800]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaInner}
            >
              <Text style={styles.ctaText}>Buluşma Keşfet</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/create')}
            style={({ pressed }) => [styles.ctaCell, { width: twoColWidth }, { opacity: pressed ? 0.9 : 1 }]}
          >
            <LinearGradient
              colors={['#8B4D6B', '#1A2550', palette.background.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaInner}
            >
              <Text style={styles.ctaText}>Buluşma Oluştur</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={palette.error[400]} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        <View style={[styles.sheet, shadows.md]}>
          <View style={styles.sheetHead}>
            <View style={styles.sheetBadge}>
              <Text style={styles.sheetTitle}>Öne Çıkanlar</Text>
              <Text style={styles.sheetSubtitle}>2 km çevrede</Text>
            </View>
          </View>

          {featured.length === 0 ? (
            <Text style={styles.emptyText}>
              Bugün listelenebilecek oyun bulunamadı. Yeni bir buluşma oluşturun veya keşfet sayfasını deneyin.
            </Text>
          ) : (
            featured.map((game) => (
              <FeaturedRow
                key={game.id}
                game={game}
                colors={palette}
                onOpen={onOpenGame}
                onJoin={onJoinGame}
              />
            ))
          )}
        </View>
        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </ImageBackground>
  );
}

function createStyles(colors: Palette, _topInset: number, bottomInset: number) {
  return StyleSheet.create({
    bg: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: bottomInset + 90,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    topPad: {
      paddingHorizontal: spacing.lg,
    },
    headline: {
      fontSize: typography.sizes.xxxl,
      lineHeight: typography.sizes.xxxl * typography.lineHeights.tight,
      fontFamily: typography.fontFamily.semibold,
      color: colors.text.primary,
      textAlign: 'center',
    },
    ctaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    ctaCell: {
      minHeight: 112,
      borderRadius: borderRadius.xxl,
      overflow: 'hidden',
    },
    ctaInner: {
      flex: 1,
      minHeight: 112,
      borderRadius: borderRadius.xxl,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    ctaText: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.neutral[0],
      textAlign: 'center',
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.md,
      backgroundColor: 'rgba(0,0,0,0.25)',
      borderRadius: borderRadius.lg,
    },
    errorBannerText: {
      flex: 1,
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.error[200],
    },
    sheet: {
      alignSelf: 'stretch',
      marginHorizontal: spacing.lg,
      backgroundColor: colors.background.secondary,
      borderTopWidth: 2,
      borderTopColor: colors.secondary[400],
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      borderBottomLeftRadius: borderRadius.lg,
      borderBottomRightRadius: borderRadius.lg,
      padding: spacing.lg,
    },
    sheetHead: {
      marginBottom: spacing.md,
    },
    sheetBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary[500],
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.md,
    },
    sheetTitle: {
      fontSize: typography.sizes.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    sheetSubtitle: {
      fontSize: typography.sizes.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginTop: 2,
    },
    emptyText: {
      fontSize: typography.sizes.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.tertiary,
      textAlign: 'center',
      lineHeight: typography.sizes.sm * typography.lineHeights.normal,
    },
  });
}
