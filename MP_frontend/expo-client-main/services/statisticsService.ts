import { API_URL } from '@/config/api';

export interface GameStatistics {
  totalActiveGames: number;
  todayGames: number;
  nearbyGames: number;
  popularSports: Array<{ sportName: string; count: number }>;
}

export const statisticsService = {
  getHomeStatistics: async (
    userLocation?: { latitude: number; longitude: number }
  ): Promise<GameStatistics> => {
    try {
      console.log('[statisticsService] İstatistikler hesaplanıyor...');
      
      // Backend'den tüm oyunları çek
      const response = await fetch(`${API_URL}/games/sessions`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('İstatistikler getirilemedi');
      }
      
      const sessions = data.data || [];
      
      // Aktif oyunlar (open ve full durumunda olanlar)
      const activeGames = sessions.filter((s: any) => 
        s.status === 'open' || s.status === 'full'
      );
      
      // Bugünkü oyunlar
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayGames = activeGames.filter((s: any) => {
        if (!s.startDate) return false;
        const gameDate = new Date(s.startDate);
        return gameDate >= today && gameDate < tomorrow;
      });
      
      // Popüler sporlar (oyun tipine göre grupla)
      const sportCounts: Record<string, number> = {};
      activeGames.forEach((s: any) => {
        const sportName = s.gameType?.name || 'Diğer';
        sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
      });
      
      const popularSports = Object.entries(sportCounts)
        .map(([sportName, count]) => ({ sportName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // İlk 3 popüler spor
      
      return {
        totalActiveGames: activeGames.length,
        todayGames: todayGames.length,
        nearbyGames: 0, // Konum özelliği eklenince hesaplanacak
        popularSports,
      };
    } catch (error) {
      console.error('[statisticsService] Hata:', error);
      // Hata durumunda boş istatistikler dön
      return {
        totalActiveGames: 0,
        todayGames: 0,
        nearbyGames: 0,
        popularSports: [],
      };
    }
  },
};
