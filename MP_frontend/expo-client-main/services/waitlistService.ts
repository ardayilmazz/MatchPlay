import { WaitlistEntry } from '@/types/index';

// NOT: Waitlist API'si henüz backend'de yok
// Bu özellik gelecekte eklenecek

export const waitlistService = {
  addToWaitlist: async (gameId: string, userId: string): Promise<WaitlistEntry> => {
    console.log(`[waitlistService] Waitlist'e ekleniyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    const newEntry: WaitlistEntry = {
      id: Math.random().toString(),
      gameId,
      userId,
      position: 1,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    return newEntry;
  },

  removeFromWaitlist: async (waitlistId: string, userId: string): Promise<void> => {
    console.log(`[waitlistService] Waitlist'ten çıkarılıyor - waitlistId: ${waitlistId}`);
    // TODO: Backend API eklenecek
  },

  getUserWaitlist: async (userId: string): Promise<WaitlistEntry[]> => {
    console.log(`[waitlistService] Kullanıcı waitlist'i getiriliyor - userId: ${userId}`);
    // TODO: Backend API eklenecek
    return [];
  },

  getGameWaitlist: async (gameId: string): Promise<WaitlistEntry[]> => {
    console.log(`[waitlistService] Oyun waitlist'i getiriliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    return [];
  },

  inviteNextFromWaitlist: async (gameId: string): Promise<void> => {
    console.log(`[waitlistService] Waitlist'ten davet gönderiliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
  },

  getWaitlistEntry: async (gameId: string, userId: string): Promise<WaitlistEntry | null> => {
    console.log(`[waitlistService] Waitlist entry kontrol ediliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    return null;
  },
};
