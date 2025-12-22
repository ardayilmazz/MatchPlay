export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string; // ISO formatında tarih
  university?: string;
  department?: string;
  profilePhoto?: string;
  bio?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type GameStatus = 'open' | 'full' | 'completed' | 'cancelled';
export type GameSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'everyone';

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
  startTime: string; // ISO string
  endTime: string; // ISO string
  totalPlayers: number;
  currentPlayers: number;
  skillLevel: GameSkillLevel | string;
  description: string;
  status: GameStatus | string;
  createdAt: string; // ISO string
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  university: string;
  department: string;
  bio?: string;
  sports: string[];
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  averageRating?: number;
  totalGames?: number;
  createdAt: string;
  token?: string; // JWT token
}
