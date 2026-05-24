import { useGameStore } from "../store/useGameStore";
import { Button } from "../../../components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/Card";
import { Eye, ArrowRight, Flag, CheckCircle2, Trophy, Users, BarChart3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const optionShapes = ["▲", "◆", "●", "■"];
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
  const navigate = useNavigate();
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
  const playTickRef = useRef(playTick);

  // Mantener actualizado el ref del callback para evitar dependencias circulares en useEffect
  useEffect(() => {
    onShowAnswerRef.current = onShowAnswer;
  }, [onShowAnswer]);

  useEffect(() => {
    playTickRef.current = playTick;
  }, [playTick]);

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
          playTickRef.current();
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
  }, [status, currentQuestion]);

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

    const getPlaceColor = (place: number) => {
      if (place === 1) return "from-yellow-400 via-amber-400 to-yellow-600 shadow-yellow-400/35 border-yellow-300";
      if (place === 2) return "from-slate-200 via-slate-300 to-gray-400 shadow-slate-300/35 border-slate-300";
      return "from-amber-700 via-amber-800 to-orange-900 shadow-amber-800/35 border-amber-800";
    };

    const getPlaceHeightClass = (place: number) => {
      if (place === 1) return "h-[260px] md:h-[320px] z-10 scale-105 ring-4 ring-yellow-400/20";
      if (place === 2) return "h-[190px] md:h-[230px]";
      return "h-[140px] md:h-[170px]";
    };

    const getAvatarBorder = (place: number) => {
      if (place === 1) return "border-yellow-400 ring-4 ring-yellow-400/30 ring-offset-2";
      if (place === 2) return "border-slate-300 ring-4 ring-slate-300/30 ring-offset-2";
      return "border-amber-700 ring-4 ring-amber-700/30 ring-offset-2";
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-5xl mx-auto text-center animate-in zoom-in duration-700 pb-16 relative overflow-hidden">
        {/* Decoraciones flotantes */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-200/25 rounded-full blur-3xl animate-pulse delay-700" />

        <h1 className="text-6xl md:text-8xl font-black text-text-main mb-16 drop-shadow-sm flex items-center justify-center gap-4">
          <Trophy className="w-14 h-14 md:w-20 md:h-20 text-yellow-400 fill-yellow-400 animate-bounce" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1b4cfc] via-blue-600 to-[#1b4cfc]">¡Podio Final!</span>
        </h1>
        
        {/* Renderizado de las torres del podio */}
        <div className="flex items-end justify-center gap-4 md:gap-10 w-full px-4 min-h-[420px]">
          {displayPodium.map((p, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center animate-in slide-in-from-bottom-40 duration-1000 ease-out flex-1 max-w-[220px]"
            >
              {/* Avatar Flotante */}
              <div className="relative mb-5">
                <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 bg-surface flex items-center justify-center shadow-2xl relative z-10 transition-transform hover:scale-105 ${getAvatarBorder(p.place)}`}>
                  {p.avatarUrl ? (
                    <img
                      src={getFullAvatarUrl(p.avatarUrl)}
                      alt={p.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-black text-4xl">
                      {p.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Corona para el 1er lugar y medallas para los demás */}
                {p.place === 1 ? (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-5xl animate-bounce duration-1000 z-20">
                    👑
                  </span>
                ) : (
                  <span className="absolute -top-3 -right-2 text-2xl z-20">
                    {p.place === 2 ? "🥈" : "🥉"}
                  </span>
                )}
              </div>

              {/* Nombre e info del Jugador */}
              <div className="font-black text-xl md:text-3xl mb-1 text-text-main truncate w-full drop-shadow-sm">
                {p.username}
              </div>
              <div className="font-black text-xs md:text-base text-primary mb-5 bg-primary/5 border border-primary/15 px-4.5 py-1.5 rounded-full shadow-sm">
                {p.score} <span className="font-bold text-[10px] text-text-muted">pts</span>
              </div>

              {/* Columna física del podio */}
              <div
                className={`w-full rounded-t-[2.5rem] bg-gradient-to-b ${getPlaceColor(
                  p.place
                )} border-t-2 shadow-3xl flex items-start justify-center pt-8 text-white text-6xl md:text-7xl font-black transition-all ${getPlaceHeightClass(
                  p.place
                )}`}
              >
                <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                  {p.place}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de dashboard */}
        <div className="mt-20">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-gradient-to-r from-primary to-purple-600 hover:brightness-110 text-white px-12 py-5.5 rounded-full font-black text-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-none"
          >
            Finalizar y Salir
          </Button>
        </div>
      </div>
    );
  }

  // Top 5 Parcial en pantalla completa al finalizar cada pregunta (una vez que se activa showRanking tras 4s de suspense)
  if (status === "revealed" && showRanking) {
    return (
      <div className="flex flex-col w-full h-full max-w-4xl mx-auto animate-in fade-in pb-12">
        {/* Barra superior de estado */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-4 mb-6 px-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-black text-lg text-primary bg-primary/10 px-6 py-3 rounded-full border border-primary/20 dark:border-primary/15 shadow-sm flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Pregunta {questionIndex + 1} de {questionTotal}
            </span>
          </div>

          {/* Panel de acciones del Host */}
          <div className="flex gap-3">
            {questionIndex + 1 < questionTotal ? (
              <Button
                icon={ArrowRight}
                onClick={onNextQuestion}
                variant="default"
                className="rounded-2xl shadow-xl text-lg px-8 py-3 font-extrabold hover:scale-102 transition-all border-none bg-primary text-white hover:bg-primary-hover"
              >
                Siguiente Pregunta
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

        {/* Card del Top 5 Parcial */}
        <Card className="rounded-[2.5rem] shadow-2xl border-none bg-surface border border-border overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-background/50 border-b border-border pb-6 pt-8 text-center">
            <CardTitle className="text-text-main text-4xl font-black px-4 flex items-center justify-center gap-3">
              🏆 Top 5 Parcial
            </CardTitle>
            <p className="text-text-muted mt-2 font-bold text-lg">Resultados acumulados hasta el momento</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-8 px-8 pb-10">
            {players.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className={`flex justify-between items-center bg-surface border-2 ${
                  i === 0
                    ? "border-yellow-400 bg-yellow-50/30 dark:bg-yellow-500/5 dark:border-yellow-500/50"
                    : "border-border hover:border-primary/20 dark:hover:border-primary/30"
                } rounded-[2rem] p-5 md:p-6 shadow-md transition-all duration-200 hover:-translate-y-0.5`}
              >
                <span className="font-black text-2xl flex items-center gap-5 text-text-main">
                  <span
                    className={`w-12 h-12 rounded-full ${
                      i === 0 
                        ? "bg-yellow-400 text-yellow-950 border-yellow-500" 
                        : "bg-primary/10 text-primary border-primary/15"
                    } flex items-center justify-center text-xl font-black border`}
                  >
                    {i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0">
                    {p.avatarUrl ? (
                      <img src={getFullAvatarUrl(p.avatarUrl)} alt={p.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-text-muted">
                        {p.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  {p.username}
                </span>
                <span
                  className={`font-black ${
                    i === 0 ? "text-amber-600 dark:text-yellow-400" : "text-primary"
                  } text-3xl flex items-center gap-2`}
                >
                  {p.score} <span className="text-sm text-text-muted font-semibold mt-2">pts</span>
                </span>
              </div>
            ))}
            {players.length === 0 && (
              <div className="text-center text-text-muted font-bold py-12 text-xl">Nadie se ha unido todavía.</div>
            )}
          </CardContent>
        </Card>
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
    return "bg-gradient-to-r from-[#1b4cfc] to-indigo-500";
  };

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto animate-in fade-in pb-12">
      {/* Barra superior de estado */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-4 mb-6 px-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-black text-lg text-primary bg-primary/10 px-6 py-3 rounded-full border border-primary/20 dark:border-primary/15 shadow-sm flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {currentQuestion
              ? `Pregunta ${questionIndex + 1} de ${questionTotal}`
              : "Partida Lista"}
          </span>
          {status === "playing" && answersCount && (
            <span className="font-black text-lg text-primary bg-primary/10 px-6 py-3 rounded-full border border-primary/30 dark:border-primary/20 shadow-sm flex items-center gap-2 animate-pulse">
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
              className="rounded-2xl shadow-md text-lg px-6 py-3 border-2 border-border bg-surface hover:bg-surface/80 text-text-main font-extrabold"
            >
              Revelar Respuesta
            </Button>
          ) : !currentQuestion || questionIndex + 1 < questionTotal ? (
            <Button
              icon={ArrowRight}
              onClick={onNextQuestion}
              variant="default"
              className="rounded-2xl shadow-xl text-lg px-8 py-3 font-extrabold hover:scale-102 transition-all border-none bg-primary text-white hover:bg-primary-hover"
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
          <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <div
              className={`h-full rounded-full ${getTimerColorClass()}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
          <span className="font-black text-xl text-primary tabular-nums shrink-0 w-12 text-right">
            {Math.ceil((timeLeft * currentQuestion.timeLimit) / 100)}s
          </span>
        </div>
      )}

      {/* Caja de Pregunta Principal */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="p-8 lg:p-12 shadow-2xl border-none rounded-[2.5rem] bg-surface relative overflow-hidden flex-1 border border-border min-h-[220px] flex flex-col justify-center">
          {currentQuestion?.imageUrl && (
            <div className="absolute inset-0 z-0 opacity-[0.03]">
              <img
                src={currentQuestion.imageUrl}
                alt="Background"
                className="w-full h-full object-cover blur-md scale-105"
              />
            </div>
          )}
          
          {currentQuestion?.imageUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              <div className="lg:col-span-7 text-center lg:text-left flex flex-col justify-center h-full">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-text-main animate-in slide-in-from-top-4 fade-in">
                  {currentQuestion?.text || "Esperando para comenzar la partida..."}
                </h2>
              </div>
              <div className="lg:col-span-5 flex justify-center">
                <img
                  src={currentQuestion.imageUrl}
                  className="max-h-72 lg:max-h-96 w-full object-cover rounded-[2rem] shadow-2xl border-4 border-border transform hover:scale-[1.01] transition-transform duration-300"
                  alt="Question"
                />
              </div>
            </div>
          ) : (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-text-main relative z-10 animate-in slide-in-from-top-4 fade-in text-center py-6">
              {currentQuestion?.text || "Esperando para comenzar la partida..."}
            </h2>
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
                    {opt.imageUrl ? (
                      <img src={opt.imageUrl} alt="" className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-white font-black text-lg">Sin Imagen</div>
                    )}
                    
                    {/* Figura Geométrica en Círculo Flotante */}
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-lg border border-white/20 shadow-md">
                      {optionShapes[i % 4]}
                    </div>

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
                className={`flex flex-row items-center justify-start text-left min-h-[120px] lg:min-h-[150px] rounded-[2.5rem] ${
                  optionColors[i % 4]
                } ${opacity} transition-all duration-300 shadow-xl p-6 lg:p-8 gap-6 lg:gap-8 border-4 ${
                  isRevealed && isCorrect ? "border-white shadow-2xl scale-[1.01]" : "border-transparent"
                }`}
              >
                {/* Círculo a la izquierda: Posición si es ordenación, Figura Geométrica en otro caso */}
                <div className="w-14 h-14 lg:w-18 lg:h-18 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-2xl lg:text-3.5xl border border-white/30 shadow-inner">
                  {currentQuestion.type === "ordering" 
                    ? (isRevealed ? opt.position || i + 1 : "?")
                    : optionShapes[i % 4]
                  }
                </div>
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt=""
                    className="h-20 w-20 lg:h-24 lg:w-24 object-cover rounded-2xl shadow-md border-2 border-white/20 shrink-0"
                  />
                )}
                <span className="text-white font-black drop-shadow-sm text-2xl lg:text-4xl flex-1 leading-snug">
                  {opt.content}
                </span>
                {isRevealed && isCorrect && (
                  <CheckCircle2 className="text-white w-10 h-10 lg:w-12 lg:h-12 ml-auto shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Respuesta Corta (Short Answer) al revelarse */}
      {status === "revealed" && currentQuestion && currentQuestion.type === "short_answer" && (
        <Card className="mt-8 rounded-[2rem] shadow-xl border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-800/30 animate-in slide-in-from-bottom-6">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-800/30 pb-4 pt-6">
            <CardTitle className="text-emerald-700 dark:text-emerald-400 text-2xl font-black px-4 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" /> Respuestas Válidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-8 pb-8">
            <div className="flex flex-col gap-3">
              {currentQuestion.options
                .filter((o) => o.content && o.content.trim() !== "")
                .map((opt, i) => (
                  <div
                    key={i}
                    className="text-2xl md:text-3xl font-black text-emerald-800 dark:text-emerald-300 text-center bg-surface rounded-2xl py-4 px-6 shadow-sm border border-border"
                  >
                    {opt.content}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
