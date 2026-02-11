import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SlidersHorizontal, MapPin, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from '@/components/GameCard';
import GameFiltersModal, { GameFilters } from '@/components/GameFilters';
import Button from '@/components/Button';
import { Game } from '@/types';

// Varsayılan filtreleri oluştur
const getDefaultFilters = (userGender?: 'male' | 'female' | 'other'): GameFilters => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2); // Bugün + yarın (2 gün)
  tomorrow.setHours(23, 59, 59, 999);
  
  // Kullanıcının cinsiyetine göre cinsiyet tercihleri
  let genderPreferences = ['herkes'];
  if (userGender === 'male') {
    genderPreferences = ['herkes', 'erkekler', 'karma_dengeli'];
  } else if (userGender === 'female') {
    genderPreferences = ['herkes', 'kizlar', 'karma_dengeli'];
  }
  
  return {
    nameSearch: '',
    gameTypeIds: [], // Tüm oyunlar
    cityId: null,
    districtId: null,
    maxDistance: 2, // 2 km
    startDateFrom: today, // Bugün başla
    startDateTo: tomorrow, // Yarın bitir
    availableOnly: true, // Sadece yer olan oyunlar
    genderPreferences: genderPreferences,
    skillLevels: [], // Tüm seviyeler
    feeType: 'all', // Tüm ücretler
  };
};

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<GameFilters>(
    getDefaultFilters(user?.gender as any)
  );

  // --- KONUM ÖZELLİĞİ GEÇİCİ OLARAK DEVRE DIŞI BIRAKILDI ---
  const location = null;
  const locationError = null;
  const hasPermission = true; // Banner'ı gizlemek için true varsayalım
  // const { location, error: locationError, hasPermission, requestPermission, isLoading: locationLoading } = useLocation();
  // ---------------------------------------------------------

  const loadGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedGames = await gameService.getGames({
        nameSearch: activeFilters.nameSearch,
        gameTypeIds: activeFilters.gameTypeIds,
        cityId: activeFilters.cityId,
        districtId: activeFilters.districtId,
        startDateFrom: activeFilters.startDateFrom,
        startDateTo: activeFilters.startDateTo,
        availableOnly: activeFilters.availableOnly,
        genderPreferences: activeFilters.genderPreferences,
        skillLevels: activeFilters.skillLevels,
        feeType: activeFilters.feeType,
      });
      
      setGames(fetchedGames);
    } catch (err) {
      console.error('[DiscoverScreen] Oyunlar yüklenirken hata:', err);
      setError('Oyunlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [activeFilters]);
  
  // Kullanıcı değiştiğinde varsayılan filtreleri güncelle
  useEffect(() => {
    setActiveFilters(getDefaultFilters(user?.gender as any));
  }, [user?.gender]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleApplyFilters = (filters: GameFilters) => {
    setActiveFilters(filters);
    setIsLoading(true);
  };

  // handleRequestLocation fonksiyonunu devre dışı bırakabilir veya silebiliriz.
  // const handleRequestLocation = async () => { ... };


  const getActiveFilterCount = () => {
    const defaults = getDefaultFilters(user?.gender as any);
    let count = 0;
    
    if (activeFilters.nameSearch && activeFilters.nameSearch.trim()) count++;
    if (activeFilters.gameTypeIds.length > 0) count++;
    if (activeFilters.cityId) count++;
    if (activeFilters.districtId) count++;
    if (activeFilters.skillLevels.length > 0) count++;
    if (activeFilters.feeType !== 'all') count++;
    
    // Varsayılandan farklıysa say
    if (activeFilters.maxDistance !== defaults.maxDistance) count++;
    if (activeFilters.availableOnly !== defaults.availableOnly) count++;
    
    // Tarih filtresi varsayılandan farklıysa
    const hasCustomDate = 
      activeFilters.startDateFrom?.getTime() !== defaults.startDateFrom?.getTime() ||
      activeFilters.startDateTo?.getTime() !== defaults.startDateTo?.getTime();
    if (hasCustomDate) count++;
    
    // Cinsiyet tercihi varsayılandan farklıysa
    const hasCustomGender = JSON.stringify(activeFilters.genderPreferences) !== JSON.stringify(defaults.genderPreferences);
    if (hasCustomGender) count++;
    
    return count;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>Keşfet</Text>
        <Pressable
          style={styles.filterButton}
          onPress={() => setFiltersVisible(true)}
        >
          <SlidersHorizontal size={20} color={colors.primary[500]} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* --- KONUM BANNER'LARI GEÇİCİ OLARAK DEVRE DIŞI BIRAKILDI ---
      {!hasPermission && !locationLoading && (
        <View style={styles.locationPrompt}>
          <MapPin size={16} color={colors.text.secondary} />
          <Text style={styles.locationPromptText}>
            Konumunuza göre oyunlar görmek için konum izni verin
          </Text>
          <Pressable onPress={handleRequestLocation}>
            <Text style={styles.locationPromptButton}>Konum Ver</Text>
          </Pressable>
        </View>
      )}

      {locationError && hasPermission && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color={colors.error[500]} />
          <Text style={styles.errorBannerText}>{locationError}</Text>
        </View>
      )}
      --------------------------------------------------------- */}

      <Text style={styles.resultCount}>
        {games.length} oyun bulundu
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Henüz oyun yok</Text>
      <Text style={styles.emptyText}>
        Seçtiğiniz filtrelere uygun oyun bulunamadı.
      </Text>
      <Button
        title="Filtreleri Sıfırla"
        onPress={() => {
          setActiveFilters(getDefaultFilters(user?.gender as any));
        }}
        variant="outline"
        style={styles.emptyButton}
      />
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Oyunlar yüklenyor...</Text>
      </View>
    );
  }

  const handleGamePress = (game: Game) => {
    router.push(`/game/${game.id}` as any);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        renderItem={({ item }) => <GameCard game={item} onPress={handleGamePress} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={games.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <GameFiltersModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={activeFilters}
        onApply={handleApplyFilters}
        userGender={user?.gender as any}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  filterButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[500],
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.neutral[0],
  },
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  locationPromptText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  locationPromptButton: {
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
    marginBottom: spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.error[700],
  },
  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
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
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
});
