import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";
import type { GameOption } from "../store/useGameStore";
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
  }>(() => ({
    qId: currentQuestion?.id,
    payloadSent: false,
    startedAt: Date.now(),
  }));

  const lastSecondRef = useRef<number>(-1);

  // Reproducir efectos de sonido correspondientes al revelarse la respuesta
  useEffect(() => {
    if (status === "revealed") {
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
  }, [status, playerLastResult, playCorrect, playIncorrect]);

  const [textAnswer, setTextAnswer] = useState("");
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(100);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Sincronizar con la pregunta actual en la fase de render para evitar cascadas
  if (currentQuestion && currentQuestion.id !== interaction.qId) {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    setInteraction({
      qId: currentQuestion.id,
      payloadSent: false,
      startedAt: now,
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

  const handleSubmit = useCallback((payload: string | string[]) => {
    if (interaction.payloadSent || status !== "playing") return;
    if (typeof payload === 'string') {
      setSelectedOptionId(payload);
    }
    setInteraction((prev) => ({ ...prev, payloadSent: true }));
    const nowTs = Date.now();
    onSubmitAnswer(payload, nowTs - interaction.startedAt);
  }, [interaction.payloadSent, interaction.startedAt, status, onSubmitAnswer]);

  if (currentQuestion && currentQuestion.id !== interaction.qId) {
    return null;
  }

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



  const renderQuestionType = () => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === "short_answer") {
      return (
        <div className="flex flex-col gap-3 mt-4 w-full animate-in slide-in-from-bottom-8 duration-300">
          <input
            type="text"
            className="w-full text-center text-xl md:text-2xl font-black p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-4 border-border bg-surface text-text-main focus:border-[#1b4cfc] outline-none shadow-lg transition-all focus:scale-[1.01]"
            placeholder="Escribe tu respuesta aquí..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            disabled={interaction.payloadSent}
          />
          <button
            onClick={() => handleSubmit(textAnswer)}
            disabled={interaction.payloadSent || !textAnswer.trim()}
            className="mt-3 bg-gradient-to-r from-[#1b4cfc] to-[#1036c7] text-white py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-xl md:text-2xl font-black flex justify-center items-center gap-2.5 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl cursor-pointer"
          >
            <Send size={24} /> Enviar Respuesta
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
        <div className="flex flex-col gap-3 mt-3 flex-1 w-full animate-in fade-in duration-300">
          <div className="text-center font-bold text-text-muted text-base md:text-lg mb-2 bg-[#1b4cfc]/10 dark:bg-[#1b4cfc]/20 py-2.5 px-5 rounded-xl border border-[#1b4cfc]/10 dark:border-[#1b4cfc]/20">
            Toca las opciones en el orden correcto
          </div>
          <div className="flex justify-center gap-2 mb-3 h-14 md:h-16">
            {orderedIds.map((id, idx) => (
              <div
                key={id}
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#1b4cfc] to-[#0c268f] text-white rounded-xl md:rounded-2xl flex justify-center items-center font-black text-xl md:text-2xl shadow-md animate-in zoom-in"
              >
                {idx + 1}
              </div>
            ))}
            {Array.from({
              length: currentQuestion.options.length - orderedIds.length,
            }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="w-12 h-12 md:w-16 md:h-16 border-4 border-dashed border-border rounded-xl md:rounded-2xl"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options.map((opt) => {
              const isSelected = orderedIds.includes(opt.id);
              const orderIndex = orderedIds.indexOf(opt.id) + 1;
              return (
                <button
                  key={opt.id}
                  disabled={interaction.payloadSent}
                  onClick={() => handleOrderClick(opt.id)}
                  className={`w-full min-h-[70px] md:min-h-[90px] rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-200 border-4 cursor-pointer outline-none ${
                    isSelected
                      ? "border-[#1b4cfc] bg-[#1b4cfc]/5 dark:bg-[#1b4cfc]/15 scale-[0.98]"
                      : "border-transparent bg-surface hover:border-border"
                  } flex items-center p-3 md:p-4 gap-3 md:gap-4`}
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex justify-center items-center font-black text-lg md:text-xl transition-all ${
                      isSelected
                        ? "bg-[#1b4cfc] text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-text-muted"
                    }`}
                  >
                    {isSelected ? orderIndex : ""}
                  </div>
                  <span className="text-lg md:text-xl font-extrabold flex-1 text-left text-text-main">
                    {opt.content}
                  </span>
                  {opt.imageUrl && (
                    <img
                      src={opt.imageUrl}
                      alt=""
                      className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-xl shadow-sm border border-border"
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
              className="mt-4 bg-gradient-to-r from-[#1b4cfc] to-[#1036c7] text-white py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] text-xl md:text-2xl font-black active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2.5 animate-in slide-in-from-bottom-6 cursor-pointer"
            >
              <CheckCircle2 size={28} /> Confirmar Orden
            </button>
          )}
        </div>
      );
    }

    if (currentQuestion.type === "image_choice") {
      return (
        <div className="grid grid-cols-2 gap-3 flex-1 mt-4 px-1 animate-in fade-in duration-300">
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
                className={`w-full aspect-square flex flex-col items-center justify-center rounded-[1.5rem] md:rounded-[2rem] shadow-lg transition-all duration-200 border-4 border-transparent overflow-hidden relative ${
                  optionColors[i % 4]
                } ${statusClasses}`}
              >
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-xl font-black px-3">Sin Imagen</span>
                )}
                
                {/* Figura Geométrica en Círculo */}
                <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-lg border border-white/20 shadow-md">
                  {optionShapes[i % 4]}
                </div>

                {/* Indicador de Respuesta Registrada sobre la opción */}
                {hasSent && isSelected && (
                  <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 animate-in zoom-in-90 duration-300">
                    <Sparkles className="w-10 h-10 text-yellow-300 drop-shadow animate-pulse" />
                    <span className="text-white font-black text-xs bg-[#1b4cfc]/90 px-3.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">¡Listo!</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 mt-4 animate-in fade-in duration-300">
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
              className={`w-full min-h-[80px] md:min-h-[120px] lg:min-h-[140px] flex items-center justify-between rounded-[1.5rem] md:rounded-[2rem] shadow-xl text-white text-lg md:text-2xl lg:text-3xl font-black transition-all p-4 md:p-6 gap-3 md:gap-4 relative overflow-hidden ${
                optionColors[i % 4]
              } ${statusClasses}`}
            >
              <div className="flex items-center gap-3.5 flex-1">
                {/* Círculo de Figura Geométrica Kahoot */}
                <span className="w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white font-black text-xl md:text-2.5xl border border-white/30 shadow-inner">
                  {optionShapes[i % 4]}
                </span>
                
                <div className="flex flex-col items-start text-left flex-1">
                  {opt.imageUrl && (
                    <img
                      src={opt.imageUrl}
                      alt=""
                      className="h-16 md:h-20 max-w-[85%] object-cover mb-2 rounded-xl shadow-md border-2 border-white/20"
                    />
                  )}
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] leading-tight text-lg md:text-xl lg:text-2xl">
                    {opt.content}
                  </span>
                </div>
              </div>

              {/* Indicador sobre la opción seleccionada */}
              {hasSent && isSelected && (
                <div className="flex flex-col items-center gap-0.5 shrink-0 bg-[#1b4cfc]/90 border-2 border-white/30 rounded-xl p-2 shadow-lg scale-105 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                  <span className="text-[10px] text-white uppercase tracking-wider font-black">¡Listo!</span>
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
      <div className="flex justify-between items-center bg-surface p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-md border border-border mt-4">
        <div className="font-black text-2xl md:text-3xl flex items-center gap-3 text-primary">
          <Trophy className="w-7 h-7 md:w-8 md:h-8 text-yellow-400 fill-yellow-400" /> {playerScore}
        </div>
        <div className="font-black text-md bg-primary/10 text-primary px-5 py-2 rounded-full border border-primary/10">
          {status === "revealed" ? "¡Resultados!" : (interaction.payloadSent ? "Esperando..." : "¡Tu Turno!")}
        </div>
      </div>

      {/* Banner de Feedback en Revelación (Instantáneo y Compacto) */}
      {status === "revealed" && (
        <div className="w-full animate-in zoom-in-95 duration-300">
          {playerLastResult === null ? (
            <div className="flex flex-col items-center justify-center bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 px-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg text-center">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-7 h-7 text-white animate-bounce" />
                <h2 className="text-xl md:text-2xl font-black">¡Tiempo Agotado!</h2>
              </div>
              <p className="text-xs md:text-sm font-bold text-white/90 mt-1">No respondiste esta pregunta a tiempo. ¡Acelera en la próxima! ⚡</p>
            </div>
          ) : playerLastResult.isCorrect ? (
            <div className="flex flex-col items-center justify-center bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 text-white py-4 px-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <CheckCircle2 className="w-7 h-7 text-white animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-spin" />
                </div>
                <h2 className="text-xl md:text-2xl font-black">¡Correcto!</h2>
                <span className="bg-white/20 px-3 py-1 rounded-full text-yellow-300 font-black text-md md:text-lg border border-white/30 ml-2 animate-pulse">
                  +{playerLastResult.pointsScored} <span className="text-xs text-white font-bold">pts</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white py-4 px-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg text-center">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-7 h-7 text-white animate-pulse" />
                <h2 className="text-xl md:text-2xl font-black">¡Incorrecto!</h2>
              </div>
              <p className="text-xs md:text-sm font-bold text-white/90 mt-1">¡Oh no! No te rindas, mantén la concentración. 🧠</p>
            </div>
          )}
        </div>
      )}

      {/* Temporizador */}
      {currentQuestion && !interaction.payloadSent && status === "playing" && (
        <div className="flex items-center gap-4 mt-1 px-2">
          <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-200/50 dark:border-gray-700/50">
            <div
              className={`h-full rounded-full ${getTimerColorClass()}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>
          <span className="font-black text-lg text-primary tabular-nums shrink-0 w-12 text-right">
            {Math.ceil((timeLeft * currentQuestion.timeLimit) / 100)}s
          </span>
        </div>
      )}

      {/* Pregunta */}
      {currentQuestion && (
        <div className={`text-center font-black text-xl md:text-2xl text-text-main my-2 px-5 shadow-md bg-surface rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-6 border transition-all duration-300 leading-snug ${
          timeLeft < 25 && !interaction.payloadSent && status === "playing"
            ? "border-red-500 shadow-red-500/20 ring-4 ring-red-500/10 animate-pulse"
            : "border-border"
        }`}>
          {currentQuestion.text}
        </div>
      )}

      {/* Banner premium de espera si ya contestó y el juego sigue activo */}
      {interaction.payloadSent && status === "playing" && (
        <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-dashed border-emerald-500/30 py-4 px-5 rounded-[1.5rem] md:rounded-[2rem] text-emerald-600 dark:text-emerald-400 font-black text-lg md:text-xl my-2 animate-pulse shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin duration-[4000ms]" />
          <span>✨ ¡Respuesta registrada! Esperando a que todos contesten...</span>
        </div>
      )}

      {/* Área Principal (Respuestas o Revelación) */}
      {status === "revealed" ? (
        <div className="flex flex-col gap-4 mt-2 w-full">
          {currentQuestion?.type !== "ordering" && currentQuestion?.type !== "short_answer" && (
            <div
              className={`grid grid-cols-1 ${
                currentQuestion?.type === "image_choice"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2"
              } gap-3 md:gap-4 px-1`}
            >
              {displayedOptions.map((opt, i) => {
                const isCorrect = correctOptions.includes(opt.id);
                const opacity = isCorrect ? "opacity-100 scale-100 ring-2 ring-emerald-500 dark:ring-emerald-400" : "opacity-35 scale-[0.98]";

                return (
                  <div
                    key={opt.id}
                    className={`flex flex-col justify-center text-center items-center min-h-[80px] md:min-h-[100px] rounded-[1.5rem] md:rounded-[2rem] ${
                      optionColors[i % 4]
                    } ${opacity} transition-all duration-300 shadow-xl p-4 md:p-6 gap-3 md:gap-4 border-2 ${
                      isCorrect ? "border-white" : "border-transparent"
                    }`}
                  >
                    {opt.imageUrl && (
                      <img
                        src={opt.imageUrl}
                        alt=""
                        className="h-14 w-14 md:h-18 md:w-18 object-cover rounded-xl shadow-lg border-2 border-white/20 shrink-0"
                      />
                    )}
                    <span className="text-white font-black drop-shadow-sm text-xl md:text-2xl mx-auto">
                      {opt.content}
                    </span>
                    {isCorrect && (
                      <CheckCircle2 className="text-white w-6 h-6 md:w-8 md:h-8 ml-auto shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {currentQuestion?.type === "ordering" && (() => {
            const hasAnswered = orderedIds.length === currentQuestion.options.length;
            
            const playerOrderedOptions = hasAnswered
              ? (orderedIds
                  .map((id) => currentQuestion.options.find((o) => o.id === id))
                  .filter(Boolean) as GameOption[])
              : [];

            const correctOrderedOptions = correctOptions
              .map((id) => currentQuestion.options.find((o) => o.id === id))
              .filter(Boolean) as GameOption[];

            return (
              <div className="flex flex-col gap-6 mt-2 w-full">
                {/* 1. Sección: Tu Respuesta */}
                <div className="bg-surface border border-border rounded-[2rem] p-6 shadow-md">
                  <h3 className="text-xl font-black text-text-main mb-4 flex items-center gap-2">
                    {hasAnswered ? "👋 Tu orden de respuesta:" : "⏳ No respondiste a tiempo:"}
                  </h3>
                  
                  {hasAnswered ? (
                    <div className="flex flex-col gap-3">
                      {playerOrderedOptions.map((opt, i) => {
                        const correctPos = correctOptions.indexOf(opt.id) + 1;
                        const playerPos = i + 1;
                        const isCorrectPosition = correctPos === playerPos;
                        
                        return (
                          <div
                            key={opt.id}
                            className={`flex flex-row items-center min-h-[80px] rounded-[1.5rem] border-4 p-4 md:p-5 gap-4 shadow-sm transition-all duration-300 ${
                              isCorrectPosition
                                ? "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-500 shadow-emerald-500/10"
                                : "bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border-rose-500 shadow-rose-500/10"
                            }`}
                          >
                            {/* Círculo de Posición de Respuesta del Jugador */}
                            <div
                              className={`w-11 h-11 shrink-0 rounded-full text-white flex items-center justify-center font-black text-xl shadow-inner border border-white/20 ${
                                isCorrectPosition ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            >
                              {playerPos}
                            </div>
                            
                            {opt.imageUrl && (
                              <img
                                src={opt.imageUrl}
                                alt=""
                                className="h-14 w-14 object-cover rounded-xl shadow-md border shrink-0"
                              />
                            )}
                            
                            <div className="flex-1 flex flex-col items-start justify-center">
                              <span className={`font-black text-lg md:text-xl text-left leading-tight ${
                                isCorrectPosition ? "text-emerald-900 dark:text-emerald-200" : "text-rose-900 dark:text-rose-200"
                              }`}>
                                {opt.content}
                              </span>
                              {!isCorrectPosition && (
                                <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                                  Posición correcta: {correctPos}
                                </span>
                              )}
                            </div>

                            {isCorrectPosition ? (
                              <CheckCircle2 className="text-emerald-500 w-8 h-8 shrink-0 animate-pulse" />
                            ) : (
                              <XCircle className="text-rose-500 w-8 h-8 shrink-0 animate-pulse" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-text-muted font-bold py-6 text-lg">
                      No se envió ningún orden de respuesta.
                    </div>
                  )}
                </div>

                {/* 2. Sección: Orden Correcto */}
                <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/5 dark:to-teal-950/5 border border-emerald-200/50 dark:border-emerald-800/20 rounded-[2rem] p-6 shadow-sm">
                  <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2">
                    ✨ Orden Correcto:
                  </h3>
                  <div className="flex flex-col gap-3">
                    {correctOrderedOptions.map((opt, i) => (
                      <div
                        key={opt.id}
                        className="flex flex-row items-center min-h-[70px] rounded-[1.5rem] bg-surface border border-emerald-100 dark:border-emerald-800/30 p-4 gap-4 shadow-sm"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/20">
                          {i + 1}
                        </div>
                        {opt.imageUrl && (
                          <img
                            src={opt.imageUrl}
                            alt=""
                            className="h-12 w-12 object-cover rounded-xl shadow-md border shrink-0"
                          />
                        )}
                        <span className="font-extrabold text-md md:text-lg text-emerald-800 dark:text-emerald-300 text-left flex-1">
                          {opt.content}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {currentQuestion?.type === "short_answer" && (
            <div className="mt-2 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-[1.5rem] p-4 text-center w-full max-w-md mx-auto shadow-inner backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider mb-1 text-emerald-600 dark:text-emerald-400">Respuesta correcta</p>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300">{currentQuestion.options[0]?.content || "No disponible"}</p>
            </div>
          )}

          {/* Indicador de puntuación total acumulada al final */}
          <div className="flex items-center gap-2.5 text-lg font-black bg-surface border border-border px-6 py-3 rounded-full mt-4 shadow-md w-fit mx-auto cursor-default">
            <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-text-main">
              Puntuación Total: <span className="text-primary font-black">{playerScore}</span>
            </span>
          </div>
        </div>
      ) : (
        renderQuestionType()
      )}
    </div>
  );
};
