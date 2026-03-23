import { api } from '../../../api/axios';
import type { Quiz, PaginatedResponse, CreateQuizData, QuizQuestion, CreateQuestionData, UpdateQuizData } from '../types';

export const getQuizzesFn = async (page = 1, limit = 10): Promise<PaginatedResponse<Quiz>> => {
  const response = await api.get<PaginatedResponse<Quiz>>(`/quizzes?page=${page}&limit=${limit}`);
  return response.data;
};

export const getQuizByIdFn = async (id: string): Promise<Quiz> => {
  const response = await api.get<Quiz>(`/quizzes/${id}`);
  return response.data;
};

export const createQuizFn = async (data: CreateQuizData): Promise<Quiz> => {
  const response = await api.post<Quiz>('/quizzes', data);
  return response.data;
};

export const updateQuizFn = async ({ quizId, data }: { quizId: string, data: UpdateQuizData }): Promise<Quiz> => {
  const response = await api.patch<Quiz>(`/quizzes/${quizId}`, data);
  return response.data;
};

export const createQuestionFn = async ({ quizId, data }: { quizId: string, data: CreateQuestionData }): Promise<QuizQuestion> => {
  const response = await api.post<QuizQuestion>(`/quizzes/${quizId}/questions`, data);
  return response.data;
};
