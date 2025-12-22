import { Notification } from '@/types/index';

// NOT: Notification API'si henüz backend'de yok
// Bu özellik gelecekte eklenecek

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    console.log(`[notificationService] Bildirimler getiriliyor - userId: ${userId}`);
    // TODO: Backend API eklenecek
    return [];
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    console.log(`[notificationService] Okunmamış bildirim sayısı getiriliyor - userId: ${userId}`);
    // TODO: Backend API eklenecek
    return 0;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    console.log(`[notificationService] Bildirim okundu işaretleniyor - notificationId: ${notificationId}`);
    // TODO: Backend API eklenecek
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    console.log(`[notificationService] Tüm bildirimler okundu işaretleniyor - userId: ${userId}`);
    // TODO: Backend API eklenecek
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    console.log(`[notificationService] Bildirim siliniyor - notificationId: ${notificationId}`);
    // TODO: Backend API eklenecek
  },

  createNotification: async (
    userId: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<Notification> => {
    console.log('[notificationService] Bildirim oluşturuluyor');
    // TODO: Backend API eklenecek
    const newNotification: Notification = {
      id: Math.random().toString(),
      userId,
      type: 'request_received',
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    return newNotification;
  },
};
