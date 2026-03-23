import { useMutation } from '@tanstack/react-query';
import { createGameSessionFn } from '../api/game.api';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

export const useCreateGameSessionMutation = () => {
  const navigate = useNavigate();
  const setGamePin = useGameStore(state => state.setGamePin);

  return useMutation({
    mutationFn: (quizId: string) => createGameSessionFn(quizId),
    onSuccess: (data) => {
      setGamePin(data.gamePin, true);
      navigate(`/game/${data.gamePin}`);
    },
  });
};
