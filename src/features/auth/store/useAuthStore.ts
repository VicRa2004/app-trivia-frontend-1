import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: Avatar;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
