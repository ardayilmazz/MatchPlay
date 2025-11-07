import { Game, GameRequest, Notification, WaitlistEntry } from '@/types';

export const mockGames: Game[] = [
  {
    id: '1',
    creatorId: 'user1',
    sportId: '1',
    sportName: 'Futbol',
    cityId: '34',
    cityName: 'İstanbul',
    districtId: '3401',
    districtName: 'Kadıköy',
    venueId: '1',
    venueName: 'Kadıköy Stadyumu',
    venueAddress: 'Kadıköy, İstanbul',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    totalPlayers: 10,
    currentPlayers: 5,
    skillLevel: 'Orta',
    description: 'Halı saha maçı',
    status: 'open',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    creatorId: 'user2',
    sportId: '2',
    sportName: 'Basketbol',
    cityId: '35',
    cityName: 'İzmir',
    districtId: '3501',
    districtName: 'Bornova',
    venueId: '2',
    venueName: 'Bornova Spor Salonu',
    venueAddress: 'Bornova, İzmir',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    totalPlayers: 10,
    currentPlayers: 10,
    skillLevel: 'İleri',
    description: '3v3 maç',
    status: 'full',
    createdAt: new Date().toISOString(),
  },
];

export const mockGameRequests: GameRequest[] = [
    {
        id: 'req1',
        gameId: '2',
        userId: 'user1',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const mockNotifications: Notification[] = [
    {
        id: 'notif1',
        userId: 'user1',
        type: 'request_received',
        title: 'Yeni Katılım İsteği',
        message: 'Basketbol oyununuza yeni bir katılım isteği geldi.',
        data: { game_id: '2', request_id: 'req1' },
        read: false,
        createdAt: new Date().toISOString(),
    }
];

export const mockWaitlistEntries: WaitlistEntry[] = [
    {
        id: 'wait1',
        gameId: '2',
        userId: 'user3',
        position: 1,
        status: 'waiting',
        createdAt: new Date().toISOString(),
    }
];
