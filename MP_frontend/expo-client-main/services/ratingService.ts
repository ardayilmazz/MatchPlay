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
};
