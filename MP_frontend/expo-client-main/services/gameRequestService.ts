import { GameRequest } from '@/types/index';
import { API_URL } from '@/config/api';

export const gameRequestService = {
  // Katılma isteği gönder
  sendJoinRequest: async (gameId: string, token: string, message?: string): Promise<GameRequest> => {
    try {
      console.log(`[gameRequestService] Katılma isteği gönderiliyor - gameId: ${gameId}`);
      
      const response = await fetch(`${API_URL}/games/sessions/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: message || '' }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Katılma isteği gönderilemedi');
      }

      return {
        id: data.data._id,
        gameId: data.data.gameSessionId,
        userId: data.data.userId,
        message: data.data.message,
        status: data.data.status,
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
      };
    } catch (error: any) {
      console.error('[gameRequestService] sendJoinRequest error:', error);
      throw error;
    }
  },

  // Katılma isteğini kabul et (lobi sahibi)
  acceptJoinRequest: async (requestId: string, token: string): Promise<void> => {
    try {
      console.log(`[gameRequestService] İstek kabul ediliyor - requestId: ${requestId}`);
      
      const response = await fetch(`${API_URL}/games/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'İstek kabul edilemedi');
      }
    } catch (error: any) {
      console.error('[gameRequestService] acceptJoinRequest error:', error);
      throw error;
    }
  },

  // Katılma isteğini reddet (lobi sahibi)
  rejectJoinRequest: async (requestId: string, token: string): Promise<void> => {
    try {
      console.log(`[gameRequestService] İstek reddediliyor - requestId: ${requestId}`);
      
      const response = await fetch(`${API_URL}/games/requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'İstek reddedilemedi');
      }
    } catch (error: any) {
      console.error('[gameRequestService] rejectJoinRequest error:', error);
      throw error;
    }
  },

  // Oyunun katılma isteklerini getir (lobi sahibi)
  getGameRequests: async (gameId: string, token: string): Promise<any[]> => {
    try {
      console.log(`[gameRequestService] Oyun istekleri getiriliyor - gameId: ${gameId}`);
      
      const response = await fetch(`${API_URL}/games/sessions/${gameId}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'İstekler getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[gameRequestService] getGameRequests error:', error);
      throw error;
    }
  },

  // Kullanıcının belirli bir oyun için isteğini kontrol et
  getRequestForGame: async (gameId: string, token: string): Promise<GameRequest | null> => {
    try {
      console.log(`[gameRequestService] Oyun için istek kontrol ediliyor - gameId: ${gameId}`);
      
      const response = await fetch(`${API_URL}/games/sessions/${gameId}/my-request`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      return {
        id: data.data._id,
        gameId: data.data.gameSessionId,
        userId: data.data.userId,
        message: data.data.message,
        status: data.data.status,
        createdAt: data.data.createdAt,
        updatedAt: data.data.updatedAt,
      };
    } catch (error: any) {
      console.error('[gameRequestService] getRequestForGame error:', error);
      return null;
    }
  },

  // İstek sahibinin detaylı bilgilerini getir (lobi sahibi)
  getRequestUserDetails: async (requestId: string, token: string): Promise<any> => {
    try {
      console.log(`[gameRequestService] İstek sahibi bilgileri getiriliyor - requestId: ${requestId}`);
      
      const response = await fetch(`${API_URL}/notifications/requests/${requestId}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Kullanıcı bilgileri getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[gameRequestService] getRequestUserDetails error:', error);
      throw error;
    }
  },

  // Katılma isteğini iptal et (istek sahibi)
  cancelJoinRequest: async (requestId: string, token: string): Promise<void> => {
    try {
      console.log(`[gameRequestService] İstek iptal ediliyor - requestId: ${requestId}`);
      
      const response = await fetch(`${API_URL}/games/requests/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'İstek iptal edilemedi');
      }
    } catch (error: any) {
      console.error('[gameRequestService] cancelJoinRequest error:', error);
      throw error;
    }
  },

  // Oyundan ayrıl (kabul edilmiş oyuncu)
  leaveGame: async (gameId: string, token: string): Promise<void> => {
    try {
      console.log(`[gameRequestService] Oyundan ayrılınıyor - gameId: ${gameId}`);
      
      const response = await fetch(`${API_URL}/games/sessions/${gameId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Oyundan ayrılınamadı');
      }
    } catch (error: any) {
      console.error('[gameRequestService] leaveGame error:', error);
      throw error;
    }
  },

  // Kullanıcının gönderdiği tüm katılma isteklerini getir
  getUserRequests: async (token: string): Promise<GameRequest[]> => {
    try {
      console.log('[gameRequestService] Kullanıcı istekleri getiriliyor');
      
      const response = await fetch(`${API_URL}/games/requests/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'İstekler getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[gameRequestService] getUserRequests error:', error);
      throw error;
    }
  },
};
