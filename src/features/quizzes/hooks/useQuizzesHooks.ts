import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizzesFn, getMyQuizzesFn, createQuizFn, getQuizByIdFn, createQuestionFn, updateQuizFn, deleteQuizFn } from '../api/quizzes.api';
import { useNavigate } from 'react-router-dom';

export const useQuizzesQuery = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['quizzes', { page, limit }],
    queryFn: () => getQuizzesFn(page, limit),
  });
};

export const useMyQuizzesQuery = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['my-quizzes', { page, limit }],
    queryFn: () => getMyQuizzesFn(page, limit),
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
