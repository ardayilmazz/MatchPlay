import { API_URL } from '@/config/api';

export interface Notification {
  _id: string;
  userId: string;
  type: 
    | 'join_request_received'
    | 'join_request_accepted'
    | 'join_request_rejected'
    | 'game_cancelled'
    | 'game_full'
    | 'game_reminder'
    | 'player_left';
  title: string;
  message: string;
  data: {
    gameSessionId?: string;
    requestId?: string;
    senderId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationService = {
  // Kullanıcının bildirimlerini getir
  getNotifications: async (token: string, unreadOnly?: boolean): Promise<Notification[]> => {
    try {
      console.log('[notificationService] Bildirimler getiriliyor');
      
      const url = unreadOnly
        ? `${API_URL}/notifications?unreadOnly=true`
        : `${API_URL}/notifications`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bildirimler getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[notificationService] getNotifications error:', error);
      throw error;
    }
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string, token: string): Promise<void> => {
    try {
      console.log(`[notificationService] Bildirim okundu - id: ${notificationId}`);
      
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bildirim güncellenemedi');
      }
    } catch (error: any) {
      console.error('[notificationService] markAsRead error:', error);
      throw error;
    }
  },

  // Okunmamış bildirim sayısını getir
  getUnreadCount: async (token: string): Promise<number> => {
    try {
      const notifications = await notificationService.getNotifications(token, true);
      return notifications.length;
    } catch (error: any) {
      console.error('[notificationService] getUnreadCount error:', error);
      return 0;
    }
  },

  // Tüm bildirimleri sil
  deleteAllNotifications: async (token: string): Promise<void> => {
    try {
      console.log('[notificationService] Tüm bildirimler siliniyor');
      
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Bildirimler silinemedi');
      }

      console.log(`[notificationService] ${data.deletedCount} bildirim silindi`);
    } catch (error: any) {
      console.error('[notificationService] deleteAllNotifications error:', error);
      throw error;
    }
  },
};
