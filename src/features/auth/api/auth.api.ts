import { api } from '../../../api/axios';
import type { LoginFormData, RegisterFormData } from '../schemas';
import type { User } from '../store/useAuthStore';

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export const loginFn = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const registerFn = async (data: RegisterFormData): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};
