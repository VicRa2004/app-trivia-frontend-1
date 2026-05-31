import { api } from '../../../api/axios';
import type { Quiz, PaginatedResponse, CreateQuizData, QuizQuestion, CreateQuestionData, UpdateQuizData, Category } from '../types';

export const getQuizzesFn = async (page = 1, limit = 10, search?: string, categoryId?: string): Promise<PaginatedResponse<Quiz>> => {
  let url = `/quizzes?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  const response = await api.get<PaginatedResponse<Quiz>>(url);
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

export const getMyQuizzesFn = async (page = 1, limit = 10, search?: string, categoryId?: string): Promise<PaginatedResponse<Quiz>> => {
  let url = `/quizzes/my-quizzes?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  const response = await api.get<PaginatedResponse<Quiz>>(url);
  return response.data;
};

export const deleteQuizFn = async (quizId: string): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

export const updateQuestionFn = async ({ quizId, questionId, data }: { quizId: string, questionId: string, data: CreateQuestionData }): Promise<QuizQuestion> => {
  const response = await api.patch<QuizQuestion>(`/quizzes/${quizId}/questions/${questionId}`, data);
  return response.data;
};

export const deleteQuestionFn = async ({ quizId, questionId }: { quizId: string, questionId: string }): Promise<void> => {
  await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
};

export const getCategoriesFn = async (): Promise<PaginatedResponse<Category>> => {
  const response = await api.get<PaginatedResponse<Category>>('/categories?limit=100');
  return response.data;
};
