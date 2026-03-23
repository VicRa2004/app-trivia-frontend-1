import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../../../config/env';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

export const useGameSocket = (gamePin: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore(state => state.token);
  
  const setPlayers = useGameStore(state => state.setPlayers);
  const setStatus = useGameStore(state => state.setStatus);
  const setNewQuestion = useGameStore(state => state.setNewQuestion);
  const setPlayerScore = useGameStore(state => state.setPlayerScore);
  const setRevealed = useGameStore(state => state.setRevealed);
  const setFinished = useGameStore(state => state.setFinished);

  useEffect(() => {
    if (!gamePin || !token) return;

    const socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_game', { gamePin, token });
    });

    socket.on('player_joined', (payload) => {
      if (payload.playersList) setPlayers(payload.playersList);
    });

    socket.on('game_started', () => {
      setStatus('playing');
    });

    socket.on('new_question', (payload) => {
      setNewQuestion(payload.question, payload.index, payload.total);
    });

    socket.on('all_questions_ended', () => {
       // Opcional: mostrar un estado intermedio
    });

    socket.on('answer_received', (payload) => {
      if (payload.success) {
        setPlayerScore(payload.newScore);
      }
    });

    socket.on('correct_answer_revealed', (payload) => {
      setRevealed(payload.correctOptions, payload.currentRanking);
    });

    socket.on('game_finished', (payload) => {
      if (payload.podium) setFinished(payload.podium);
    });

    socket.on('error', (err) => {
      alert(`Alerta de Servidor: ${err.message || 'Error desconocido'}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [gamePin, token, setPlayers, setStatus, setNewQuestion, setPlayerScore, setRevealed, setFinished]);

  const emitNextQuestion = () => socketRef.current?.emit('next_question', { gamePin, token });
  const emitSubmitAnswer = (optionId: string, timeElapsedMs: number) => socketRef.current?.emit('submit_answer', { gamePin, token, optionId, timeElapsedMs });
  const emitShowCorrectAnswer = () => socketRef.current?.emit('show_correct_answer', { gamePin, token });
  const emitFinishGame = () => socketRef.current?.emit('finish_game', { gamePin, token });
  const emitStartGame = () => socketRef.current?.emit('start_game', { gamePin, token });

  return {
    emitStartGame,
    emitNextQuestion,
    emitSubmitAnswer,
    emitShowCorrectAnswer,
    emitFinishGame
  };
};
