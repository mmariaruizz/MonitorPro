export interface User {
  id: string;
  name: string;
  role: 'deportista' | 'entrenador';
  email?: string;
  sex?: 'Masculino' | 'Femenino' | 'Otro';
  dob?: string;
  age?: number;
  height?: number;
  weight?: number;
  conditions?: string;
  sport?: string;
  club?: string;
  category?: string;
  achievements?: string;
  coachIds?: string[];
  specialty?: string;
  athleteIds?: string[];
  profilePic?: string;
  password?: string;
}

export interface EcgSession {
  id: string;
  athleteId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: string; // e.g., "40min" or "1h 14min"
  maxBpm: number;
  minBpm: number;
  avgBpm: number;
  coachObservations?: string;
  athleteObservations?: string;
  athleteObservationTimestamp?: string;
  dataPoints: { time: number; mv: number }[];
}

export interface QuestionnaireResult {
  id: string;
  athleteId: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // HH:mm
  sleep: number;
  fatigue: number;
  soreness: number;
  mood: number;
  coachObservations?: string;
  athleteObservations?: string;
  athleteObservationTimestamp?: string;
}

export interface CoachRequest {
  id: string;
  athleteId: string;
  coachId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}
