import { API_URL } from '@/config/api';

export interface Complaint {
  id: string;
  reportedUser: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  game: {
    id: string;
    title: string;
  };
  message: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const complaintService = {
  createComplaint: async (
    gameSessionId: string,
    reportedId: string,
    message: string,
    token: string
  ): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameSessionId,
          reportedId,
          message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Şikayet oluşturulamadı');
      }
    } catch (error: any) {
      console.error('[complaintService] createComplaint error:', error);
      throw error;
    }
  },

  getMyComplaints: async (token: string): Promise<Complaint[]> => {
    try {
      const response = await fetch(`${API_URL}/complaints/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Şikayetler getirilemedi');
      }

      return data.data;
    } catch (error: any) {
      console.error('[complaintService] getMyComplaints error:', error);
      throw error;
    }
  },
};
