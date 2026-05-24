import { useMutation, useQuery } from "@tanstack/react-query";
import { createGameSessionFn, getGameHistoryFn } from "../api/game.api";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

export const useCreateGameSessionMutation = () => {
  const navigate = useNavigate();
  const setGamePin = useGameStore((state) => state.setGamePin);
  const resetGame = useGameStore((state) => state.resetGame);

  return useMutation({
    mutationFn: (quizId: string) => createGameSessionFn(quizId),
    onSuccess: (data) => {
      resetGame();
      setGamePin(data.gamePin, true);
      navigate(`/game/${data.gamePin}`);
    },
  });
};

export const useGameHistoryQuery = () => {
  return useQuery({
    queryKey: ["gameHistory"],
    queryFn: getGameHistoryFn,
  });
};

