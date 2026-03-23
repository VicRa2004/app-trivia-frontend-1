import { api } from '../../../api/axios';

export interface CreateGameResponse {
  gamePin: string;
  sessionId: string;
}

export const createGameSessionFn = async (quizId: string): Promise<CreateGameResponse> => {
  const response = await api.post<CreateGameResponse>(`/game/create/${quizId}`);
  return response.data;
};
