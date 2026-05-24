import { api } from '../../../api/axios';

export interface CreateGameResponse {
  gamePin: string;
  sessionId: string;
}

export interface HistoryAttempt {
  id: string;
  totalScore: number;
  user: {
    username: string;
  };
}

export interface HistorySession {
  id: string;
  createdAt: string;
  quiz: {
    title: string;
    thumbnailUrl?: string;
  };
  attempts: HistoryAttempt[];
}

export const createGameSessionFn = async (quizId: string): Promise<CreateGameResponse> => {
  const response = await api.post<CreateGameResponse>(`/game/create/${quizId}`);
  return response.data;
};

export const getGameHistoryFn = async (): Promise<HistorySession[]> => {
  const response = await api.get<HistorySession[]>('/game/history');
  return response.data;
};

