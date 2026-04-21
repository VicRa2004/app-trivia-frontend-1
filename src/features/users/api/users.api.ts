import { api } from '../../../api/axios';
import type { Avatar, UserProfile, PaginatedResponse, UpdateUserData } from '../types';

export const getAvatarsFn = async (): Promise<PaginatedResponse<Avatar>> => {
  const response = await api.get<PaginatedResponse<Avatar>>('/avatars');
  return response.data;
};

export const getUserByIdFn = async (id: string): Promise<UserProfile> => {
  const response = await api.get<UserProfile>(`/users/${id}`);
  return response.data;
};

export const updateUserFn = async (id: string, data: UpdateUserData): Promise<UserProfile> => {
  const response = await api.patch<UserProfile>(`/users/${id}`, data);
  return response.data;
};