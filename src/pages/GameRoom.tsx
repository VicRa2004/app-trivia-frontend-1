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
      resetGame();
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
