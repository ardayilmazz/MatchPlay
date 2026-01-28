import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game } from '@/types';
import { GameStatistics } from '@/services/statisticsService';

const CACHE_KEYS = {
  STATISTICS: '@home_statistics',
  INSTANT_GAMES: '@home_instant_games',
  TODAY_GAMES: '@home_today_games',
  LAST_UPDATE: '@home_last_update',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika cache süresi

interface HomeCache {
  statistics: GameStatistics | null;
  instantGames: Game[];
  todayGames: Game[];
  lastUpdate: number;
}

export const homeCacheService = {
  // Cache'i kaydet
  async saveCache(data: Omit<HomeCache, 'lastUpdate'>) {
    try {
      const timestamp = Date.now();
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.STATISTICS, JSON.stringify(data.statistics)),
        AsyncStorage.setItem(CACHE_KEYS.INSTANT_GAMES, JSON.stringify(data.instantGames)),
        AsyncStorage.setItem(CACHE_KEYS.TODAY_GAMES, JSON.stringify(data.todayGames)),
        AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, timestamp.toString()),
      ]);
      console.log('[HomeCache] Cache saved successfully');
    } catch (error) {
      console.error('[HomeCache] Error saving cache:', error);
    }
  },

  // Cache'i yükle
  async loadCache(): Promise<HomeCache | null> {
    try {
      const [statisticsStr, instantGamesStr, todayGamesStr, lastUpdateStr] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.STATISTICS),
        AsyncStorage.getItem(CACHE_KEYS.INSTANT_GAMES),
        AsyncStorage.getItem(CACHE_KEYS.TODAY_GAMES),
        AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE),
      ]);

      if (!lastUpdateStr) {
        console.log('[HomeCache] No cache found');
        return null;
      }

      const lastUpdate = parseInt(lastUpdateStr, 10);
      const now = Date.now();

      // Cache süresi dolmuş mu kontrol et
      if (now - lastUpdate > CACHE_DURATION) {
        console.log('[HomeCache] Cache expired');
        return null;
      }

      const cache: HomeCache = {
        statistics: statisticsStr ? JSON.parse(statisticsStr) : null,
        instantGames: instantGamesStr ? JSON.parse(instantGamesStr) : [],
        todayGames: todayGamesStr ? JSON.parse(todayGamesStr) : [],
        lastUpdate,
      };

      console.log('[HomeCache] Cache loaded successfully');
      return cache;
    } catch (error) {
      console.error('[HomeCache] Error loading cache:', error);
      return null;
    }
  },

  // Cache'i temizle
  async clearCache() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.STATISTICS),
        AsyncStorage.removeItem(CACHE_KEYS.INSTANT_GAMES),
        AsyncStorage.removeItem(CACHE_KEYS.TODAY_GAMES),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_UPDATE),
      ]);
      console.log('[HomeCache] Cache cleared');
    } catch (error) {
      console.error('[HomeCache] Error clearing cache:', error);
    }
  },

  // Cache'in geçerli olup olmadığını kontrol et
  async isCacheValid(): Promise<boolean> {
    try {
      const lastUpdateStr = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
      if (!lastUpdateStr) return false;

      const lastUpdate = parseInt(lastUpdateStr, 10);
      const now = Date.now();

      return (now - lastUpdate) <= CACHE_DURATION;
    } catch (error) {
      console.error('[HomeCache] Error checking cache validity:', error);
      return false;
    }
  },
};
