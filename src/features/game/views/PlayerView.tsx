import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import { Trophy, CheckCircle2, AlertTriangle, Send, XCircle, Sparkles } from "lucide-react";
import { Card } from "../../../components/Card";
import { useGameAudio } from "../hooks/useGameAudio";

export const PlayerView = ({
  onSubmitAnswer,
}: {
  onSubmitAnswer: (payload: string | string[], ms: number) => void;
}) => {
  const navigate = useNavigate();
  const {
    currentQuestion,
    playerScore,
    status,
    answerError,
    correctOptions,
    playerLastResult,
  } = useGameStore();
  const { playTick, playCorrect, playIncorrect } = useGameAudio();

  const [interaction, setInteraction] = useState<{
    qId?: string | null;
    payloadSent: boolean;
    startedAt: number;
  }>({
    qId: currentQuestion?.id,
    payloadSent: false,
    startedAt: Date.now(),
  });

  const [showResultScreen, setShowResultScreen] = useState(false);
  const lastSecondRef = useRef<number>(-1);

  if (status !== "revealed" && showResultScreen) {
    setShowResultScreen(false);
  }

  useEffect(() => {
    if (status === "revealed") {
      const to = setTimeout(() => {
        setShowResultScreen(true);
      }, 4000); // Acortado un poco a 4s para mejorar el ritmo de juego
      return () => clearTimeout(to);
    }
  }, [status]);

  // Reproducir efectos de sonido correspondientes al mostrar la pantalla de resultados del jugador
  useEffect(() => {
    if (showResultScreen) {
      const answered = playerLastResult !== null;
      const isCorrect = playerLastResult?.isCorrect || false;
      if (answered) {
        if (isCorrect) {
          playCorrect();
        } else {
          playIncorrect();
        }
      } else {
        playIncorrect(); // Sonido de error si se acabó el tiempo
      }
    }
  }, [showResultScreen, playerLastResult, playCorrect, playIncorrect]);

  const [textAnswer, setTextAnswer] = useState("");
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(100);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Sincronizar con la pregunta actual
  if (currentQuestion?.id !== interaction.qId) {
    setInteraction({
      qId: currentQuestion?.id,
      payloadSent: false,
      startedAt: Date.now(),
    });
    setTextAnswer("");
    setOrderedIds([]);
    setTimeLeft(100);
    setSelectedOptionId(null);
    lastSecondRef.current = -1;
  }

  // Ordenar las opciones mostradas para preguntas de tipo ordering cuando se revelan los resultados
  const displayedOptions = currentQuestion?.options
    ? [...currentQuestion.options]
    : [];
  if (status === "revealed" && currentQuestion?.type === "ordering") {
    displayedOptions.sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  const playTickRef = useRef(playTick);

  useEffect(() => {
    playTickRef.current = playTick;
  }, [playTick]);

  // Temporizador ultra fluido usando requestAnimationFrame a 60 FPS
  useEffect(() => {
    if (status !== "playing" || !currentQuestion || interaction.payloadSent) return;

    const duration = currentQuestion.timeLimit * 1000;
    const start = interaction.startedAt;
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

      if (remainingPct > 0) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [status, currentQuestion, interaction.payloadSent, interaction.startedAt]);

  const handleSubmit = (payload: string | string[]) => {
    if (interaction.payloadSent || status !== "playing") return;
    if (typeof payload === 'string') {
      setSelectedOptionId(payload);
    }
    setInteraction((prev) => ({ ...prev, payloadSent: true }));
    const nowTs = Date.now();
    onSubmitAnswer(payload, nowTs - interaction.startedAt);
  };

  const optionShapes = ["▲", "◆", "●", "■"];

  // Paleta de colores Kahoot-style Premium (Vibrantes con HSL adaptados)
  const optionColors = [
    "bg-gradient-to-br from-[#ff3355] to-[#e21b3c] hover:shadow-[#e21b3c]/30",
    "bg-gradient-to-br from-[#2a82e6] to-[#1368ce] hover:shadow-[#1368ce]/30",
    "bg-gradient-to-br from-[#ffca28] to-[#d89e00] hover:shadow-[#d89e00]/30",
    "bg-gradient-to-br from-[#4cd137] to-[#26890c] hover:shadow-[#26890c]/30",
  ];

  if (answerError) {
    return (
      <Card className="flex flex-col items-center justify-center min-h-[75vh] animate-in zoom-in duration-300 border-none bg-gradient-to-br from-amber-500 to-orange-600 p-8 shadow-2xl shadow-orange-500/20 text-white rounded-[2rem]">
        <AlertTriangle className="w-32 h-32 mb-6 text-white animate-bounce" />
        <h1 className="text-4xl font-black mb-4 text-center">¡Ups! Tiempo Agotado</h1>
        <p className="text-xl font-bold mb-6 text-center text-white/90">{answerError}</p>
      </Card>
    );
  }

  if (status === "finished") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full text-white animate-in zoom-in duration-500 bg-gradient-to-br from-[#1b4cfc] to-[#0c268f] rounded-[2.5rem] p-8 shadow-2xl shadow-[#1b4cfc]/20">
        <Trophy className="w-32 h-32 mb-6 text-yellow-300 animate-pulse drop-shadow-[0_10px_20px_rgba(253,224,71,0.4)]" />
        <h1 className="text-5xl font-black mb-4 text-center tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">¡Partida Terminada!</h1>
        <div className="text-3xl font-extrabold mb-10 bg-white/10 px-8 py-3 rounded-full border border-white/20">
          Puntuación Final: <span className="text-yellow-300">{playerScore}</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-[#1b4cfc] px-10 py-5 rounded-full font-black text-2xl shadow-lg hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  if (status === "revealed" && showResultScreen) {
    const answered = playerLastResult !== null;
    const isCorrect = playerLastResult?.isCorrect || false;
    const pointsScored = playerLastResult?.pointsScored || 0;

    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[75vh] w-full text-white animate-in zoom-in-95 duration-500 rounded-[2.5rem] p-8 shadow-3xl relative overflow-hidden ${
          !answered
            ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-600 shadow-orange-500/30"
            : isCorrect
            ? "bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 shadow-green-500/30"
            : "bg-gradient-to-tr from-red-600 via-rose-500 to-[#1b4cfc]/80 shadow-red-500/30"
        }`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        
        {!answered ? (
          <div className="flex flex-col items-center animate-bounce duration-1000">
            <AlertTriangle className="w-36 h-36 mb-6 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]" />
            <h1 className="text-5xl font-black mb-2 text-center tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">¡Tiempo Agotado!</h1>
            <p className="text-xl font-bold text-white/90 mb-6 text-center max-w-sm">No respondiste esta pregunta a tiempo. ¡Acelera en la próxima! ⚡</p>
          </div>
        ) : isCorrect ? (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="relative">
              <CheckCircle2 className="w-36 h-36 mb-6 text-white drop-shadow-[0_10px_25px_rgba(255,255,255,0.4)] animate-pulse" />
              <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-300 animate-spin duration-[3000ms]" />
              <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-200 animate-bounce" />
            </div>
            <h1 className="text-6xl font-black mb-3 text-center tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">¡Correcto!</h1>
            <div className="text-4xl font-black bg-white/20 hover:bg-white/25 px-10 py-4 rounded-full mb-8 text-yellow-300 border-2 border-white/30 shadow-inner transition-all scale-105">
              +{pointsScored} <span className="text-lg text-white font-bold">pts</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <XCircle className="w-36 h-36 mb-6 text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)]" />
            <h1 className="text-5xl font-black mb-2 text-center tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">¡Incorrecto!</h1>
            <p className="text-xl font-bold text-white/90 mb-6 text-center max-w-sm">¡Oh no! No te rindas, mantén la concentración. 🧠</p>
          </div>
        )}

        {currentQuestion?.type === "short_answer" && (
          <div className="mt-4 bg-black/10 border-2 border-white/20 rounded-[2rem] p-6 text-center w-full max-w-md shadow-inner backdrop-blur-sm animate-in fade-in-50 duration-500">
            <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-white/60">Respuesta correcta</p>
            <p className="text-3xl font-black text-white drop-shadow-sm">{currentQuestion.options[0]?.content || "No disponible"}</p>
          </div>
        )}

        <div className="flex items-center gap-3.5 text-2xl font-black bg-white/20 border-2 border-white/30 px-8 py-4.5 rounded-full mt-8 shadow-xl hover:scale-102 transition-transform cursor-default">
          <Trophy className="w-7 h-7 text-yellow-300 fill-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" /> 
          <span>Puntuación Total: <span className="text-yellow-300">{playerScore}</span></span>
        </div>
      </div>
    );
  }

  const renderQuestionType = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === "short_answer") {
      return (
        <div className="flex flex-col gap-4 mt-8 w-full animate-in slide-in-from-bottom-8 duration-300">
          <input
            type="text"
            className="w-full text-center text-2xl md:text-3xl font-black p-6 rounded-[2rem] border-4 border-gray-200 bg-white text-gray-800 focus:border-[#1b4cfc] outline-none shadow-lg transition-all focus:scale-[1.01]"
            placeholder="Escribe tu respuesta aquí..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={interaction.payloadSent}
          />
          <button
            onClick={() => handleSubmit(textAnswer)}
            disabled={interaction.payloadSent || !textAnswer.trim()}
            className="mt-4 bg-gradient-to-r from-[#1b4cfc] to-[#1036c7] text-white py-6 rounded-[2rem] text-2xl font-black flex justify-center items-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl cursor-pointer"
          >
            <Send size={28} /> Enviar Respuesta
          </button>
        </div>
      );
    }

    if (currentQuestion.type === "ordering") {
      const handleOrderClick = (optId: string) => {
        if (orderedIds.includes(optId)) {
          setOrderedIds((prev) => prev.filter((id) => id !== optId));
        } else {
          setOrderedIds((prev) => [...prev, optId]);
        }
      };

      return (
        <div className="flex flex-col gap-4 mt-4 flex-1 w-full animate-in fade-in duration-300">
          <div className="text-center font-bold text-gray-600 text-lg mb-2 bg-[#1b4cfc]/10 py-3 px-6 rounded-2xl border border-[#1b4cfc]/10">
            Toca las opciones en el orden correcto
          </div>
          <div className="flex justify-center gap-3 mb-4 h-16">
            {orderedIds.map((id, idx) => (
              <div
                key={id}
                className="w-16 h-16 bg-gradient-to-br from-[#1b4cfc] to-[#0c268f] text-white rounded-2xl flex justify-center items-center font-black text-2xl shadow-md animate-in zoom-in"
              >
                {idx + 1}
              </div>
            ))}
            {Array.from({
              length: currentQuestion.options.length - orderedIds.length,
            }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-16 h-16 border-4 border-dashed border-gray-200 rounded-2xl"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = orderedIds.includes(opt.id);
              const orderIndex = orderedIds.indexOf(opt.id) + 1;
              return (
                <button
                  key={opt.id}
                  disabled={interaction.payloadSent}
                  onClick={() => handleOrderClick(opt.id)}
                  className={`w-full min-h-[90px] rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-200 border-4 cursor-pointer outline-none ${
                    isSelected
                      ? "border-[#1b4cfc] bg-[#1b4cfc]/5 scale-[0.98]"
                      : "border-transparent bg-white hover:border-gray-200"
                  } flex items-center p-4 gap-4`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex justify-center items-center font-black text-xl transition-all ${
                      isSelected
                        ? "bg-[#1b4cfc] text-white shadow-md"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isSelected ? orderIndex : ""}
                  </div>
                  <span className="text-xl md:text-2xl font-extrabold flex-1 text-left text-gray-800">
                    {opt.content}
                  </span>
                  {opt.imageUrl && (
                    <img
                      src={opt.imageUrl}
                      alt=""
                      className="h-16 w-16 object-cover rounded-xl shadow-sm border border-gray-100"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {orderedIds.length === currentQuestion.options.length && (
            <button
              onClick={() => handleSubmit(orderedIds)}
              disabled={interaction.payloadSent}
              className="mt-6 bg-gradient-to-r from-[#1b4cfc] to-[#1036c7] text-white py-6 rounded-[2rem] text-2xl font-black active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-6 cursor-pointer"
            >
              <CheckCircle2 size={32} /> Confirmar Orden
            </button>
          )}
        </div>
      );
    }

    if (currentQuestion.type === "image_choice") {
      return (
        <div className="grid grid-cols-2 gap-4 flex-1 mt-6 px-2 animate-in fade-in duration-300">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = opt.id === selectedOptionId;
            const hasSent = interaction.payloadSent;
            
            let statusClasses = "";
            if (hasSent) {
              if (isSelected) {
                statusClasses = "opacity-100 scale-102 ring-4 ring-yellow-400 ring-offset-4 shadow-xl z-10";
              } else {
                statusClasses = "opacity-15 grayscale scale-95 cursor-not-allowed";
              }
            } else {
              statusClasses = "hover:scale-[1.02] hover:brightness-105 active:scale-98 cursor-pointer";
            }

            return (
              <button
                key={opt.id}
                disabled={hasSent}
                onClick={() => handleSubmit(opt.id)}
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-[2rem] shadow-lg transition-all duration-200 border-4 border-transparent overflow-hidden relative ${
                  optionColors[i % 4]
                } ${statusClasses}`}
              >
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-2xl font-black px-4">Sin Imagen</span>
                )}
                
                {/* Figura Geométrica en Círculo */}
                <div className="absolute top-3.5 left-3.5 w-11 h-11 rounded-full bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-xl border border-white/20 shadow-md">
                  {optionShapes[i % 4]}
                </div>

                {/* Indicador de Respuesta Registrada sobre la opción */}
                {hasSent && isSelected && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 animate-in zoom-in-90 duration-300">
                    <Sparkles className="w-12 h-12 text-yellow-300 drop-shadow animate-pulse" />
                    <span className="text-white font-black text-sm bg-[#1b4cfc]/90 px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-wider">¡Listo!</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // Default multiple_choice
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-6 animate-in fade-in duration-300">
        {currentQuestion.options.map((opt, i) => {
          const isSelected = opt.id === selectedOptionId;
          const hasSent = interaction.payloadSent;
          
          let statusClasses = "";
          if (hasSent) {
            if (isSelected) {
              statusClasses = "opacity-100 scale-[1.02] ring-4 ring-yellow-400 ring-offset-4 shadow-2xl z-10";
            } else {
              statusClasses = "opacity-15 grayscale scale-95 cursor-not-allowed";
            }
          } else {
            statusClasses = "hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 cursor-pointer";
          }

          return (
            <button
              key={opt.id}
              disabled={hasSent}
              onClick={() => handleSubmit(opt.id)}
              className={`w-full min-h-[100px] md:min-h-[150px] flex items-center justify-between rounded-[2rem] shadow-xl text-white text-xl md:text-3xl font-black transition-all p-6 gap-4 relative overflow-hidden ${
                optionColors[i % 4]
              } ${statusClasses}`}
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Círculo de Figura Geométrica Kahoot */}
                <span className="w-12 h-12 md:w-16 md:h-16 shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white font-black text-2xl md:text-3xl border border-white/30 shadow-inner">
                  {optionShapes[i % 4]}
                </span>
                
                <div className="flex flex-col items-start text-left flex-1">
                  {opt.imageUrl && (
                    <img
                      src={opt.imageUrl}
                      alt=""
                      className="h-20 md:h-24 max-w-[85%] object-cover mb-2 rounded-xl shadow-md border-2 border-white/20"
                    />
                  )}
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] leading-tight">
                    {opt.content}
                  </span>
                </div>
              </div>

              {/* Indicador sobre la opción seleccionada */}
              {hasSent && isSelected && (
                <div className="flex flex-col items-center gap-1 shrink-0 bg-[#1b4cfc]/90 border-2 border-white/30 rounded-2xl p-3 shadow-lg scale-105 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-7 h-7 text-white animate-bounce" />
                  <span className="text-xs text-white uppercase tracking-wider font-black">¡Listo!</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const getTimerColorClass = () => {
    if (timeLeft < 25) {
      return "bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse";
    }
    if (timeLeft < 50) {
      return "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
    }
    return "bg-gradient-to-r from-[#1b4cfc] to-indigo-500 shadow-[0_0_10px_rgba(27,76,252,0.2)]";
  };

  return (
    <div className="flex flex-col w-full min-h-[75vh] max-w-4xl mx-auto gap-4 animate-in fade-in pb-8">
      {/* Header de Estado */}
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-md border border-gray-100 mt-4">
        <div className="font-black text-3xl flex items-center gap-3 text-[#1b4cfc]">
          <Trophy className="w-8 h-8 text-yellow-400 fill-yellow-400" /> {playerScore}
        </div>
        <div className="font-black text-lg bg-[#1b4cfc]/10 text-[#1b4cfc] px-6 py-2.5 rounded-full border border-[#1b4cfc]/10">
          {interaction.payloadSent ? "Esperando..." : "¡Tu Turno!"}
        </div>
      </div>

      {/* Temporizador */}
      {currentQuestion && !interaction.payloadSent && (
        <div className="flex items-center gap-4 mt-2 px-2">
          <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200/50">
            <div
              className={`h-full rounded-full ${getTimerColorClass()}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
          <span className="font-black text-xl text-[#1b4cfc] tabular-nums shrink-0 w-12 text-right">
            {Math.ceil((timeLeft * currentQuestion.timeLimit) / 100)}s
          </span>
        </div>
      )}

      {/* Pregunta */}
      {currentQuestion && (
        <div className={`text-center font-black text-2xl md:text-3xl text-gray-800 my-2 px-6 shadow-md bg-white rounded-[2rem] py-6 border transition-all duration-300 leading-snug ${
          timeLeft < 25 && !interaction.payloadSent
            ? "border-red-500 shadow-red-500/20 ring-4 ring-red-500/10 animate-pulse"
            : "border-gray-100"
        }`}>
          {currentQuestion.text}
        </div>
      )}

      {/* Banner premium de espera si ya contestó y el juego sigue activo */}
      {interaction.payloadSent && status === "playing" && (
        <div className="flex items-center justify-center gap-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-dashed border-emerald-500/35 py-5 px-6 rounded-[2rem] text-emerald-600 dark:text-emerald-400 font-black text-xl md:text-2xl my-2 animate-pulse shadow-sm">
          <Sparkles className="w-6 h-6 text-emerald-500 dark:text-emerald-400 animate-spin duration-[4000ms]" />
          <span>✨ ¡Respuesta registrada! Esperando a que todos contesten...</span>
        </div>
      )}

      {/* Área Principal (Respuestas o Revelación) */}
      {status === "revealed" && !showResultScreen ? (
        <div
          className={`grid grid-cols-1 ${
            currentQuestion?.type === "ordering" ||
            currentQuestion?.type === "short_answer"
              ? "md:grid-cols-1"
              : "md:grid-cols-2"
          } gap-4 md:gap-6 px-2 mt-4`}
        >
          {displayedOptions.map((opt, i) => {
            const isCorrect = correctOptions.includes(opt.id);
            const opacity = isCorrect ? "opacity-100 scale-100" : "opacity-35 scale-[0.98]";

            return (
              <div
                key={opt.id}
                className={`flex ${
                  currentQuestion?.type === "ordering" ? "flex-row" : "flex-col justify-center text-center"
                } items-center min-h-[100px] md:min-h-[120px] rounded-[2rem] ${
                  optionColors[i % 4]
                } ${opacity} transition-all duration-300 shadow-xl p-6 gap-4 border-2 ${
                  isCorrect ? "border-white" : "border-transparent"
                }`}
              >
                {currentQuestion?.type === "ordering" && (
                  <div className="w-12 h-12 shrink-0 rounded-full bg-white/20 text-white flex items-center justify-center font-black text-2xl shadow-inner border border-white/30">
                    {opt.position || i + 1}
                  </div>
                )}
                {opt.imageUrl && (
                  <img
                    src={opt.imageUrl}
                    alt=""
                    className="h-16 w-16 md:h-24 md:w-24 object-cover rounded-2xl shadow-lg border-2 border-white/20"
                  />
                )}
                <span
                  className={`text-white font-black drop-shadow-sm ${
                    currentQuestion?.type === "ordering"
                      ? "text-xl md:text-2xl text-left flex-1"
                      : "text-2xl md:text-3xl mx-auto"
                  }`}
                >
                  {opt.content}
                </span>
                {isCorrect && (
                  <CheckCircle2 className="text-white w-8 h-8 md:w-10 md:h-10 ml-auto shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        renderQuestionType()
      )}
    </div>
  );
};
