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
    console.log('Fetching home statistics for location:', userLocation);
    // TODO: Implement statistics fetching with the new backend
    return {
      totalActiveGames: 125,
      todayGames: 15,
      nearbyGames: 5,
      popularSports: [
        { sportName: 'Football', count: 50 },
        { sportName: 'Basketball', count: 40 },
        { sportName: 'Tennis', count: 20 },
      ],
    };
  },
};
