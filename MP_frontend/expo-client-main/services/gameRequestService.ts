import { GameRequest } from '@/types/index';

// NOT: GameRequest API'si henüz backend'de yok
// Bu özellik gelecekte eklenecek
// Şimdilik boş veriler dönüyor

export const gameRequestService = {
  sendJoinRequest: async (gameId: string, userId: string, message?: string): Promise<GameRequest> => {
    console.log(`[gameRequestService] Join request gönderiliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    const newRequest: GameRequest = {
      id: Math.random().toString(),
      gameId,
      userId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newRequest;
  },

  acceptJoinRequest: async (requestId: string, gameId: string): Promise<GameRequest> => {
    console.log(`[gameRequestService] Request kabul ediliyor - requestId: ${requestId}`);
    // TODO: Backend API eklenecek
    throw new Error('Bu özellik henüz aktif değil');
  },

  rejectJoinRequest: async (requestId: string): Promise<GameRequest> => {
    console.log(`[gameRequestService] Request reddediliyor - requestId: ${requestId}`);
    // TODO: Backend API eklenecek
    throw new Error('Bu özellik henüz aktif değil');
  },

  cancelJoinRequest: async (requestId: string, userId: string): Promise<void> => {
    console.log(`[gameRequestService] Request iptal ediliyor - requestId: ${requestId}`);
    // TODO: Backend API eklenecek
  },

  getUserRequests: async (userId: string): Promise<GameRequest[]> => {
    console.log(`[gameRequestService] Kullanıcı requestleri getiriliyor - userId: ${userId}`);
    // TODO: Backend API eklenecek
    return [];
  },

  getGameRequests: async (gameId: string): Promise<GameRequest[]> => {
    console.log(`[gameRequestService] Oyun requestleri getiriliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    return [];
  },

  getRequestForGame: async (gameId: string, userId: string): Promise<GameRequest | null> => {
    console.log(`[gameRequestService] Oyun için request kontrol ediliyor - gameId: ${gameId}`);
    // TODO: Backend API eklenecek
    return null;
  },
};
