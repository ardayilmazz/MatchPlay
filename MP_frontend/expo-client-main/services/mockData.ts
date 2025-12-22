import { Game, GameRequest, Notification, WaitlistEntry, University, Department, Sport, City, District, Venue, GameSkillLevel } from '@/types/index';

export const universities: University[] = [
  { id: '1', name: 'Boğaziçi Üniversitesi', city: 'İstanbul', district: 'Bebek' },
  { id: '2', name: 'Orta Doğu Teknik Üniversitesi', city: 'Ankara', district: 'Çankaya' },
];
export const departments: Department[] = [
  { id: '1', name: 'Bilgisayar Mühendisliği' },
  { id: '2', name: 'Elektrik-Elektronik Mühendisliği' },
];
export const sports: Sport[] = [
  { id: '1', name: 'Basketbol', category: 'team', icon: 'basketball' },
  { id: '2', name: 'Futbol', category: 'team', icon: 'soccer' },
];
export const skillLevels = [
  { value: 'beginner', label: 'Başlangıç' },
  { value: 'intermediate', label: 'Orta' },
  { value: 'advanced', label: 'İleri' },
];
export const cities: City[] = [
  { id: '1', name: 'İstanbul' },
  { id: '2', name: 'Ankara' },
  { id: '3', name: 'İzmir' },
];

export const districts: District[] = [
  // İstanbul ilçeleri
  { id: '1', cityId: '1', name: 'Kadıköy' },
  { id: '2', cityId: '1', name: 'Beşiktaş' },
  { id: '3', cityId: '1', name: 'Şişli' },
  { id: '4', cityId: '1', name: 'Üsküdar' },
  { id: '5', cityId: '1', name: 'Beyoğlu' },
  { id: '6', cityId: '1', name: 'Sarıyer' },
  
  // Ankara ilçeleri
  { id: '7', cityId: '2', name: 'Çankaya' },
  { id: '8', cityId: '2', name: 'Keçiören' },
  { id: '9', cityId: '2', name: 'Yenimahalle' },
  
  // İzmir ilçeleri
  { id: '10', cityId: '3', name: 'Bornova' },
  { id: '11', cityId: '3', name: 'Konak' },
  { id: '12', cityId: '3', name: 'Karşıyaka' },
];

export const venues: Venue[] = [
  // Kadıköy mekanları
  { id: '1', name: 'Kadıköy Moda Halı Saha', districtId: '1', address: 'Moda Sahili', type: 'outdoor' },
  { id: '2', name: 'Red Kafe', districtId: '1', address: 'Moda Caddesi No: 45', type: 'indoor' },
  { id: '3', name: 'Kadıköy Spor Salonu', districtId: '1', address: 'Bahariye Caddesi', type: 'indoor' },
  { id: '4', name: 'Fenerbahçe Parkı', districtId: '1', address: 'Fenerbahçe', type: 'outdoor' },
  
  // Beşiktaş mekanları
  { id: '5', name: 'Beşiktaş Sahil Spor Alanı', districtId: '2', address: 'Barbaros Bulvarı', type: 'outdoor' },
  { id: '6', name: 'Abbasağa Parkı', districtId: '2', address: 'Abbasağa Parkı', type: 'outdoor' },
  
  // Sarıyer mekanları
  { id: '7', name: 'Boğaziçi Spor Salonu', districtId: '6', address: 'Bebek Kampüsü', type: 'indoor' },
  { id: '8', name: 'Bebek Sahil Basketbol Sahası', districtId: '6', address: 'Bebek Sahili', type: 'outdoor' },
  
  // Şişli mekanları
  { id: '9', name: 'Şişli Spor Kompleksi', districtId: '3', address: 'Mecidiyeköy', type: 'indoor' },
  
  // Üsküdar mekanları
  { id: '10', name: 'Üsküdar Spor Salonu', districtId: '4', address: 'Altunizade', type: 'indoor' },
  
  // Çankaya mekanları
  { id: '11', name: 'ODTÜ Spor Salonu', districtId: '7', address: 'ODTÜ Kampüsü', type: 'indoor' },
  { id: '12', name: 'Kuğulu Park', districtId: '7', address: 'Tunalı Hilmi', type: 'outdoor' },
];
export const gameSkillLevels: { value: GameSkillLevel; label: string }[] = [
  { value: 'everyone', label: 'Herkes Katılabilir' },
  { value: 'beginner', label: 'Başlangıç' },
];

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
    skillLevel: 'intermediate',
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
    skillLevel: 'advanced',
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
