import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import DiscoverGameRow from '@/components/DiscoverGameRow';
import GameFiltersModal, { GameFilters } from '@/components/GameFilters';
import Button from '@/components/Button';
import { Game } from '@/types';
import type { User as IndexedUser } from '@/types/index';
import AppBackground from '@/components/AppBackground';

const getDefaultFilters = (userGender?: 'male' | 'female' | 'other'): GameFilters => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(23, 59, 59, 999);

  let genderPreferences = ['herkes'];
  if (userGender === 'male') {
    genderPreferences = ['herkes', 'erkekler', 'karma_dengeli'];
  } else if (userGender === 'female') {
    genderPreferences = ['herkes', 'kizlar', 'karma_dengeli'];
  }

  return {
    nameSearch: '',
    gameTypeIds: [],
    cityId: null,
    districtId: null,
    maxDistance: 2,
    startDateFrom: today,
    startDateTo: tomorrow,
    availableOnly: true,
    genderPreferences: genderPreferences,
    skillLevels: [],
    feeType: 'all',
  };
};

export default function DiscoverScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const profileGender = (user as IndexedUser | null)?.gender;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<GameFilters>(() =>
    getDefaultFilters(profileGender)
  );
  const [searchDraft, setSearchDraft] = useState(activeFilters.nameSearch);

  useEffect(() => {
    setSearchDraft(activeFilters.nameSearch);
  }, [activeFilters.nameSearch]);

  useEffect(() => {
    const id = setTimeout(() => {
      const next = (searchDraft ?? '').trim();
      setActiveFilters((prev) => (prev.nameSearch === next ? prev : { ...prev, nameSearch: next }));
    }, 400);
    return () => clearTimeout(id);
  }, [searchDraft]);

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

  useEffect(() => {
    setActiveFilters(getDefaultFilters(profileGender));
  }, [profileGender]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGames();
  };

  const handleApplyFilters = (filters: GameFilters) => {
    setActiveFilters(filters);
    setIsLoading(true);
  };

  const getActiveFilterCount = () => {
    const defaults = getDefaultFilters(profileGender);
    let count = 0;

    if (activeFilters.nameSearch && activeFilters.nameSearch.trim()) count++;
    if (activeFilters.gameTypeIds.length > 0) count++;
    if (activeFilters.cityId) count++;
    if (activeFilters.districtId) count++;
    if (activeFilters.skillLevels.length > 0) count++;
    if (activeFilters.feeType !== 'all') count++;

    if (activeFilters.maxDistance !== defaults.maxDistance) count++;
    if (activeFilters.availableOnly !== defaults.availableOnly) count++;

    const hasCustomDate =
      activeFilters.startDateFrom?.getTime() !== defaults.startDateFrom?.getTime() ||
      activeFilters.startDateTo?.getTime() !== defaults.startDateTo?.getTime();
    if (hasCustomDate) count++;

    const hasCustomGender =
      JSON.stringify(activeFilters.genderPreferences) !== JSON.stringify(defaults.genderPreferences);
    if (hasCustomGender) count++;

    return count;
  };

  const handleGamePress = useCallback(
    (game: Game) => {
      router.push(`/game/${game.id}` as `/game/${string}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Game }) => <DiscoverGameRow game={item} onPress={handleGamePress} />,
    [handleGamePress]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Henüz oyun yok</Text>
      <Text style={styles.emptyText}>Seçtiğiniz filtrelere uygun oyun bulunamadı.</Text>
      <Button
        title="Filtreleri Sıfırla"
        onPress={() => {
          setActiveFilters(getDefaultFilters(profileGender));
        }}
        variant="outline"
        style={styles.emptyButton}
      />
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <AppBackground>
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary[400]} />
            <Text style={styles.loadingText}>Oyunlar yükleniyor...</Text>
          </View>
        </SafeAreaView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.page}>
          <Text style={styles.screenTitle}>Keşfet</Text>

          <View style={styles.searchRow}>
            <LinearGradient
              colors={['#1e2538', '#132456']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.searchShell}
            >
              <TextInput
                style={styles.searchInput}
                placeholder="Lobi ismi giriniz..."
                placeholderTextColor={colors.text.tertiary}
                value={searchDraft}
                onChangeText={setSearchDraft}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Search size={22} color={colors.neutral[0]} strokeWidth={2} />
            </LinearGradient>

            <Pressable
              style={styles.filterSquare}
              onPress={() => setFiltersVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Filtreler"
            >
              <SlidersHorizontal size={22} color={colors.neutral[0]} strokeWidth={2} />
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <View style={styles.listSurface}>
            <FlatList
              data={games}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={
                games.length === 0 ? styles.emptyListContent : styles.listContent
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.secondary[400]}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>

        <GameFiltersModal
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          filters={activeFilters}
          onApply={handleApplyFilters}
          userGender={profileGender}
        />
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
    page: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    screenTitle: {
      fontSize: typography.sizes.xxxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      paddingTop: spacing.sm,
      marginBottom: spacing.md,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    searchShell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      minHeight: 48,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    searchInput: {
      flex: 1,
      minHeight: 48,
      paddingVertical: spacing.sm,
      paddingRight: spacing.sm,
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    filterSquare: {
      marginLeft: spacing.sm,
      width: 48,
      height: 48,
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(0,0,0,0.35)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
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
      fontFamily: typography.fontFamily.bold,
      color: colors.neutral[0],
    },
    errorText: {
      fontSize: typography.sizes.sm,
      color: colors.error[400],
      marginBottom: spacing.sm,
    },
    listSurface: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      overflow: 'hidden',
      marginHorizontal: -spacing.md,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    listContent: {
      paddingBottom: spacing.xxl,
    },
    emptyListContent: {
      flexGrow: 1,
      paddingBottom: spacing.xxl,
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      minHeight: 280,
    },
    emptyTitle: {
      fontSize: typography.sizes.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    emptyText: {
      fontSize: typography.sizes.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    emptyButton: {
      minWidth: 200,
    },
  });
}
