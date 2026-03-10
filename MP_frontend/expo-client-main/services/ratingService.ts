import { API_URL } from '@/config/api';

export interface Rating {
  id: string;
  rater: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  game: {
    id: string;
    title: string;
    sportName: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PendingRating {
  gameId: string;
  gameTitle: string;
  endTime: string;
  usersToRate: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
}

export interface ParticipantWithRating {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  hasRated: boolean;
  rating?: number;
  comment?: string;
  ratingId?: string;
}

export interface GameRatingsResponse {
  participants: ParticipantWithRating[];
  allRated: boolean;
}

export const ratingService = {
  createRating: async (
    gameSessionId: string,
    ratedId: string,
    rating: number,
    comment: string,
    token: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameSessionId,
          ratedId,
          rating,
          comment: comment || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Oylama yapılamadı');
      }
    } catch (error: any) {
      console.error('[ratingService] createRating error:', error);
      throw error;
    }
  },

  getUserRatings: async (userId: string): Promise<Rating[]> => {
    try {
      const response = await fetch(`${API_URL}/ratings/user/${userId}`);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Yorumlar getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[ratingService] getUserRatings error:', error);
      throw error;
    }
  },

  getPendingRatings: async (token: string): Promise<PendingRating[]> => {
    try {
      const response = await fetch(`${API_URL}/ratings/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleyen oylamalar getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[ratingService] getPendingRatings error:', error);
      throw error;
    }
  },

  getGameRatings: async (gameId: string, token: string): Promise<GameRatingsResponse> => {
    try {
      const response = await fetch(`${API_URL}/ratings/game/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Oyun oylamaları getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[ratingService] getGameRatings error:', error);
      throw error;
    }
  },

  getUserAverageRating: async (userId: string): Promise<{
    averageRating: number | null;
    totalRatings: number;
    gamesWithRatings: number;
    gameAverages: Array<{
      gameId: string;
      averageRating: number;
      ratingCount: number;
    }>;
  }> => {
    try {
      const response = await fetch(`${API_URL}/ratings/user/${userId}/average`);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Ortalama puan getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[ratingService] getUserAverageRating error:', error);
      throw error;
    }
  },

  getGameUserAverageRating: async (gameId: string, userId: string): Promise<{
    averageRating: number | null;
    ratingCount: number;
  }> => {
    try {
      const response = await fetch(`${API_URL}/ratings/game/${gameId}/user/${userId}/average`);

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Oyun için ortalama puan getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[ratingService] getGameUserAverageRating error:', error);
      throw error;
    }
  },
};
