import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export const PlayerView = ({ onSubmitAnswer }: { onSubmitAnswer: (payload: string | string[], ms: number) => void }) => {
  const { currentQuestion, playerScore, status, answerError, correctOptions } = useGameStore();
  
  const [interaction, setInteraction] = useState<{ qId?: string | null, payloadSent: boolean, startedAt: number }>({
    qId: currentQuestion?.id,
    payloadSent: false,
    startedAt: new Date().getTime(),
  });

  const [showResultScreen, setShowResultScreen] = useState(false);

  if (status !== 'revealed' && showResultScreen) {
     setShowResultScreen(false);
  }

  useEffect(() => {
     if (status === 'revealed') {
        const to = setTimeout(() => {
           setShowResultScreen(true);
        }, 5000);
        return () => clearTimeout(to);
     }
  }, [status]);

  const [textAnswer, setTextAnswer] = useState('');
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(100);

  // Sync with current question
  if (currentQuestion?.id !== interaction.qId) {
    setInteraction({
      qId: currentQuestion?.id,
      payloadSent: false,
      startedAt: new Date().getTime(),
    });
    setTextAnswer('');
    setOrderedIds([]);
    setTimeLeft(100);
  }

  // Timer Effect
  useEffect(() => {
    if (status !== 'playing' || !currentQuestion || interaction.payloadSent) return;
    
    const duration = currentQuestion.timeLimit * 1000;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = now - interaction.startedAt;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeft(remainingPct);
    }, 100);
    return () => clearInterval(interval);
  }, [status, currentQuestion, interaction.payloadSent, interaction.startedAt]);

  const handleSubmit = (payload: string | string[]) => {
    if (interaction.payloadSent || status !== 'playing') return;
    setInteraction(prev => ({ ...prev, payloadSent: true }));
    const nowTs = new Date().getTime();
    onSubmitAnswer(payload, nowTs - interaction.startedAt);
  };

  const optionColors = ['bg-[#e21b3c]', 'bg-[#1368ce]', 'bg-[#d89e00]', 'bg-[#26890c]'];

  if (answerError) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-white animate-in zoom-in duration-300 bg-orange-500 rounded-4xl p-6 shadow-2xl">
           <AlertTriangle className="w-32 h-32 mb-6" />
           <h1 className="text-4xl font-extrabold mb-4 text-center">¡Demasiado Tarde!</h1>
           <p className="text-xl font-bold mb-6 text-center">{answerError}</p>
        </div>
     );
  }

  if (status === 'finished') {
     return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full text-white animate-in zoom-in duration-300 bg-primary rounded-4xl p-6 shadow-2xl">
           <Trophy className="w-32 h-32 mb-6 text-yellow-400" />
           <h1 className="text-5xl font-extrabold mb-4 text-center">¡Partida Terminada!</h1>
           <div className="text-3xl font-bold mb-8">
             Puntuación Final: {playerScore}
           </div>
           <button onClick={() => window.location.href = '/dashboard'} className="bg-white text-primary px-8 py-4 rounded-3xl font-bold text-2xl shadow-md hover:bg-gray-100 transition-all">
              Ir al Dashboard
           </button>
        </div>
     );
  }

  if (status === 'revealed' && showResultScreen) {
    const isCorrect = true; // El servidor ya summing puntos si es correcto, aquí solo mostramos fin del tiempo
    return (
       <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full text-white animate-in zoom-in duration-300 ${isCorrect ? 'bg-green-500' : 'bg-red-500'} rounded-4xl p-6 shadow-2xl`}>
          <CheckCircle2 className="w-32 h-32 mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">¡Tiempo Agotado!</h1>
          {currentQuestion?.type === 'short_answer' && (
            <div className="mt-4 bg-white/20 rounded-2xl p-6 text-center">
              <p className="text-lg font-bold mb-2">Respuesta correcta:</p>
              <p className="text-2xl md:text-3xl font-extrabold">{currentQuestion.options.find(o => useGameStore.getState().correctOptions.includes(o.id))?.content || 'No disponible'}</p>
            </div>
          )}
          <div className="flex items-center gap-2 text-xl md:text-2xl font-bold bg-white/20 px-6 py-3 rounded-full mt-4 shadow-sm">
            <Trophy /> Puntuación Total: {playerScore}
          </div>
       </div>
    );
  }

  const renderQuestionType = () => {
     if (!currentQuestion) return null;

     if (currentQuestion.type === 'short_answer') {
        return (
           <div className="flex flex-col gap-4 mt-8 w-full animate-in slide-in-from-bottom-4">
              <input 
                 type="text" 
                 className="w-full text-center text-3xl font-extrabold p-6 rounded-4xl border-4 border-border bg-surface text-text-main focus:border-primary outline-none shadow-sm transition-all"
                 placeholder="Escribe tu respuesta..."
                 value={textAnswer}
                 onChange={(e) => setTextAnswer(e.target.value)}
                 disabled={interaction.payloadSent}
              />
              <button 
                 onClick={() => handleSubmit(textAnswer)}
                 disabled={interaction.payloadSent || !textAnswer.trim()}
                 className="mt-4 bg-primary text-white py-6 rounded-4xl text-2xl font-bold flex justify-center items-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl"
              >
                 <Send size={28} /> Enviar Respuesta
              </button>
           </div>
        );
     }

     if (currentQuestion.type === 'ordering') {
        const handleOrderClick = (optId: string) => {
           if (orderedIds.includes(optId)) {
              setOrderedIds(prev => prev.filter(id => id !== optId));
           } else {
              setOrderedIds(prev => [...prev, optId]);
           }
        };

        return (
           <div className="flex flex-col gap-4 mt-4 flex-1 w-full animate-in fade-in">
              <div className="text-center font-extrabold text-text-main text-lg mb-2 bg-primary/10 py-2 rounded-2xl border border-primary/20">Toca las opciones en el orden correcto</div>
              <div className="flex justify-center gap-3 mb-2 h-14">
                 {orderedIds.map((id, idx) => (
                    <div key={id} className="w-14 h-14 bg-primary text-white rounded-2xl flex justify-center items-center font-extrabold text-2xl shadow-md animate-in zoom-in">{idx + 1}</div>
                 ))}
                 {Array.from({ length: currentQuestion.options.length - orderedIds.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="w-14 h-14 border-4 border-dashed border-border rounded-2xl" />
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
                          className={`w-full min-h-[90px] rounded-4xl shadow-md transition-all duration-200 border-4 outline-none ${isSelected ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-transparent bg-surface hover:border-border'} flex items-center p-4 gap-4`}
                       >
                          <div className={`w-10 h-10 rounded-full flex justify-center items-center font-extrabold text-xl ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-border text-text-muted'}`}>
                             {isSelected ? orderIndex : ''}
                          </div>
                          <span className="text-2xl font-bold flex-1 text-left text-text-main">{opt.content}</span>
                          {opt.imageUrl && <img src={opt.imageUrl} alt="" className="h-16 w-16 object-cover rounded-xl shadow-sm border border-border" />}
                       </button>
                    );
                 })}
              </div>
              {orderedIds.length === currentQuestion.options.length && (
                 <button 
                    onClick={() => handleSubmit(orderedIds)}
                    disabled={interaction.payloadSent}
                    className="mt-6 bg-primary text-white py-6 rounded-4xl text-2xl font-bold active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-4"
                 >
                    <CheckCircle2 size={32} /> Confirmar Orden
                 </button>
              )}
           </div>
        );
     }

     if (currentQuestion.type === 'image_choice') {
         return (
            <div className="grid grid-cols-2 gap-4 flex-1 mt-6 px-2">
               {currentQuestion.options.map((opt, i) => (
                 <button
                    key={opt.id}
                    disabled={interaction.payloadSent}
                    onClick={() => handleSubmit(opt.id)}
                    className={`w-full aspect-square flex flex-col items-center justify-center rounded-4xl shadow-xl transition-all duration-200 border-4 border-transparent ${optionColors[i % 4].replace('bg-', 'bg-')}/50 overflow-hidden hover:brightness-110 active:scale-95 disabled:scale-100 ${interaction.payloadSent ? 'opacity-40 grayscale-[0.5]' : ''}`}
                 >
                    {opt.imageUrl ? (
                       <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-text-main text-2xl font-extrabold px-4">Sin Imagen</span>
                    )}
                 </button>
               ))}
            </div>
         );
     }

     // Default multiple_choice
     return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-6">
           {currentQuestion.options.map((opt, i) => (
             <button
                key={opt.id}
                disabled={interaction.payloadSent}
                onClick={() => handleSubmit(opt.id)}
                className={`w-full min-h-[100px] md:min-h-[160px] flex flex-col items-center justify-center rounded-4xl shadow-xl transition-all duration-200 ${optionColors[i % 4]} text-white text-xl md:text-3xl font-extrabold hover:brightness-110 active:scale-95 disabled:scale-100 ${interaction.payloadSent ? 'opacity-40 grayscale-[0.5]' : ''}`}
             >
                {opt.imageUrl && <img src={opt.imageUrl} alt="" className="h-20 md:h-32 max-w-full object-cover mb-2 md:mb-4 rounded-xl shadow-lg border-4 border-white/20" />}
                <span className="drop-shadow-md px-4">{opt.content}</span>
             </button>
           ))}
        </div>
     );
  };

  return (
    <div className="flex flex-col w-full min-h-[80vh] max-w-3xl mx-auto gap-4 animate-in fade-in pb-8">
       <div className="flex justify-between items-center bg-surface p-5 rounded-4xl shadow-md border border-border mt-4">
          <div className="font-extrabold text-3xl flex items-center gap-3 text-primary"><Trophy className="w-8 h-8"/> {playerScore}</div>
          <div className="font-bold text-lg bg-primary/10 text-primary px-6 py-2 rounded-full border border-primary/20">
            {interaction.payloadSent ? 'Esperando...' : '¡A Jugar!'}
          </div>
       </div>

       {currentQuestion && !interaction.payloadSent && (
          <div className="w-full h-4 bg-border/50 rounded-full overflow-hidden shadow-inner mt-2">
             <div 
                className={`h-full rounded-full transition-all duration-100 ease-linear ${timeLeft < 25 ? 'bg-red-500 animate-[pulse_0.5s_ease-in-out_infinite]' : 'bg-primary'}`}
                style={{ width: `${timeLeft}%` }}
             />
          </div>
       )}

       {currentQuestion && (
          <div className="text-center font-extrabold text-xl md:text-2xl text-text-main my-2 px-4 shadow-sm bg-surface rounded-2xl py-4 border border-border">
             {currentQuestion.text}
          </div>
       )}

       {status === 'revealed' && !showResultScreen ? (
          <div className={`grid grid-cols-1 ${currentQuestion?.type === 'ordering' || currentQuestion?.type === 'short_answer' ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4 md:gap-6 px-2 mt-4`}>
             {currentQuestion?.options.map((opt, i) => {
               const isCorrect = correctOptions.includes(opt.id);
               let opacity = 'opacity-30';
               if (isCorrect) opacity = 'opacity-100';

               return (
                 <div key={opt.id} className={`flex ${currentQuestion?.type === 'ordering' ? 'flex-row' : 'flex-col justify-center text-center'} items-center min-h-[100px] md:min-h-[120px] rounded-4xl ${optionColors[i%4]} ${opacity} transition-all duration-300 shadow-xl p-4 md:p-6 gap-4 md:gap-6`}>
                    {currentQuestion?.type === 'ordering' && (
                       <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-full bg-white/30 text-white flex items-center justify-center font-extrabold text-2xl md:text-3xl shadow-inner border border-white/50">
                          {opt.position || i + 1}
                       </div>
                    )}
                    {opt.imageUrl && <img src={opt.imageUrl} alt="" className="h-16 w-16 md:h-32 md:w-32 object-cover rounded-2xl shadow-lg border-4 border-white/20" />}
                    <span className={`text-white font-extrabold ${currentQuestion?.type === 'ordering' ? 'text-xl md:text-3xl text-left flex-1' : 'text-2xl md:text-4xl mx-auto drop-shadow-md'}`}>{opt.content}</span>
                    {isCorrect && <CheckCircle2 className="text-white w-8 h-8 md:w-12 md:h-12 ml-auto" />}
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
