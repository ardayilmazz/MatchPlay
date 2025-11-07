import { GameRequest, User } from '@/types';
import { mockGameRequests } from './mockData'; // We'll create this file later

export const gameRequestService = {
  sendJoinRequest: async (gameId: string, userId: string, message?: string): Promise<GameRequest> => {
    console.log(`Sending join request for game ${gameId} from user ${userId} with message: ${message}`);
    // TODO: Implement sending join request with the new backend
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
    console.log(`Accepting join request ${requestId} for game ${gameId}`);
    // TODO: Implement accepting join request with the new backend
    const request = mockGameRequests.find(r => r.id === requestId);
    if (!request) throw new Error('İstek bulunamadı');
    return { ...request, status: 'accepted' };
  },

  rejectJoinRequest: async (requestId: string): Promise<GameRequest> => {
    console.log(`Rejecting join request ${requestId}`);
    // TODO: Implement rejecting join request with the new backend
    const request = mockGameRequests.find(r => r.id === requestId);
    if (!request) throw new Error('İstek bulunamadı');
    return { ...request, status: 'rejected' };
  },

  cancelJoinRequest: async (requestId: string, userId: string): Promise<void> => {
    console.log(`User ${userId} canceling join request ${requestId}`);
    // TODO: Implement canceling join request with the new backend
  },

  getUserRequests: async (userId: string): Promise<GameRequest[]> => {
    console.log(`Fetching requests for user ${userId}`);
    // TODO: Implement fetching user requests with the new backend
    return mockGameRequests.filter(r => r.userId === userId);
  },

  getGameRequests: async (gameId: string): Promise<GameRequest[]> => {
    console.log(`Fetching requests for game ${gameId}`);
    // TODO: Implement fetching game requests with the new backend
    return mockGameRequests.filter(r => r.gameId === gameId);
  },

  getRequestForGame: async (gameId: string, userId: string): Promise<GameRequest | null> => {
    console.log(`Fetching request for game ${gameId} and user ${userId}`);
    // TODO: Implement fetching request for game and user with the new backend
    return mockGameRequests.find(r => r.gameId === gameId && r.userId === userId) || null;
  },
};
