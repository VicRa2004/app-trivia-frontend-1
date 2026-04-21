import { useGameStore } from '../store/useGameStore';
import { Button } from '../../../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import { Eye, ArrowRight, Flag, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export const HostView = ({ 
  onShowAnswer, 
  onNextQuestion, 
  onFinishGame 
}: { 
  onShowAnswer: () => void, 
  onNextQuestion: () => void, 
  onFinishGame: () => void 
}) => {
  const { currentQuestion, questionIndex, questionTotal, status, players, podium } = useGameStore();

  const optionColors = ['bg-[#e21b3c]', 'bg-[#1368ce]', 'bg-[#d89e00]', 'bg-[#26890c]'];

  const [timeLeft, setTimeLeft] = useState(100);

  useEffect(() => {
     if (status !== 'playing' || !currentQuestion) return;
     const start = Date.now();
     const duration = currentQuestion.timeLimit * 1000;
     const interval = setInterval(() => {
        const remaining = Math.max(0, 100 - ((Date.now() - start) / duration) * 100);
        setTimeLeft(remaining);
        if (remaining === 0) {
           onShowAnswer();
        }
     }, 100);
     return () => {
        clearInterval(interval);
        setTimeLeft(100);
     };
  }, [status, currentQuestion, onShowAnswer]);

  const [showRanking, setShowRanking] = useState(false);

  if (status !== 'revealed' && showRanking) {
     setShowRanking(false);
  }

  useEffect(() => {
     if (status === 'revealed') {
        const to = setTimeout(() => {
           setShowRanking(true);
        }, 5000);
        return () => clearTimeout(to);
     }
  }, [status]);

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-5xl mx-auto text-center animate-in zoom-in">
        <h1 className="text-6xl font-extrabold text-primary mb-16 drop-shadow-md">¡Podio Final!</h1>
        <div className="flex flex-col md:flex-row items-end justify-center gap-8 w-full px-4">
           {podium.map((p, i) => (
             <div key={i} className={`flex flex-col items-center animate-in Math.max(slide-in-from-bottom-${(3-i)*10}, slide-in-from-bottom-10) duration-700`}>
                 <div className="font-extrabold text-3xl mb-2 text-text-main">{p.username}</div>
                 <div className="font-bold text-xl text-primary mb-4 bg-primary/10 px-4 py-1 rounded-full">{p.score} pts</div>
                 <div className={`w-36 rounded-t-4xl bg-primary shadow-2xl flex items-start justify-center pt-8 text-white text-6xl font-extrabold transition-all`} style={{ height: `${(3 - i) * 140}px`, opacity: i === 0 ? 1 : 0.85 }}>
                   {i + 1}
                 </div>
             </div>
           ))}
         </div>
         <div className="mt-12">
            <Button onClick={() => window.location.href = '/dashboard'} className="bg-primary hover:bg-[#6c0ac0] text-white px-8 py-4 rounded-3xl font-extrabold text-2xl shadow-xl transition-all">
               Volver al Dashboard
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto animate-in fade-in pb-12">
       <div className="flex justify-between items-center mb-8 px-2 mt-4">
         <span className="font-bold text-lg text-primary bg-primary/10 px-6 py-3 rounded-full border border-primary/20 shadow-sm flex items-center gap-2">
           {currentQuestion ? `Pregunta ${questionIndex + 1} de ${questionTotal}` : 'Partida Lista'}
         </span>
         
         {status === 'playing' && currentQuestion && (
            <div className="flex-1 mx-2 md:mx-8 h-4 bg-border/50 rounded-full overflow-hidden shadow-inner">
               <div 
                  className={`h-full rounded-full transition-all duration-100 ease-linear ${timeLeft < 25 ? 'bg-red-500 animate-[pulse_0.5s_ease-in-out_infinite]' : 'bg-primary'}`}
                  style={{ width: `${timeLeft}%` }}
               />
            </div>
         )}
         
         <div className="flex gap-4">
           {status === 'playing' && currentQuestion ? (
             <Button icon={Eye} onClick={onShowAnswer} variant="secondary" className="rounded-2xl shadow-md text-lg px-6 py-3 border-2 border-border bg-surface hover:bg-surface-hover">Revelar Respuesta</Button>
           ) : !currentQuestion || (questionIndex + 1 < questionTotal) ? (
             <Button icon={ArrowRight} onClick={onNextQuestion} className="bg-primary rounded-2xl shadow-xl text-lg px-8 py-3 hover:brightness-110 transition-all">
               {!currentQuestion ? "Lanzar 1ra Pregunta" : "Siguiente Pregunta"}
             </Button>
           ) : (
             <Button icon={Flag} onClick={onFinishGame} className="bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-xl text-lg px-8 py-3 transition-all">Finalizar Partida</Button>
           )}
         </div>
       </div>

        <div className={`flex flex-col lg:flex-row gap-6 mb-8`}>
           <Card className="text-center p-8 lg:p-12 shadow-2xl border-none rounded-[2rem] bg-surface relative overflow-hidden flex-1">
              {currentQuestion?.imageUrl && (
                 <div className="absolute inset-0 z-0 opacity-10">
                   <img src={currentQuestion.imageUrl} alt="Background" className="w-full h-full object-cover blur-md scale-105" />
                 </div>
              )}
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-text-main relative z-10 drop-shadow-sm">
                {currentQuestion?.text || "Esperando para comenzar la partida..."}
              </h2>
              {currentQuestion?.imageUrl && (
                 <img src={currentQuestion.imageUrl} className="max-h-64 lg:max-h-48 w-full object-contain mx-auto mt-6 rounded-2xl relative z-10 shadow-xl border-4 border-white" alt="Question" />
              )}
           </Card>

           {!showRanking && currentQuestion?.type === 'image_choice' && (
              <div className="flex-1">
                 <div className="grid grid-cols-2 gap-4 h-full min-h-[300px] lg:min-h-full">
                    {currentQuestion.options.map((opt, i) => {
                      const isCorrect = useGameStore.getState().correctOptions.includes(opt.id);
                      const isRevealed = status === 'revealed';
                      return (
                        <div key={opt.id} className={`relative flex rounded-3xl ${optionColors[i%4]} overflow-hidden shadow-xl transition-all duration-300 ${isRevealed && !isCorrect ? 'opacity-40' : 'opacity-100'}`}>
                           {opt.imageUrl && (
                             <img src={opt.imageUrl} alt="" className="w-full aspect-square object-cover" />
                           )}
                           {isRevealed && isCorrect && <CheckCircle2 className="absolute top-3 right-3 text-white w-8 h-8 lg:w-10 lg:h-10" />}
                        </div>
                      );
                    })}
                 </div>
              </div>
           )}
        </div>

        {!showRanking && currentQuestion?.type !== 'image_choice' && (
          <div className={`grid grid-cols-1 ${currentQuestion?.type === 'ordering' || currentQuestion?.type === 'short_answer' ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4 md:gap-6 px-2`}>
             {currentQuestion?.options.map((opt, i) => {
               const isCorrect = useGameStore.getState().correctOptions.includes(opt.id);
               const isRevealed = status === 'revealed';
               let opacity = 'opacity-100';
               if (isRevealed && !isCorrect) opacity = 'opacity-30';

               return (
                 <div key={opt.id} className={`flex ${currentQuestion.type === 'ordering' ? 'flex-row' : 'flex-col justify-center text-center'} items-center min-h-[100px] md:min-h-[120px] rounded-4xl ${optionColors[i%4]} ${opacity} transition-all duration-300 shadow-xl p-4 md:p-6 gap-4 md:gap-6`}>
                    {currentQuestion.type === 'ordering' && (
                       <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-full bg-white/30 text-white flex items-center justify-center font-extrabold text-2xl md:text-3xl shadow-inner border border-white/50">
                          {opt.position || i + 1}
                       </div>
                    )}
                    {opt.imageUrl && <img src={opt.imageUrl} alt="" className="h-16 w-16 md:h-32 md:w-32 object-cover rounded-2xl shadow-lg border-4 border-white/20" />}
                    <span className={`text-white font-extrabold ${currentQuestion.type === 'ordering' ? 'text-xl md:text-3xl text-left flex-1' : 'text-2xl md:text-4xl mx-auto drop-shadow-md'}`}>{opt.content}</span>
                    {isRevealed && isCorrect && <CheckCircle2 className="text-white w-8 h-8 md:w-12 md:h-12 ml-auto" />}
                 </div>
               );
             })}
          </div>
        )}

        {status === 'revealed' && !showRanking && currentQuestion?.type === 'short_answer' && (
          <Card className="mt-8 rounded-[2rem] shadow-2xl border-4 border-green-500 animate-in slide-in-from-bottom-6">
            <CardHeader className="bg-green-500/10 rounded-t-[2rem] border-b border-green-500/20 pb-4 pt-6">
              <CardTitle className="text-green-600 text-2xl font-extrabold px-4 flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8" /> Respuesta Correcta
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8 pb-8">
              <div className="flex flex-col gap-3">
                {currentQuestion.options
                  .filter(o => o.content && o.content.trim() !== '')
                  .map((opt, i) => (
                    <div key={i} className="text-2xl md:text-3xl font-extrabold text-text-main text-center bg-green-500/10 rounded-2xl py-4 px-4 border-2 border-green-500/20">
                      {opt.content}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'revealed' && showRanking && (
         <Card className="mt-12 rounded-[3rem] shadow-2xl border-none animate-in slide-in-from-bottom-8">
           <CardHeader className="bg-primary/10 rounded-t-[3rem] border-b border-primary/10 pb-4 pt-8">
             <CardTitle className="text-primary text-3xl font-extrabold px-4">Top 5 Parcial</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4 pt-8 px-8 pb-10">
             {players.slice(0,5).map((p, i) => (
                <div key={i} className={`flex justify-between items-center bg-surface border-2 ${i === 0 ? 'border-yellow-400 bg-yellow-50' : 'border-border hover:border-primary/30'} rounded-2xl p-5 shadow-sm transition-colors`}>
                  <span className="font-extrabold text-2xl flex items-center gap-4 text-text-main">
                     <span className={`w-10 h-10 rounded-full ${i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-primary/10 text-primary'} flex items-center justify-center text-lg shadow-sm border ${i === 0 ? 'border-yellow-500' : 'border-primary/20'}`}>{i+1}</span>
                     {p.username}
                  </span>
                  <span className={`font-extrabold ${i === 0 ? 'text-yellow-600' : 'text-primary'} text-2xl flex items-center gap-2`}>
                     {p.score} <span className="text-base text-text-muted mt-1">pts</span>
                  </span>
                </div>
             ))}
             {players.length === 0 && (
                <div className="text-center text-text-muted font-bold py-6">Nadie ha puntuado aún.</div>
             )}
           </CardContent>
         </Card>
       )}
    </div>
  );
};
