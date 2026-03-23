import { useGameStore } from '../store/useGameStore';
import { Button } from '../../../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/Card';
import { Eye, ArrowRight, Flag } from 'lucide-react';

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

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto text-center animate-in zoom-in">
        <h1 className="text-5xl font-extrabold text-primary mb-12">¡Podio Final!</h1>
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 w-full">
           {podium.map((p, i) => (
             <div key={i} className={`flex flex-col items-center animate-in slide-in-from-bottom-${(3-i)*10} duration-500`}>
                 <div className="font-bold text-2xl mb-2">{p.username}</div>
                 <div className="font-bold text-text-muted mb-4">{p.score} pts</div>
                 <div className={`w-32 rounded-t-xl bg-primary shadow-xl flex items-start justify-center pt-4 text-white text-4xl font-extrabold`} style={{ height: `${(3 - i) * 100}px` }}>
                   {i + 1}
                 </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full max-w-5xl mx-auto animate-in fade-in">
       <div className="flex justify-between items-center mb-6 px-2">
         <span className="font-bold text-text-muted">
           {currentQuestion ? `Pregunta ${questionIndex + 1} de ${questionTotal}` : 'Partida Iniciada'}
         </span>
         
         {status === 'playing' && currentQuestion ? (
           <Button icon={Eye} onClick={onShowAnswer} variant="secondary">Revelar Respuesta</Button>
         ) : !currentQuestion || (questionIndex + 1 < questionTotal) ? (
           <Button icon={ArrowRight} onClick={onNextQuestion}>
             {!currentQuestion ? "Lanzar 1ra Pregunta" : "Siguiente Pregunta"}
           </Button>
         ) : (
           <Button icon={Flag} onClick={onFinishGame} className="bg-green-500 hover:bg-green-600 text-white">Finalizar Partida</Button>
         )}
       </div>

       <Card className="text-center p-8 md:p-14 mb-8 shadow-xl border-border">
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {currentQuestion?.text || "Presiona 'Lanzar 1ra Pregunta' para comenzar el reto."}
          </h2>
       </Card>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentQuestion?.options.map((opt, i) => {
            const isCorrect = useGameStore.getState().correctOptions.includes(opt.id);
            const isRevealed = status === 'revealed';
            let opacity = 'opacity-100';
            if (isRevealed && !isCorrect) opacity = 'opacity-30';

            return (
              <div key={opt.id} className={`flex items-center min-h-[80px] rounded-2xl ${optionColors[i%4]} ${opacity} transition-all duration-300 shadow-md p-4`}>
                 <span className="text-white font-bold text-2xl">{opt.content}</span>
              </div>
            );
          })}
       </div>

       {status === 'revealed' && (
         <Card className="mt-8">
           <CardHeader><CardTitle>Top 5 Parcial</CardTitle></CardHeader>
           <CardContent className="space-y-2">
             {players.slice(0,5).map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-surface border rounded-xl p-3">
                  <span className="font-bold text-lg">{i+1}. {p.username}</span>
                  <span className="font-bold text-primary">{p.score} pts</span>
                </div>
             ))}
           </CardContent>
         </Card>
       )}
    </div>
  );
};
