import { API_URL } from '@/config/api';

export interface CancellationVote {
  _id: string;
  gameSessionId: string;
  initiatorId: string;
  votes: {
    userId: string;
    vote: 'approve' | 'reject';
    votedAt: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

/**
 * Oyun iptali için oylama başlat
 */
export const initiateCancellationVote = async (
  gameSessionId: string,
  token: string
): Promise<CancellationVote> => {
  try {
    console.log('[cancellationVoteService.initiateCancellationVote] Oylama başlatılıyor:', gameSessionId);

    const response = await fetch(`${API_URL}/cancellation-votes/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ gameSessionId }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Oylama başlatılamadı');
    }

    return data.data;
  } catch (error: any) {
    console.error('[cancellationVoteService.initiateCancellationVote] Hata:', error);
    throw error;
  }
};

/**
 * Oyun iptali için oy kullan
 */
export const submitVote = async (
  voteId: string,
  vote: 'approve' | 'reject',
  token: string
): Promise<void> => {
  try {
    console.log('[cancellationVoteService.submitVote] Oy kullanılıyor:', { voteId, vote });

    const response = await fetch(`${API_URL}/cancellation-votes/${voteId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ vote }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Oy kullanılamadı');
    }
  } catch (error: any) {
    console.error('[cancellationVoteService.submitVote] Hata:', error);
    throw error;
  }
};

/**
 * Oyun için oylama durumunu getir
 */
export const getCancellationVote = async (
  gameSessionId: string,
  token: string
): Promise<CancellationVote | null> => {
  try {
    console.log('[cancellationVoteService.getCancellationVote] Oylama durumu getiriliyor:', gameSessionId);

    const response = await fetch(`${API_URL}/cancellation-votes/game/${gameSessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      if (response.status === 404) {
        return null; // Oylama yok
      }
      throw new Error(data.message || 'Oylama durumu getirilemedi');
    }

    return data.data;
  } catch (error: any) {
    console.error('[cancellationVoteService.getCancellationVote] Hata:', error);
    throw error;
  }
};

/**
 * VoteId ile oylama durumunu getir
 */
export const getCancellationVoteById = async (
  voteId: string,
  token: string
): Promise<CancellationVote | null> => {
  try {
    console.log('[cancellationVoteService.getCancellationVoteById] Oylama durumu getiriliyor:', voteId);

    const response = await fetch(`${API_URL}/cancellation-votes/${voteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      if (response.status === 404) {
        return null; // Oylama yok
      }
      throw new Error(data.message || 'Oylama durumu getirilemedi');
    }

    return data.data;
  } catch (error: any) {
    console.error('[cancellationVoteService.getCancellationVoteById] Hata:', error);
    throw error;
  }
};

export const cancellationVoteService = {
  initiateCancellationVote,
  submitVote,
  getCancellationVote,
  getCancellationVoteById,
};
