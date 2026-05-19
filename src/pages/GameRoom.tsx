import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGameStore } from "../features/game/store/useGameStore";
import { useGameSocket } from "../features/game/socket/useGameSocket";
import { LobbyView } from "../features/game/views/LobbyView";
import { HostView } from "../features/game/views/HostView";
import { PlayerView } from "../features/game/views/PlayerView";

const GameRoom = () => {
  const { gamePin } = useParams<{ gamePin: string }>();
  const navigate = useNavigate();
  const { status, isHost } = useGameStore();
  const resetGame = useGameStore((state) => state.resetGame);
  const setGamePin = useGameStore((state) => state.setGamePin);
  const currentStorePin = useGameStore((state) => state.gamePin);

  // Sincronizar el pin de juego desde la URL hacia el store
  useEffect(() => {
    if (gamePin && gamePin !== currentStorePin) {
      setGamePin(gamePin, isHost && gamePin === currentStorePin);
    }
  }, [gamePin, currentStorePin, isHost, setGamePin]);

  const {
    emitStartGame,
    emitNextQuestion,
    emitSubmitAnswer,
    emitShowCorrectAnswer,
    emitFinishGame,
  } = useGameSocket(gamePin || null);

  // Validar que exista gamePin
  useEffect(() => {
    if (!gamePin) {
      navigate("/dashboard");
    }
  }, [gamePin, navigate]);

  // Limpiar estado al desmontar o navegar fuera
  useEffect(() => {
    return () => {
      // Solo limpiar si realmente estamos saliendo de la ruta del juego
      if (!window.location.pathname.startsWith("/game")) {
        resetGame();
      }
    };
  }, [resetGame]);

  if (status === "lobby") {
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
