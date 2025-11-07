import { Notification } from '@/types';
import { mockNotifications } from './mockData'; // We'll create this file later

export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    console.log(`Fetching notifications for user ${userId}`);
    // TODO: Implement notification fetching with the new backend
    return mockNotifications;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    console.log(`Fetching unread notification count for user ${userId}`);
    // TODO: Implement unread count fetching with the new backend
    return mockNotifications.filter(n => !n.read).length;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    console.log(`Marking notification ${notificationId} as read`);
    // TODO: Implement marking notification as read with the new backend
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    console.log(`Marking all notifications as read for user ${userId}`);
    // TODO: Implement marking all notifications as read with the new backend
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    console.log(`Deleting notification ${notificationId}`);
    // TODO: Implement deleting notification with the new backend
  },

  createNotification: async (
    userId: string,
    type: string,
    title: string,
    message: string,
    data: Record<string, any> = {}
  ): Promise<Notification> => {
    console.log('Creating notification:', { userId, type, title, message, data });
    // TODO: Implement notification creation with the new backend
    const newNotification: Notification = {
      id: Math.random().toString(),
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
    return newNotification;
  },
};
