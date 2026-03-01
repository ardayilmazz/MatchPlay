import { WaitlistEntry } from '@/types/index';
import { API_URL } from '@/config/api';

export const waitlistService = {
  addToWaitlist: async (gameId: string, token: string): Promise<WaitlistEntry> => {
    try {
      console.log(`[waitlistService] Waitlist'e ekleniyor - gameId: ${gameId}`);

      const response = await fetch(`${API_URL}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ gameSessionId: gameId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleme listesine eklenemedi');
      }

      return {
        id: data.data._id.toString(),
        gameId: data.data.gameSessionId.toString(),
        userId: data.data.userId.toString(),
        position: data.data.position,
        status: data.data.status,
        createdAt: data.data.createdAt,
      };
    } catch (error: any) {
      console.error('[waitlistService] addToWaitlist error:', error);
      throw error;
    }
  },

  removeFromWaitlist: async (waitlistId: string, token: string): Promise<void> => {
    try {
      console.log(`[waitlistService] Waitlist'ten çıkarılıyor - waitlistId: ${waitlistId}`);

      const response = await fetch(`${API_URL}/waitlist/${waitlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleme listesinden çıkarılamadı');
      }
    } catch (error: any) {
      console.error('[waitlistService] removeFromWaitlist error:', error);
      throw error;
    }
  },

  getUserWaitlist: async (token: string): Promise<WaitlistEntry[]> => {
    try {
      console.log(`[waitlistService] Kullanıcı waitlist'i getiriliyor`);

      const response = await fetch(`${API_URL}/waitlist/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleme listesi getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[waitlistService] getUserWaitlist error:', error);
      throw error;
    }
  },

  getGameWaitlist: async (gameId: string, token: string): Promise<WaitlistEntry[]> => {
    try {
      console.log(`[waitlistService] Oyun waitlist'i getiriliyor - gameId: ${gameId}`);

      const response = await fetch(`${API_URL}/waitlist/game/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleme listesi getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[waitlistService] getGameWaitlist error:', error);
      throw error;
    }
  },

  getWaitlistEntry: async (gameId: string, token: string): Promise<WaitlistEntry | null> => {
    try {
      console.log(`[waitlistService] Waitlist entry kontrol ediliyor - gameId: ${gameId}`);

      const response = await fetch(`${API_URL}/waitlist/game/${gameId}/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bekleme listesi kaydı getirilemedi');
      }

      return data.data || null;
    } catch (error: any) {
      console.error('[waitlistService] getWaitlistEntry error:', error);
      return null;
    }
  },
};
