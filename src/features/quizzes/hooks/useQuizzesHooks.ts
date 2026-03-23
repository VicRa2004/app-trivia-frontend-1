import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizzesFn, createQuizFn, getQuizByIdFn, createQuestionFn } from '../api/quizzes.api';
import { useNavigate } from 'react-router-dom';

export const useQuizzesQuery = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['quizzes', { page, limit }],
    queryFn: () => getQuizzesFn(page, limit),
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
