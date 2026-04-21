import { useMutation, useQuery } from '@tanstack/react-query';
import { getAvatarsFn, getUserByIdFn, updateUserFn } from '../api/users.api';
import { useAuthStore } from '../../auth/store/useAuthStore';
import type { UpdateUserData } from '../types';

export const useAvatarsQuery = () => {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: getAvatarsFn,
    staleTime: 1000 * 60 * 10,
  });
};

export const useUserQuery = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserByIdFn(id),
    enabled: !!id,
  });
};

export const useUpdateUserMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (data: UpdateUserData) => {
      if (!user?.id) throw new Error('No user id');
      return updateUserFn(user.id, data);
    },
    onSuccess: (updatedUser) => {
      if (token) {
        setAuth(token, updatedUser);
      }
    },
  });
};