import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { router, usePathname } from 'expo-router';
import { Trophy, Calendar, MapPin, TrendingUp, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { statisticsService, GameStatistics } from '@/services/statisticsService';
// import { useLocation } from '@/hooks/useLocation'; // Konum hook'unu devre dışı bırak
import { Game } from '@/types';
import StatisticsCard from '@/components/home/StatisticsCard';
import InstantGamesSection from '@/components/home/InstantGamesSection';
import QuickFilters, { QuickFilterType } from '@/components/home/QuickFilters';
import GameCard from '@/components/GameCard';
import Button from '@/components/Button';

import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { homeCacheService } from '@/utils/homeCache';

export default function HomeScreen() {
  const [statistics, setStatistics] = useState<GameStatistics | null>(null);
  const [instantGames, setInstantGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [activeFilter, setActiveFilter] = useState<QuickFilterType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // --- KONUM ÖZELLİĞİ GEÇİCİ OLARAK DEVRE DIŞI BIRAKILDI ---
  const location = null;
  const locationError = null;
  const hasPermission = true; // Banner'ı gizlemek için true varsayalım
  // const { location, error: locationError, hasPermission, requestPermission, isLoading: isLocationLoading } = useLocation();
  // ---------------------------------------------------------

  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setError(null);

      // Önce cache'i kontrol et (forceRefresh değilse)
      if (!forceRefresh) {
        const cachedData = await homeCacheService.loadCache();
        if (cachedData) {
          console.log('[Home] Using cached data');
          setStatistics(cachedData.statistics);
          setInstantGames(cachedData.instantGames);
          setFilteredGames(cachedData.todayGames);
          setIsLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Cache yoksa veya force refresh ise API'den çek
      console.log('[Home] Fetching fresh data from API');
      setIsLoading(true);

      const [stats, instant, today] = await Promise.all([
        statisticsService.getHomeStatistics(),
        gameService.getGames({
          instantGames: true,
        }),
        gameService.getGames({
          dateRange: 'today',
          maxDistance: 2,
        }),
      ]);

      setStatistics(stats);
      setInstantGames(instant);
      setFilteredGames(today);

      // Cache'e kaydet
      await homeCacheService.saveCache({
        statistics: stats,
        instantGames: instant,
        todayGames: today,
      });

      console.log('[Home] Data cached successfully');
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Error loading home data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredGames = async (filter: QuickFilterType): Promise<Game[]> => {
    switch (filter) {
      case 'today':
        return gameService.getGames({
          dateRange: 'today',
          // userLocation: location || undefined, // Konum parametresini kaldır
        });
      case 'tomorrow':
        return gameService.getGames({
          dateRange: 'tomorrow',
          // userLocation: location || undefined, // Konum parametresini kaldır
        });
      case 'week':
        return gameService.getGames({
          dateRange: 'week',
          // userLocation: location || undefined, // Konum parametresini kaldır
        });
      case 'nearby':
         // Bu özellik geçici olarak devre dışı
        return Promise.resolve([]);
      case 'instant':
        return gameService.getGames({
          instantGames: true,
          // userLocation: location || undefined, // Konum parametresini kaldır
        });
      default:
        return [];
    }
  };

  useEffect(() => {
    // Bu bileşen arka planda yüklense bile, sadece kullanıcı giriş yapmışsa
    // VE şu anki yol (path) '/home' ise, yani bu ekran aktif olarak
    // görünüyorsa verileri yükle. Bu, başlangıçtaki gereksiz yüklemeyi önler.
    if (isAuthenticated && pathname === '/home') {
      loadData();
    }
  }, [user, isAuthenticated, pathname]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true); // Force refresh - cache'i atla
  };

  const handleFilterPress = async (filter: QuickFilterType) => {
    try {
      if (activeFilter === filter) {
        setActiveFilter(null);
        // Cache'den bugünkü oyunları yükle, yoksa API'den çek
        const cachedData = await homeCacheService.loadCache();
        if (cachedData && cachedData.todayGames.length > 0) {
          setFilteredGames(cachedData.todayGames);
        } else {
          const defaultGames = await gameService.getGames({
            dateRange: 'today',
            maxDistance: 2,
          });
          setFilteredGames(defaultGames);
        }
      } else {
        setActiveFilter(filter);
        // Anlık oyunlar için cache kullan
        if (filter === 'instant') {
          const cachedData = await homeCacheService.loadCache();
          if (cachedData && cachedData.instantGames.length > 0) {
            setFilteredGames(cachedData.instantGames);
            return;
          }
        }
        const filtered = await getFilteredGames(filter);
        setFilteredGames(filtered);
      }
    } catch (error) {
      console.error('Error handling filter press:', error);
    }
  };

  // handleRequestLocation fonksiyonunu devre dışı bırakabilir veya silebiliriz.
  // const handleRequestLocation = async () => { ... };

  const handleGamePress = (game: Game) => {
    router.push(`/game/${game.id}` as any);
  };

  const getFilterTitle = () => {
    if (!activeFilter) return 'Bugünkü Oyunlar';
    switch (activeFilter) {
      case 'today': return 'Bugünkü Oyunlar';
      case 'tomorrow': return 'Yarınki Oyunlar';
      case 'week': return 'Bu Haftaki Oyunlar';
      case 'nearby': return 'Yakınımdaki Oyunlar';
      case 'instant': return 'Anlık Oyunlar';
      default: return 'Oyunlar';
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary[500]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ana Sayfa</Text>
        <Text style={styles.subtitle}>MatchPlay'e hoş geldiniz!</Text>
      </View>

      {/* --- KONUM BANNER'LARI GEÇİCİ OLARAK DEVRE DIŞI BIRAKILDI ---
      {!hasPermission && !locationError && (
        <View style={styles.locationBanner}>
          <MapPin size={20} color={colors.primary[500]} />
          <Text style={styles.locationBannerText}>
            Yakınızdaki oyunları görmek için konum izni verin
          </Text>
          <Pressable onPress={handleRequestLocation}>
            <Text style={styles.locationBannerButton}>İzin Ver</Text>
          </Pressable>
        </View>
      )}

      {locationError && hasPermission && (
        <View style={styles.errorBanner}>
          <AlertCircle size={20} color={colors.error[500]} />
          <Text style={styles.errorBannerText}>{locationError}</Text>
        </View>
      )}
      --------------------------------------------------------- */}

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={20} color={colors.error[500]} />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {statistics && (
        <View style={styles.statisticsContainer}>
          <View style={styles.statisticsRow}>
            <StatisticsCard
              title="Aktif Oyun"
              value={statistics.totalActiveGames}
              icon={Trophy}
              color={colors.primary[500]}
            />
            <StatisticsCard
              title="Bugün"
              value={statistics.todayGames}
              icon={Calendar}
              color={colors.secondary[500]}
            />
          </View>
          <View style={styles.statisticsRow}>
            <StatisticsCard
              title="Yakınımda"
              value={location ? statistics.nearbyGames : '-'}
              icon={MapPin}
              color={colors.success[500]}
            />
            <StatisticsCard
              title="Popüler"
              value={statistics.popularSports[0]?.sportName || '-'}
              icon={TrendingUp}
              color={colors.error[500]}
            />
          </View>
        </View>
      )}

      {statistics?.popularSports && statistics.popularSports.length > 0 && (
        <View style={styles.popularSportsContainer}>
          <Text style={styles.sectionTitle}>Popüler Sporlar</Text>
          <View style={styles.popularSportsList}>
            {statistics.popularSports.map((sport, index) => (
              <View key={index} style={styles.popularSportItem}>
                <Text style={styles.popularSportName}>{sport.sportName}</Text>
                <View style={styles.popularSportBadge}>
                  <Text style={styles.popularSportCount}>{sport.count} oyun</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <InstantGamesSection games={instantGames} isLoading={false} />

      <QuickFilters
        activeFilter={activeFilter}
        onFilterPress={handleFilterPress}
        nearbyCount={0} // Yakınımda sayısını 0 olarak ayarlıyoruz
        instantCount={instantGames.length}
      />

      <View style={styles.gamesSection}>
        <View style={styles.gamesSectionHeader}>
          <Text style={styles.sectionTitle}>{getFilterTitle()}</Text>
          <Pressable onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.viewAllText}>Tümünü Gör</Text>
          </Pressable>
        </View>

        {filteredGames.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Oyun bulunamadı</Text>
            <Text style={styles.emptyText}>
              Seçtiğiniz filtreye uygun oyun yok. Yeni oyun oluşturabilir veya filtreleri değiştirebilirsiniz.
            </Text>
            <Button
              title="Yeni Oyun Oluştur"
              onPress={() => router.push('/(tabs)/create')}
              style={styles.createButton}
            />
          </View>
        ) : (
          <View style={styles.gamesList}>
            {filteredGames.slice(0, 5).map((game) => (
              <GameCard key={game.id} game={game} onPress={handleGamePress} />
            ))}
            {filteredGames.length > 5 && (
              <Button
                title={`${filteredGames.length - 5} Oyun Daha Göster`}
                onPress={() => router.push('/(tabs)/discover')}
                variant="outline"
                style={styles.showMoreButton}
              />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral[0],
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    margin: spacing.md,
  },
  locationBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  locationBannerButton: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.error[50],
    borderRadius: borderRadius.md,
    margin: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error[700],
  },
  statisticsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statisticsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  popularSportsContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  popularSportsList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  popularSportItem: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  popularSportName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  popularSportBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  popularSportCount: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.primary[500],
  },
  gamesSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  gamesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[500],
  },
  gamesList: {
    gap: 0,
  },
  emptyContainer: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
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
    marginBottom: spacing.lg,
  },
  createButton: {
    minWidth: 200,
  },
  showMoreButton: {
    marginTop: spacing.md,
  },
});
