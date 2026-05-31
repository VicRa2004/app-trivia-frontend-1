import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizzesFn, getMyQuizzesFn, createQuizFn, getQuizByIdFn, createQuestionFn, updateQuizFn, deleteQuizFn, updateQuestionFn, deleteQuestionFn, getCategoriesFn } from '../api/quizzes.api';
import { useNavigate } from 'react-router-dom';

export const useQuizzesQuery = (page = 1, limit = 10, search?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['quizzes', { page, limit, search, categoryId }],
    queryFn: () => getQuizzesFn(page, limit, search, categoryId),
  });
};

export const useMyQuizzesQuery = (page = 1, limit = 10, search?: string, categoryId?: string) => {
  return useQuery({
    queryKey: ['my-quizzes', { page, limit, search, categoryId }],
    queryFn: () => getMyQuizzesFn(page, limit, search, categoryId),
  });
};

export const useQuizByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['quizzes', id],
    queryFn: () => getQuizByIdFn(id),
    enabled: !!id,
  });
};

export const useCreateQuizMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createQuizFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate(`/dashboard/quiz/${data.id}/edit`);
    },
  });
};

export const useUpdateQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuizFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', data.id] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
    },
  });
};

export const useCreateQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestionFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useDeleteQuizMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deleteQuizFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
      navigate('/dashboard');
    },
  });
};

export const useUpdateQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuestionFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useDeleteQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestionFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesFn,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
