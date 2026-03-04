import type { User, EcgSession, QuestionnaireResult, CoachRequest } from './types';

export const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

let USERS: Record<string, User> = {
  '1': { 
    id: '1', name: 'Carlos Gomez', role: 'deportista',
    email: 'carlos.gomez@example.com', sex: 'Masculino', dob: '1996-08-15', age: 28, 
    height: 182, weight: 75, conditions: 'Asma leve', sport: 'Ciclismo', 
    club: 'Cycle Pro', category: 'Élite', achievements: 'Campeón nacional 2022',
    coachIds: ['3'], password: '1234'
  },
  '2': { 
    id: '2', name: 'Ana Martinez', role: 'deportista',
    email: 'ana.martinez@example.com', sex: 'Femenino', dob: '2000-04-10', age: 24,
    height: 168, weight: 58, conditions: 'Ninguna', sport: 'Running',
    club: 'Urban Runners', category: 'Senior', achievements: 'Top 5 maratón de la ciudad',
    coachIds: ['3', '4'], password: '1234'
  },
  '3': { 
    id: '3', name: 'Victor González', role: 'entrenador',
    email: 'victor.gonzalez@example.com', sex: 'Masculino', dob: '1979-01-20', age: 45,
    specialty: 'Rendimiento y Fisiología',
    athleteIds: ['1', '2'], password: '1234'
  },
  '4': {
    id: '4', name: 'Laura Sanchez', role: 'entrenador',
    email: 'laura.sanchez@example.com', sex: 'Femenino', dob: '1994-05-12', age: 30,
    specialty: 'Futbol',
    athleteIds: ['2'], password: '1234'
  },
  '5': {
    id: '5', name: 'Alvaro Ruiz', role: 'entrenador',
    email: 'alvaro.ruiz@example.com', sex: 'Masculino', dob: '1990-11-30', age: 34,
    specialty: 'Tenis',
    athleteIds: [], password: '1234'
  }
};

// Histórico de Solicitudes
export const COACH_REQUESTS: CoachRequest[] = [];

// Histórico de Cuestionarios
export const QUESTIONNAIRE_HISTORY: QuestionnaireResult[] = [
  { id: 'q1', athleteId: '1', date: '2024-03-01', timestamp: '08:30', sleep: 7, fatigue: 4, soreness: 3, mood: 8, athleteObservations: 'Me siento descansado.', athleteObservationTimestamp: '2024-03-01 08:35' },
  { id: 'q2', athleteId: '1', date: '2024-03-05', timestamp: '09:15', sleep: 5, fatigue: 7, soreness: 6, mood: 4, coachObservations: 'Ojo con la fatiga acumulada.' },
  { id: 'q3', athleteId: '1', date: '2024-03-10', timestamp: '08:00', sleep: 8, fatigue: 2, soreness: 2, mood: 9 },
  { id: 'q4', athleteId: '1', date: '2024-03-15', timestamp: '07:45', sleep: 6, fatigue: 5, soreness: 4, mood: 7 },
];

// Histórico de Sesiones ECG
export const ECG_SESSIONS: EcgSession[] = [
  { 
    id: 's1', athleteId: '1', date: '2024-03-02', startTime: '10:00', endTime: '10:30', duration: '30min', 
    maxBpm: 175, minBpm: 65, avgBpm: 142, dataPoints: [],
    coachObservations: 'Buen ritmo inicial.', athleteObservations: 'Me sentí bien.', athleteObservationTimestamp: '2024-03-02 11:00'
  },
  { 
    id: 's2', athleteId: '1', date: '2024-03-08', startTime: '18:30', endTime: '19:15', duration: '45min', 
    maxBpm: 182, minBpm: 60, avgBpm: 155, dataPoints: [] 
  }
];

export const saveEcgSession = (session: EcgSession) => {
    ECG_SESSIONS.push(session);
};

export const updateEcgSession = (sessionId: string, updates: Partial<EcgSession>) => {
    const index = ECG_SESSIONS.findIndex(s => s.id === sessionId);
    if (index !== -1) {
        ECG_SESSIONS[index] = { ...ECG_SESSIONS[index], ...updates };
    }
};

export const saveQuestionnaireResult = (result: QuestionnaireResult) => {
    QUESTIONNAIRE_HISTORY.push(result);
};

export const updateQuestionnaireResult = (id: string, updates: Partial<QuestionnaireResult>) => {
    const index = QUESTIONNAIRE_HISTORY.findIndex(q => q.id === id);
    if (index !== -1) {
        QUESTIONNAIRE_HISTORY[index] = { ...QUESTIONNAIRE_HISTORY[index], ...updates };
    }
};

export const sendCoachRequest = (athleteId: string, coachId: string) => {
    const newRequest: CoachRequest = {
        id: `req-${Date.now()}`,
        athleteId,
        coachId,
        status: 'pending',
        timestamp: new Date().toLocaleString()
    };
    COACH_REQUESTS.push(newRequest);
    return newRequest;
};

export const getCoachRequestsForAthlete = (athleteId: string) => {
    return COACH_REQUESTS.filter(r => r.athleteId === athleteId);
};

export const getCoachRequestsForCoach = (coachId: string) => {
    return COACH_REQUESTS.filter(r => r.coachId === coachId);
};

export const updateCoachRequestStatus = (requestId: string, status: 'accepted' | 'rejected') => {
    const req = COACH_REQUESTS.find(r => r.id === requestId);
    if (req) {
        req.status = status;
        if (status === 'accepted') {
            // Link them in USERS
            const athlete = USERS[req.athleteId];
            const coach = USERS[req.coachId];
            if (athlete && coach) {
                if (!athlete.coachIds) athlete.coachIds = [];
                if (!athlete.coachIds.includes(req.coachId)) athlete.coachIds.push(req.coachId);
                
                if (!coach.athleteIds) coach.athleteIds = [];
                if (!coach.athleteIds.includes(req.athleteId)) coach.athleteIds.push(req.athleteId);
            }
        }
    }
};

export const get_all_users = (): User[] => Object.values(USERS);
export const get_user = (userId: string): User | undefined => USERS[userId];

export const getCoachNames = (coachIds: string[] = []): string => {
    if (!coachIds || coachIds.length === 0) return 'No asignado';
    return coachIds.map(id => USERS[id]?.name).filter(Boolean).join(', ');
};

export const addUser = (data: { name: string; email: string; role: 'deportista' | 'entrenador'; password?: string; }): User => {
    const newId = String(Date.now());
    const newUser: User = { id: newId, name: data.name, email: data.email, role: data.role, sport: 'Sin especificar', password: data.password };
    USERS[newId] = newUser;
    return newUser;
};

export const updateUser = (userId: string, updatedData: Partial<User>): User | undefined => {
    if (USERS[userId]) {
        USERS[userId] = { ...USERS[userId], ...updatedData };
        return USERS[userId];
    }
    return undefined;
};
