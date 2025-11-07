import { Game } from '@/types';
import { mockGames } from './mockData'; // We'll create this file later

interface GameFilterParams {
  sportIds?: string[];
  cityId?: string | null;
  districtId?: string | null;
  skillLevels?: string[];
  maxDistance?: number;
  userLocation?: { latitude: number; longitude: number };
  dateRange?: 'today' | 'tomorrow' | 'week' | 'all';
  onlyAvailable?: boolean;
  instantGames?: boolean;
}

export const gameService = {
  createGame: async (gameData: Omit<Game, 'id' | 'currentPlayers' | 'status' | 'createdAt'>): Promise<Game> => {
    console.log('Creating game:', gameData);
    // TODO: Implement game creation with the new backend
    const newGame: Game = {
      id: Math.random().toString(),
      ...gameData,
      currentPlayers: 1,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    return newGame;
  },

  getGames: async (filters?: GameFilterParams): Promise<Game[]> => {
    console.log('Fetching games with filters:', filters);
    // TODO: Implement game fetching with the new backend
    return mockGames;
  },

  getGameById: async (id: string): Promise<Game | null> => {
    console.log('Fetching game by id:', id);
    // TODO: Implement fetching game by id with the new backend
    return mockGames.find(g => g.id === id) || null;
  },

  getUserGames: async (userId: string): Promise<Game[]> => {
    console.log('Fetching games for user:', userId);
    // TODO: Implement fetching user games with the new backend
    return mockGames.filter(g => g.creatorId === userId);
  },

  joinGame: async (gameId: string, userId: string): Promise<Game> => {
    console.log(`User ${userId} joining game ${gameId}`);
    // TODO: Implement joining game with the new backend
    const game = mockGames.find(g => g.id === gameId);
    if (!game) throw new Error('Oyun bulunamadı');
    return { ...game, currentPlayers: game.currentPlayers + 1 };
  },

  leaveGame: async (gameId: string, userId: string): Promise<Game> => {
    console.log(`User ${userId} leaving game ${gameId}`);
    // TODO: Implement leaving game with the new backend
    const game = mockGames.find(g => g.id === gameId);
    if (!game) throw new Error('Oyun bulunamadı');
    return { ...game, currentPlayers: game.currentPlayers - 1 };
  },

  cancelGame: async (gameId: string, userId: string): Promise<void> => {
    console.log(`User ${userId} canceling game ${gameId}`);
    // TODO: Implement canceling game with the new backend
  },

  completeGame: async (gameId: string): Promise<void> => {
    console.log(`Completing game ${gameId}`);
    // TODO: Implement completing game with the new backend
  },
};
