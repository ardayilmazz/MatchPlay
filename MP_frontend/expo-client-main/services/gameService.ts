import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/api';

const GAME_TYPES_CACHE_KEY = '@matchplay_game_types';
const DRAFT_SESSION_KEY = '@matchplay_draft_session';

export interface GameType {
  _id: string;
  name: string;
  slug: string;
  category: 'masa_tas' | 'spor' | 'beceri' | 'kart';
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  hasTeams: boolean;
  teamAssignmentOptions?: ('manual' | 'random')[];
  requiresEquipment: boolean;
  equipmentDescription?: string;
  venueType: 'indoor' | 'outdoor' | 'both';
  expectsFee: boolean;
  defaultDuration: number;
  isActive: boolean;
}

export interface GameSessionDraft {
  sessionId?: string;
  gameTypeId?: string;
  gameType?: GameType;
  
  // Aşama 2: Açıklama
  title?: string;
  description?: string;
  tags?: string[];
  
  // Aşama 3: Konum ve Zaman
  cityId?: string;
  cityName?: string;
  districtId?: string;
  districtName?: string;
  venueId?: string;
  venueName?: string;
  venueAddress?: string;
  feeAmount?: number;
  startDate?: Date;
  estimatedDuration?: number;
  
  // Aşama 4: Ekip
  totalPlayers?: number;
  neededPlayers?: number;
  teamAssignment?: 'manual' | 'random' | null;
  teamCount?: number; // Takım sayısı
  skillLevel?: 'ilk_defa' | 'az_bilenler' | 'orta' | 'iyi' | 'profesyonel';
  hasEquipment?: boolean;
  autoCancelIfNotFull?: boolean; // Oyuna 2 saat kala kontenjan tamamlanmazsa otomatik iptal et
  
  // Aşama 5: Oyuncu Kriterleri
  genderPreference?: 'herkes' | 'kizlar' | 'erkekler' | 'karma_dengeli';
  
  // Hangi adımda kaldı
  currentStep?: number;
}

export interface GameSession extends GameSessionDraft {
  _id: string;
  creatorId: string;
  status: 'draft' | 'open' | 'full' | 'cancelled' | 'completed';
  currentPlayers: string[];
  acceptedPlayers?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
  pendingRequests: string[];
  createdAt: string;
  updatedAt: string;
}

// Oyun tiplerini backend'den çek ve cache'le
export const fetchGameTypes = async (forceRefresh = false): Promise<GameType[]> => {
  try {
    // Cache kontrol
    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(GAME_TYPES_CACHE_KEY);
      if (cached) {
        console.log('[gameService] Oyun tipleri cache\'ten yüklendi');
        return JSON.parse(cached);
      }
    }

    console.log('[gameService] Oyun tipleri backend\'den çekiliyor...');
    const response = await fetch(`${API_URL}/games/types`);
    const data = await response.json();

    if (data.success) {
      // Cache'e kaydet
      await AsyncStorage.setItem(GAME_TYPES_CACHE_KEY, JSON.stringify(data.data));
      console.log(`[gameService] ${data.data.length} oyun tipi cache'lendi`);
      return data.data;
    }

    throw new Error('Oyun tipleri getirilemedi');
  } catch (error) {
    console.error('[gameService] fetchGameTypes error:', error);
    throw error;
  }
};

// Taslağı AsyncStorage'a kaydet (veritabanına değil)
export const saveDraftLocally = async (draft: GameSessionDraft): Promise<void> => {
  try {
    await AsyncStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(draft));
    console.log('[gameService] Taslak yerel olarak kaydedildi');
  } catch (error) {
    console.error('[gameService] saveDraftLocally error:', error);
    throw error;
  }
};

// Yerel taslağı yükle
export const loadDraftLocally = async (): Promise<GameSessionDraft | null> => {
  try {
    const draft = await AsyncStorage.getItem(DRAFT_SESSION_KEY);
    if (draft) {
      console.log('[gameService] Taslak yerel storage\'dan yüklendi');
      return JSON.parse(draft);
    }
    return null;
  } catch (error) {
    console.error('[gameService] loadDraftLocally error:', error);
    return null;
  }
};

// Yerel taslağı temizle
export const clearDraftLocally = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DRAFT_SESSION_KEY);
    console.log('[gameService] Yerel taslak temizlendi');
  } catch (error) {
    console.error('[gameService] clearDraftLocally error:', error);
  }
};

// Oyun oturumu oluştur (son adımda backend'e gönder)
export const createGameSession = async (
  token: string,
  sessionData: GameSessionDraft
): Promise<GameSession> => {
  try {
    console.log('[gameService] Oyun oturumu oluşturuluyor...');
    console.log('[gameService] gameTypeId:', sessionData.gameTypeId);
    
    // gameType objesini çıkar, sadece ID'yi gönder
    const { gameType, ...dataToSend } = sessionData;
    
    console.log('[gameService] Gönderilecek data:', JSON.stringify(dataToSend, null, 2));
    
    const response = await fetch(`${API_URL}/games/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...dataToSend,
        status: 'open', // Artık yayında
      }),
    });

    const data = await response.json();
    console.log('[gameService] Backend response:', data);

    if (data.success) {
      console.log('[gameService] Oyun oturumu oluşturuldu:', data.data._id);
      // Yerel taslağı temizle
      await clearDraftLocally();
      return data.data;
    }

    throw new Error(data.message || 'Oyun oluşturulamadı');
  } catch (error) {
    console.error('[gameService] createGameSession error:', error);
    throw error;
  }
};

// Tüm oyun oturumlarını listele
export const fetchGameSessions = async (filters?: {
  city?: string;
  district?: string;
  gameType?: string;
  skillLevel?: string;
}): Promise<GameSession[]> => {
  try {
    const queryParams = new URLSearchParams(filters as any).toString();
    const url = `${API_URL}/games/sessions${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    throw new Error('Oyun oturumları getirilemedi');
  } catch (error) {
    console.error('[gameService] fetchGameSessions error:', error);
    throw error;
  }
};

// Tek bir oyun oturumunu getir
export const fetchGameSession = async (id: string): Promise<GameSession> => {
  try {
    const response = await fetch(`${API_URL}/games/sessions/${id}`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    throw new Error('Oyun oturumu bulunamadı');
  } catch (error) {
    console.error('[gameService] fetchGameSession error:', error);
    throw error;
  }
};

// Kullanıcının katıldığı oyunları getir (başkasının kurduğu, kabul edilmiş, henüz oynanmamış)
export const fetchJoinedGameSessions = async (token: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/games/sessions/joined`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    throw new Error('Katıldığınız oyunlar getirilemedi');
  } catch (error) {
    console.error('[gameService] fetchJoinedGameSessions error:', error);
    throw error;
  }
};

// Kullanıcının kendi oyunlarını getir
export const fetchMyGameSessions = async (token: string): Promise<GameSession[]> => {
  try {
    const response = await fetch(`${API_URL}/games/sessions/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.success) {
      return data.data;
    }

    throw new Error('Oyunlar getirilemedi');
  } catch (error) {
    console.error('[gameService] fetchMyGameSessions error:', error);
    throw error;
  }
};

// Kategoriye göre oyun tiplerini grupla
export const groupGameTypesByCategory = (gameTypes: GameType[]) => {
  return {
    masa_tas: gameTypes.filter((g) => g.category === 'masa_tas'),
    spor: gameTypes.filter((g) => g.category === 'spor'),
    beceri: gameTypes.filter((g) => g.category === 'beceri'),
    kart: gameTypes.filter((g) => g.category === 'kart'),
  };
};

// Kategori adlarını Türkçeleştir
export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    masa_tas: 'Masa & Taş Oyunları',
    spor: 'Spor & Fiziksel Aktiviteler',
    beceri: 'Beceri Oyunları',
    kart: 'Kart Oyunları',
  };
  return labels[category] || category;
};

// ============================================
// GERÇEK API İLE ÇALIŞAN GAME SERVICE
// ============================================

export const gameService = {
  fetchGameTypes,
  fetchGameSessions,
  fetchGameSession,
  fetchMyGameSessions,
  fetchJoinedGameSessions,
  // Oyunları filtrelerle getir
  getGames: async (filters?: {
    nameSearch?: string;
    gameTypeIds?: string[];
    cityId?: string | null;
    districtId?: string | null;
    startDateFrom?: Date | null;
    startDateTo?: Date | null;
    availableOnly?: boolean;
    genderPreferences?: string[];
    skillLevels?: string[];
    feeType?: 'all' | 'free' | 'paid';
  }): Promise<any[]> => {
    try {
      console.log('[gameService.getGames] Oyunlar çekiliyor...', filters);
      
      // Backend parametrelerini hazırla
      const params = new URLSearchParams();
      
      // İsim arama
      if (filters?.nameSearch && filters.nameSearch.trim()) {
        params.append('nameSearch', filters.nameSearch.trim());
      }
      
      // Oyun tipleri (çoklu)
      if (filters?.gameTypeIds && filters.gameTypeIds.length > 0) {
        filters.gameTypeIds.forEach(id => params.append('gameType', id));
      }
      
      // Konum
      if (filters?.cityId) {
        params.append('city', filters.cityId);
      }
      if (filters?.districtId) {
        params.append('district', filters.districtId);
      }
      
      // Tarih aralığı
      if (filters?.startDateFrom) {
        params.append('startDateFrom', filters.startDateFrom.toISOString());
      }
      if (filters?.startDateTo) {
        params.append('startDateTo', filters.startDateTo.toISOString());
      }
      
      // Sadece yer olan oyunlar
      if (filters?.availableOnly) {
        params.append('availableOnly', 'true');
      }
      
      // Cinsiyet tercihi (çoklu)
      if (filters?.genderPreferences && filters.genderPreferences.length > 0) {
        filters.genderPreferences.forEach(pref => params.append('genderPreference', pref));
      }
      
      // Yetenek seviyeleri (çoklu)
      if (filters?.skillLevels && filters.skillLevels.length > 0) {
        filters.skillLevels.forEach(level => params.append('skillLevel', level));
      }
      
      // Ücret tipi
      if (filters?.feeType && filters.feeType !== 'all') {
        params.append('feeType', filters.feeType);
      }
      
      const url = `${API_URL}/games/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('[gameService.getGames] URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Oyunlar getirilemedi');
      }
      
      const sessions = data.data;
      
      // Eski Game formatına dönüştür (UI uyumluluğu)
      return sessions.map((session: any) => {
        // Dinamik neededPlayers hesaplama: totalPlayers - (acceptedPlayers.length + 1 creator)
        const acceptedPlayersCount = session.acceptedPlayers?.length || 0;
        const dynamicNeededPlayers = Math.max(0, (session.totalPlayers || 2) - acceptedPlayersCount - 1);
        
        return {
          id: session._id,
          creatorId: session.creatorId,
          title: session.title || '', // Lobi ismi
          sportId: session.gameTypeId,
          sportName: session.gameType?.name || 'Oyun',
          cityId: session.cityId || '',
          cityName: session.cityName || '',
          districtId: session.districtId || '',
          districtName: session.districtName || '',
          venueId: session.venueId || '',
          venueName: session.venueName || '',
          venueAddress: session.venueAddress || '',
          startTime: session.startDate,
          endTime: session.startDate,
          totalPlayers: session.totalPlayers || 2,
          currentPlayers: acceptedPlayersCount + 1, // acceptedPlayers + creator
          neededPlayers: dynamicNeededPlayers,
          acceptedPlayers: session.acceptedPlayers,
          skillLevel: session.skillLevel || 'orta',
          description: session.description || '',
          status: session.status,
          createdAt: session.createdAt,
        };
      });
    } catch (error) {
      console.error('[gameService.getGames] Hata:', error);
      return [];
    }
  },
  
  // Tek oyun detayı getir
  getGameById: async (id: string): Promise<any | null> => {
    try {
      const session = await fetchGameSession(id) as any;
      
      // Dinamik neededPlayers hesaplama
      const acceptedPlayersCount = session.acceptedPlayers?.length || 0;
      const dynamicNeededPlayers = Math.max(0, (session.totalPlayers || 2) - acceptedPlayersCount - 1);
      
      // Creator bilgilerini al (populate edilmişse)
      const creator = session.creatorId && typeof session.creatorId === 'object' 
        ? session.creatorId 
        : null;

      return {
        id: session._id,
        creatorId: creator?._id || session.creatorId,
        creator: creator ? {
          _id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          profilePhoto: creator.profilePhoto,
          bio: creator.bio,
          gender: creator.gender,
          birthDate: creator.birthDate,
        } : null,
        title: session.title || '', // Lobi ismi
        sportId: session.gameTypeId,
        sportName: session.gameType?.name || 'Oyun',
        cityId: session.cityId || '',
        cityName: session.cityName || '',
        districtId: session.districtId || '',
        districtName: session.districtName || '',
        venueId: session.venueId || '',
        venueName: session.venueName || '',
        venueAddress: session.venueAddress || '',
        startTime: session.startDate,
        endTime: session.startDate,
        totalPlayers: session.totalPlayers || 2,
        currentPlayers: acceptedPlayersCount + 1, // acceptedPlayers + creator
        neededPlayers: dynamicNeededPlayers,
        acceptedPlayers: session.acceptedPlayers || [],
        skillLevel: session.skillLevel || 'orta',
        description: session.description || '',
        status: session.status,
        createdAt: session.createdAt,
      };
    } catch (error) {
      console.error('[gameService.getGameById] Hata:', error);
      return null;
    }
  },

  // Oyun silme fonksiyonu
  deleteGameSession: async (gameId: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/games/sessions/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Oyun silinemedi');
      }
    } catch (error) {
      console.error('[gameService.deleteGameSession] Hata:', error);
      throw error;
    }
  },

  // Oyun güncelleme fonksiyonu
  updateGameSession: async (
    gameId: string,
    updateData: Partial<GameSessionDraft>,
    token: string
  ): Promise<any> => {
    try {
      console.log('[gameService.updateGameSession] İstek:', {
        gameId,
        updateData,
        url: `${API_URL}/games/sessions/${gameId}`
      });

      const response = await fetch(`${API_URL}/games/sessions/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log('[gameService.updateGameSession] Yanıt:', {
        status: response.status,
        ok: response.ok,
        data: responseData
      });

      if (!response.ok) {
        throw new Error(responseData.message || 'Oyun güncellenemedi');
      }

      return responseData;
    } catch (error: any) {
      console.error('[gameService.updateGameSession] Hata:', error.message, error);
      throw error;
    }
  },

  // Tamamlanmış oyunları getir
  fetchCompletedGames: async (token: string): Promise<any[]> => {
    try {
      console.log('[gameService.fetchCompletedGames] Tamamlanmış oyunlar getiriliyor');

      const response = await fetch(`${API_URL}/games/sessions/completed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Tamamlanmış oyunlar getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[gameService.fetchCompletedGames] Hata:', error);
      throw error;
    }
  },

  // Tamamlanmış oyunu sil
  deleteCompletedGame: async (gameId: string, token: string): Promise<void> => {
    try {
      console.log('[gameService.deleteCompletedGame] Oyun siliniyor:', gameId);

      const response = await fetch(`${API_URL}/games/sessions/${gameId}/completed`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Oyun silinemedi');
      }
    } catch (error: any) {
      console.error('[gameService.deleteCompletedGame] Hata:', error);
      throw error;
    }
  },
};
