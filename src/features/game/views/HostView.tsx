import { useGameStore } from "../store/useGameStore";
import { Button } from "../../../components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/Card";
import { Eye, ArrowRight, Flag, CheckCircle2, Trophy, Users, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../config/env";
import { useGameAudio } from "../hooks/useGameAudio";

const getFullAvatarUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_URL}/public${url}`;
};

export const HostView = ({
  onShowAnswer,
  onNextQuestion,
  onFinishGame,
}: {
  onShowAnswer: () => void;
  onNextQuestion: () => void;
  onFinishGame: () => void;
}) => {
  const {
    currentQuestion,
    questionIndex,
    questionTotal,
    status,
    players,
    podium,
    answersCount,
  } = useGameStore();

  const { playTick } = useGameAudio();
  const [timeLeft, setTimeLeft] = useState(100);
  const lastSecondRef = useRef<number>(-1);
  const onShowAnswerRef = useRef(onShowAnswer);

  // Mantener actualizado el ref del callback para evitar dependencias circulares en useEffect
  useEffect(() => {
    onShowAnswerRef.current = onShowAnswer;
  }, [onShowAnswer]);

  // Temporizador ultra fluido usando requestAnimationFrame a 60 FPS
  useEffect(() => {
    if (status !== "playing" || !currentQuestion) return;

    const duration = currentQuestion.timeLimit * 1000;
    const start = Date.now();
    let animationFrameId: number;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - start;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      
      setTimeLeft(remainingPct);

      const secondsRemaining = Math.ceil((remainingPct * currentQuestion.timeLimit) / 100);
      if (secondsRemaining !== lastSecondRef.current) {
        lastSecondRef.current = secondsRemaining;
        // Reproducir sonido de tick en los últimos 5 segundos críticos
        if (secondsRemaining <= 5 && secondsRemaining > 0) {
          playTick();
        }
      }

      if (remainingPct <= 0) {
        onShowAnswerRef.current();
      } else {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => {
      cancelAnimationFrame(animationFrameId);
      setTimeLeft(100);
    };
  }, [status, currentQuestion, playTick]);

  const [showRanking, setShowRanking] = useState(false);

  if (status !== "revealed" && showRanking) {
    setShowRanking(false);
  }

  useEffect(() => {
    if (status === "revealed") {
      const to = setTimeout(() => {
        setShowRanking(true);
      }, 4000); // 4 segundos de suspense antes de ver el top
      return () => clearTimeout(to);
    }
  }, [status]);

  // Colores Kahoot-style Premium
  const optionColors = [
    "bg-gradient-to-br from-[#ff3355] to-[#e21b3c] shadow-lg",
    "bg-gradient-to-br from-[#2a82e6] to-[#1368ce] shadow-lg",
    "bg-gradient-to-br from-[#ffca28] to-[#d89e00] shadow-lg",
    "bg-gradient-to-br from-[#4cd137] to-[#26890c] shadow-lg",
  ];

  // Podio Final (1ro, 2do, 3ro)
  if (status === "finished") {
    // Reordenar podium para renderizar visualmente: 2do (izquierda), 1ro (centro), 3ro (derecha)
    const sortedPodium = [...podium];
    const displayPodium = [];
    if (sortedPodium[1]) displayPodium.push({ ...sortedPodium[1], place: 2 });
    if (sortedPodium[0]) displayPodium.push({ ...sortedPodium[0], place: 1 });
    if (sortedPodium[2]) displayPodium.push({ ...sortedPodium[2], place: 3 });

    // En caso de que haya menos de 3 jugadores, rellenamos de forma segura
    const getPlaceColor = (place: number) => {
      if (place === 1) return "from-yellow-400 to-amber-500 shadow-yellow-500/20";
      if (place === 2) return "from-slate-300 to-gray-400 shadow-slate-400/20";
      return "from-amber-600 to-amber-800 shadow-amber-700/20";
    };

    const getPlaceHeightClass = (place: number) => {
      if (place === 1) return "h-[220px] md:h-[280px] z-10 scale-105";
      if (place === 2) return "h-[160px] md:h-[200px]";
      return "h-[120px] md:h-[150px]";
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto text-center animate-in zoom-in duration-500 pb-12">
        <h1 className="text-5xl md:text-7xl font-black text-[#7f0df2] mb-12 drop-shadow-sm flex items-center gap-3">
          <Trophy className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 fill-yellow-400 animate-bounce" />
          ¡Podio Final!
        </h1>
        
        {/* Renderizado de las torres del podio */}
        <div className="flex items-end justify-center gap-4 md:gap-8 w-full px-4 min-h-[380px]">
          {displayPodium.map((p, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center animate-in slide-in-from-bottom-32 duration-1000 ease-out flex-1 max-w-[200px]"
            >
              {/* Avatar Flotante */}
              <div className="relative mb-3">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-[#7f0df2] shadow-xl bg-[#7f0df2]/10 flex items-center justify-center">
                  {p.avatarUrl ? (
                    <img
                      src={getFullAvatarUrl(p.avatarUrl)}
                      alt={p.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#7f0df2] font-black text-3xl">
                      {p.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Corona para el 1er lugar */}
                {p.place === 1 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl animate-pulse">
                    👑
                  </span>
                )}
              </div>

              {/* Nombre e info del Jugador */}
              <div className="font-black text-xl md:text-3xl mb-1 text-gray-800 truncate w-full">
                {p.username}
              </div>
              <div className="font-black text-sm md:text-lg text-[#7f0df2] mb-4 bg-[#7f0df2]/10 px-4 py-1.5 rounded-full border border-[#7f0df2]/15">
                {p.score} pts
              </div>

              {/* Columna física del podio */}
              <div
                className={`w-full rounded-t-[2rem] bg-gradient-to-b ${getPlaceColor(
                  p.place
                )} shadow-2xl flex items-start justify-center pt-6 text-white text-5xl md:text-6xl font-black ${getPlaceHeightClass(
                  p.place
                )}`}
              >
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center text-2xl border border-white/25 shadow-inner">
                  {p.place}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de dashboard */}
        <div className="mt-16">
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="bg-[#7f0df2] hover:bg-[#6809c9] text-white px-10 py-5 rounded-full font-black text-2xl shadow-xl transition-all hover:scale-105 active:scale-95 duration-200"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Ordenar las opciones para preguntas de tipo ordering en la revelación
  const displayedOptions = currentQuestion?.options
    ? [...currentQuestion.options]
    : [];
  if (status === "revealed" && currentQuestion?.type === "ordering") {
    displayedOptions.sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  const getTimerColorClass = () => {
    if (timeLeft < 25) {
      return "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse";
    }
    if (timeLeft < 50) {
      return "bg-gradient-to-r from-amber-400 to-orange-500";
    }
    return "bg-gradient-to-r from-[#7f0df2] to-indigo-500";
  };

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto animate-in fade-in pb-12">
      {/* Barra superior de estado */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-4 mb-6 px-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-black text-lg text-[#7f0df2] bg-[#7f0df2]/10 px-6 py-3 rounded-full border border-[#7f0df2]/10 shadow-sm flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {currentQuestion
              ? `Pregunta ${questionIndex + 1} de ${questionTotal}`
              : "Partida Lista"}
          </span>
          {status === "playing" && answersCount && (
            <span className="font-black text-lg text-purple-600 bg-purple-500/10 px-6 py-3 rounded-full border border-purple-500/20 shadow-sm flex items-center gap-2 animate-pulse">
              <Users className="w-5 h-5" />
              Respuestas: {answersCount.answered} / {answersCount.total}
            </span>
          )}
        </div>

        {/* Panel de acciones del Host */}
        <div className="flex gap-3">
          {status === "playing" && currentQuestion ? (
            <Button
              icon={Eye}
              onClick={onShowAnswer}
              variant="secondary"
              className="rounded-2xl shadow-md text-lg px-6 py-3 border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold"
            >
              Revelar Respuesta
            </Button>
          ) : !currentQuestion || questionIndex + 1 < questionTotal ? (
            <Button
              icon={ArrowRight}
              onClick={onNextQuestion}
              className="bg-[#7f0df2] hover:bg-[#6809c9] text-white rounded-2xl shadow-xl text-lg px-8 py-3 font-extrabold hover:scale-102 transition-all"
            >
              {!currentQuestion ? "Lanzar 1ra Pregunta" : "Siguiente Pregunta"}
            </Button>
          ) : (
            <Button
              icon={Flag}
              onClick={onFinishGame}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl text-lg px-8 py-3 font-extrabold hover:scale-102 transition-all border-none"
            >
              Finalizar Partida
            </Button>
          )}
        </div>
      </div>

      {/* Temporizador del Host */}
      {status === "playing" && currentQuestion && (
        <div className="flex items-center gap-4 mx-2 md:mx-4 mb-6">
          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
            <div
              className={`h-full rounded-full transition-all duration-75 ease-linear ${getTimerColorClass()}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
          <span className="font-black text-xl text-[#7f0df2] tabular-nums shrink-0 w-12 text-right">
            {Math.ceil((timeLeft * currentQuestion.timeLimit) / 100)}s
          </span>
        </div>
      )}

      {/* Caja de Pregunta Principal */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="text-center p-8 lg:p-12 shadow-xl border-none rounded-[2rem] bg-white relative overflow-hidden flex-1 border border-gray-100 min-h-[220px] flex flex-col justify-center">
          {currentQuestion?.imageUrl && (
            <div className="absolute inset-0 z-0 opacity-[0.03]">
              <img
                src={currentQuestion.imageUrl}
                alt="Background"
                className="w-full h-full object-cover blur-md scale-105"
              />
            </div>
          )}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-800 relative z-10 animate-in slide-in-from-top-4 fade-in">
            {currentQuestion?.text || "Esperando para comenzar la partida..."}
          </h2>
          {currentQuestion?.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              className="max-h-64 lg:max-h-56 w-auto object-contain mx-auto mt-6 rounded-[1.5rem] relative z-10 shadow-lg border-4 border-gray-100"
              alt="Question"
            />
          )}
        </Card>

        {/* Imagen de las respuestas tipo Image Choice */}
        {!showRanking && currentQuestion?.type === "image_choice" && (
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 h-full min-h-[280px]">
              {currentQuestion.options.map((opt, i) => {
                const isCorrect = useGameStore.getState().correctOptions.includes(opt.id);
                const isRevealed = status === "revealed";
                return (
                  <div
                    key={opt.id}
                    className={`relative flex rounded-3xl ${
                      optionColors[i % 4]
                    } overflow-hidden shadow-lg border-4 border-transparent transition-all duration-300 ${
                      isRevealed && !isCorrect ? "opacity-30 scale-95" : "opacity-100"
                    }`}
                  >
                    {opt.imageUrl && (
                      <img src={opt.imageUrl} alt="" className="w-full aspect-square object-cover" />
                    )}
                    {isRevealed && isCorrect && (
                      <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                        <CheckCircle2 className="text-white w-16 h-16 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Opciones Estándar */}
      {!showRanking && currentQuestion && currentQuestion.type !== "image_choice" && (
        <div
          className={`grid grid-cols-1 ${
            currentQuestion.type === "ordering" || currentQuestion.type === "short_answer"
              ? "md:grid-cols-1"
              : "md:grid-cols-2"
          } gap-4 md:gap-6 px-2`}
        >
          {displayedOptions.map((opt, i) => {
            const isCorrect = useGameStore.getState().correctOptions.includes(opt.id);
            const isRevealed = status === "revealed";
            const opacity = isRevealed && !isCorrect ? "opacity-30 scale-98" : "opacity-100";

            return (
              <div
                key={opt.id}
                className={`flex ${
                  currentQuestion.type === "ordering" ? "flex-row" : "flex-col justify-center text-center"
                } items-center min-h-[100px] md:min-h-[120px] rounded-[2rem] ${
                  optionColors[i % 4]
                } ${opacity} transition-all duration-300 shadow-lg p-6 gap-4 border-2 ${
                  isRevealed && isCorrect ? "border-white shadow-xl" : "border-transparent"
                }`}
              >
                {currentQuestion.type === "ordering" && (
                  <div className="w-12 h-12 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-2xl shadow-inner border border-white/30">
                    {isRevealed ? opt.position || i + 1 : "?"}
                  </div>
                )}
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt=""
                    className="h-16 w-16 md:h-24 md:w-24 object-cover rounded-2xl shadow-md border-2 border-white/20"
                  />
                )}
                <span
                  className={`text-white font-black drop-shadow-sm ${
                    currentQuestion.type === "ordering"
                      ? "text-xl md:text-2xl text-left flex-1"
                      : "text-2xl md:text-3xl mx-auto"
                  }`}
                >
                  {opt.content}
                </span>
                {isRevealed && isCorrect && (
                  <CheckCircle2 className="text-white w-8 h-8 md:w-10 md:h-10 ml-auto shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Respuesta Corta (Short Answer) al revelarse */}
      {status === "revealed" && !showRanking && currentQuestion && currentQuestion.type === "short_answer" && (
        <Card className="mt-8 rounded-[2rem] shadow-xl border-none bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 animate-in slide-in-from-bottom-6">
          <CardHeader className="border-b border-emerald-100 pb-4 pt-6">
            <CardTitle className="text-emerald-700 text-2xl font-black px-4 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-pulse" /> Respuestas Válidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-8 pb-8">
            <div className="flex flex-col gap-3">
              {currentQuestion.options
                .filter((o) => o.content && o.content.trim() !== "")
                .map((opt, i) => (
                  <div
                    key={i}
                    className="text-2xl md:text-3xl font-black text-emerald-800 text-center bg-white rounded-2xl py-4 px-6 shadow-sm border border-emerald-100"
                  >
                    {opt.content}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 5 Parcial al finalizar cada pregunta */}
      {status === "revealed" && showRanking && (
        <Card className="mt-8 rounded-[2.5rem] shadow-xl border-none bg-white border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">
          <CardHeader className="bg-gray-50/50 rounded-t-[2.5rem] border-b border-gray-100 pb-4 pt-6">
            <CardTitle className="text-gray-800 text-3xl font-black px-4 flex items-center gap-2">
              🏆 Top 5 Parcial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6 pb-8">
            {players.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className={`flex justify-between items-center bg-white border-2 ${
                  i === 0
                    ? "border-yellow-400 bg-yellow-50/30"
                    : "border-gray-100 hover:border-[#7f0df2]/20"
                } rounded-[1.5rem] p-4 md:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5`}
              >
                <span className="font-black text-xl md:text-2xl flex items-center gap-4 text-gray-800">
                  <span
                    className={`w-10 h-10 rounded-full ${
                      i === 0 ? "bg-yellow-400 text-yellow-950" : "bg-[#7f0df2]/10 text-[#7f0df2]"
                    } flex items-center justify-center text-lg font-black border ${
                      i === 0 ? "border-yellow-500" : "border-[#7f0df2]/15"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    {p.avatarUrl ? (
                      <img src={getFullAvatarUrl(p.avatarUrl)} alt={p.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-black text-gray-400">
                        {p.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  {p.username}
                </span>
                <span
                  className={`font-black ${
                    i === 0 ? "text-amber-600" : "text-[#7f0df2]"
                  } text-2xl flex items-center gap-1.5`}
                >
                  {p.score} <span className="text-sm text-gray-400 font-semibold mt-1.5">pts</span>
                </span>
              </div>
            ))}
            {players.length === 0 && (
              <div className="text-center text-gray-400 font-bold py-8">Nadie se ha unido todavía.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
