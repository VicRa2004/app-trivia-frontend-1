import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { WS_URL } from "../../../config/env";
import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { toast } from "sonner";
import { useGameAudio } from "../hooks/useGameAudio";

export const useGameSocket = (gamePin: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);
  const { playTick, startLobbyMusic, startBattleMusic, startVictoryMusic, stopMusic } = useGameAudio();

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
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_game", { gamePin, token }, (response: any) => {
        if (response && response.success) {
          if (response.isHost !== undefined) {
            useGameStore.getState().setGamePin(gamePin, response.isHost);
          }
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

          // Control de música inicial según estado
          if (status === "lobby") {
            startLobbyMusic();
          } else if (status === "playing") {
            startBattleMusic();
          } else if (status === "finished") {
            startVictoryMusic();
          } else {
            stopMusic();
          }

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

    socket.on("disconnect", (reason) => {
      toast.warning(`Desconectado del servidor (${reason}). Intentando reconectar...`, {
        id: "socket-disconnect",
        duration: Infinity,
      });
      stopMusic();
    });

    socket.on("connect_error", () => {
      toast.error("Error al conectar con el servidor de juegos.", {
        id: "socket-connect-error",
      });
    });

    socket.on("player_joined", (payload) => {
      if (payload.playersList) {
        setPlayers(payload.playersList);
      }
    });

    socket.on("player_disconnected", (payload) => {
      if (payload.playersList) {
        setPlayers(payload.playersList);
        if (payload.player) {
          toast.warning(`🔌 ${payload.player} se ha desconectado de la partida.`, {
            id: `player-disconnect-${payload.player}`
          });
        }
      }
    });

    socket.on("game_started", () => {
      setStatus("playing");
      startBattleMusic();
    });

    socket.on("new_question", (payload) => {
      setPlayerLastResult(null);
      setAnswersCount({ answered: 0, total: useGameStore.getState().players.length });
      setNewQuestion(payload.question, payload.index, payload.total);
      startBattleMusic();
    });

    socket.on("all_questions_ended", () => {
      // Opcional
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
        
        // Reproducir efecto neutro de confirmación
        playTick();
      } else {
        setPlayerLastResult({
          isCorrect: false,
          pointsScored: 0,
          newScore: 0,
        });
        setAnswerError(
          payload.message || "Demasiado tarde, cupo de ganadores lleno",
        );
        playTick();
      }
    });

    socket.on("answers_count_updated", (payload) => {
      setAnswersCount(payload);
    });

    socket.on("correct_answer_revealed", (payload) => {
      setRevealed(payload.correctOptions, payload.currentRanking);
      stopMusic(); // Detener música al revelar respuestas para generar suspenso
    });

    socket.on("game_finished", (payload) => {
      if (payload.podium) setFinished(payload.podium);
      startVictoryMusic();
    });

    socket.on("error", (err) => {
      toast.error(`Error del Servidor: ${err.message || "Error desconocido"}`);
    });

    return () => {
      socket.disconnect();
      stopMusic();
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
  const emitStartGame = () => {
    startBattleMusic();
    socketRef.current?.emit("start_game", { gamePin, token });
  };

  return {
    emitStartGame,
    emitNextQuestion,
    emitSubmitAnswer,
    emitShowCorrectAnswer,
    emitFinishGame,
  };
};
