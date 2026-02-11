export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  university: string;
  department: string;
  bio?: string;
  sports: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  gender?: 'male' | 'female' | 'other';
  averageRating?: number;
  totalGames?: number;
  createdAt: string;
  token?: string; // JWT token (giriş yapınca eklenir)
}

export interface University {
  id: string;
  name: string;
  city: string;
  district: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Sport {
  id: string;
  name: string;
  category: 'team' | 'individual' | 'board';
  icon: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface City {
  id: string;
  name: string;
}

export interface District {
  id: string;
  cityId: string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  districtId: string;
  address: string;
  type: 'indoor' | 'outdoor' | 'both';
}

export type GameSkillLevel = 'everyone' | 'competitive' | 'beginner' | 'intermediate' | 'advanced';

export interface Game {
  id: string;
  creatorId: string;
  sportId: string;
  sportName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  startTime: string;
  endTime: string;
  totalPlayers: number;
  currentPlayers: number;
  skillLevel: GameSkillLevel;
  description?: string;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  createdAt: string;
}

export type GameRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface GameRequest {
  id: string;
  gameId: string;
  userId: string;
  status: GameRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
  user?: User;
  game?: Game;
}

export type WaitlistStatus = 'waiting' | 'invited' | 'expired' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  gameId: string;
  userId: string;
  position: number;
  status: WaitlistStatus;
  createdAt: string;
  notifiedAt?: string;
  user?: User;
  game?: Game;
}

export type NotificationType =
  | 'request_received'
  | 'request_accepted'
  | 'request_rejected'
  | 'waitlist_invite'
  | 'game_cancelled'
  | 'game_full'
  | 'game_reminder'
  | 'player_left';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}
