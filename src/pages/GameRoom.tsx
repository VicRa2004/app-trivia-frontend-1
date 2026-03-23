import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../features/game/store/useGameStore';
import { useGameSocket } from '../features/game/socket/useGameSocket';
import { LobbyView } from '../features/game/views/LobbyView';
import { HostView } from '../features/game/views/HostView';
import { PlayerView } from '../features/game/views/PlayerView';

const GameRoom = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const { status, isHost } = useGameStore();

  const {
    emitStartGame,
    emitNextQuestion,
    emitSubmitAnswer,
    emitShowCorrectAnswer,
    emitFinishGame
  } = useGameSocket(gamePin || null);

  // Limpiar recursos al salir
  useEffect(() => {
    if (!gamePin) {
      navigate('/dashboard');
    }
  }, [gamePin, navigate]);

  if (status === 'lobby') {
    return <LobbyView onStart={emitStartGame} />;
  }

  if (isHost) {
    return (
      <HostView 
        onShowAnswer={emitShowCorrectAnswer} 
        onNextQuestion={emitNextQuestion} 
        onFinishGame={emitFinishGame} 
      />
    );
  }

  return <PlayerView onSubmitAnswer={emitSubmitAnswer} />;
};

export default GameRoom;
