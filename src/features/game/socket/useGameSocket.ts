import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "../../../config/env";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

export const useGameSocket = (gamePin: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  const setPlayers = useGameStore((state) => state.setPlayers);
  const setStatus = useGameStore((state) => state.setStatus);
  const setNewQuestion = useGameStore((state) => state.setNewQuestion);
  const setPlayerScore = useGameStore((state) => state.setPlayerScore);
  const setRevealed = useGameStore((state) => state.setRevealed);
  const setFinished = useGameStore((state) => state.setFinished);
  const setAnswerError = useGameStore((state) => state.setAnswerError);
  const setAnswersCount = useGameStore((state) => state.setAnswersCount);
  const setPlayerLastResult = useGameStore((state) => state.setPlayerLastResult);

  useEffect(() => {
    if (!gamePin || !token) return;

    const socket = io(WS_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_game", { gamePin, token }, (response: any) => {
        // Callback de respuesta directa para join_game (principalmente para host)
        if (response && response.success) {
          // Sincronizar el rol de host si viene en la respuesta
          if (response.isHost !== undefined) {
            useGameStore.getState().setGamePin(gamePin, response.isHost);
          }
          // Restaurar estado completo del juego
          if (response.playersList) setPlayers(response.playersList);

          const statusMap: {
            [key: string]: "lobby" | "playing" | "revealed" | "finished";
          } = {
            waiting: "lobby",
            in_progress: "playing",
            revealed: "revealed",
            finished: "finished",
          };
          const status = statusMap[response.status] || "lobby";
          setStatus(status);

          // Si hay pregunta actual, restaurarla
          if (
            response.currentQuestion &&
            response.currentQuestionIndex !== undefined &&
            response.totalQuestions !== undefined
          ) {
            setNewQuestion(
              response.currentQuestion,
              response.currentQuestionIndex,
              response.totalQuestions,
            );
          }
        }
      });
    });

    socket.on("player_joined", (payload) => {
      if (payload.playersList) setPlayers(payload.playersList);
    });

    socket.on("game_started", () => {
      setStatus("playing");
    });

    socket.on("new_question", (payload) => {
      setPlayerLastResult(null);
      // Initialize count to 0 answered, total players
      setAnswersCount({ answered: 0, total: useGameStore.getState().players.length });
      setNewQuestion(payload.question, payload.index, payload.total);
    });

    socket.on("all_questions_ended", () => {
      // Opcional: mostrar un estado intermedio
    });

    socket.on("answer_received", (payload) => {
      if (payload.success) {
        setPlayerScore(payload.newScore);
        setPlayerLastResult({
          isCorrect: payload.isCorrect,
          pointsScored: payload.pointsScored,
          newScore: payload.newScore,
        });
        setAnswerError(null);
      } else {
        setPlayerLastResult({
          isCorrect: false,
          pointsScored: 0,
          newScore: 0,
        });
        setAnswerError(
          payload.message || "Demasiado tarde, cupo de ganadores lleno",
        );
      }
    });

    socket.on("answers_count_updated", (payload) => {
      setAnswersCount(payload);
    });

    socket.on("correct_answer_revealed", (payload) => {
      setRevealed(payload.correctOptions, payload.currentRanking);
    });

    socket.on("game_finished", (payload) => {
      if (payload.podium) setFinished(payload.podium);
    });

    socket.on("error", (err) => {
      alert(`Alerta de Servidor: ${err.message || "Error desconocido"}`);
    });

    // Clean up
    return () => {
      socket.disconnect();
    };
  }, [
    gamePin,
    token,
    setPlayers,
    setStatus,
    setNewQuestion,
    setPlayerScore,
    setRevealed,
    setFinished,
    setAnswerError,
    setAnswersCount,
    setPlayerLastResult,
  ]);

  const emitNextQuestion = () =>
    socketRef.current?.emit("next_question", { gamePin, token });
  const emitSubmitAnswer = (
    answerPayload: string | string[],
    timeElapsedMs: number,
  ) =>
    socketRef.current?.emit("submit_answer", {
      gamePin,
      token,
      answerPayload,
      timeElapsedMs,
    });
  const emitShowCorrectAnswer = () =>
    socketRef.current?.emit("show_correct_answer", { gamePin, token });
  const emitFinishGame = () =>
    socketRef.current?.emit("finish_game", { gamePin, token });
  const emitStartGame = () =>
    socketRef.current?.emit("start_game", { gamePin, token });

  return {
    emitStartGame,
    emitNextQuestion,
    emitSubmitAnswer,
    emitShowCorrectAnswer,
    emitFinishGame,
  };
};
