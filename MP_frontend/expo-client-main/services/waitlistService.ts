import { WaitlistEntry, User } from '@/types';
import { mockWaitlistEntries } from './mockData'; // We'll create this file later

export const waitlistService = {
  addToWaitlist: async (gameId: string, userId: string): Promise<WaitlistEntry> => {
    console.log(`Adding user ${userId} to waitlist for game ${gameId}`);
    // TODO: Implement adding to waitlist with the new backend
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
    console.log(`User ${userId} removing from waitlist ${waitlistId}`);
    // TODO: Implement removing from waitlist with the new backend
  },

  getUserWaitlist: async (userId: string): Promise<WaitlistEntry[]> => {
    console.log(`Fetching waitlist entries for user ${userId}`);
    // TODO: Implement fetching user waitlist with the new backend
    return mockWaitlistEntries.filter(w => w.userId === userId);
  },

  getGameWaitlist: async (gameId: string): Promise<WaitlistEntry[]> => {
    console.log(`Fetching waitlist entries for game ${gameId}`);
    // TODO: Implement fetching game waitlist with the new backend
    return mockWaitlistEntries.filter(w => w.gameId === gameId);
  },

  inviteNextFromWaitlist: async (gameId: string): Promise<void> => {
    console.log(`Inviting next user from waitlist for game ${gameId}`);
    // TODO: Implement inviting next from waitlist with the new backend
  },

  getWaitlistEntry: async (gameId: string, userId: string): Promise<WaitlistEntry | null> => {
    console.log(`Fetching waitlist entry for game ${gameId} and user ${userId}`);
    // TODO: Implement fetching waitlist entry with the new backend
    return mockWaitlistEntries.find(w => w.gameId === gameId && w.userId === userId) || null;
  },
};
