import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';

export const PlayerView = ({ onSubmitAnswer }: { onSubmitAnswer: (id: string, ms: number) => void }) => {
  const { currentQuestion, playerScore, status, correctOptions } = useGameStore();
  
  const [interaction, setInteraction] = useState<{ qId?: string | null, optId: string | null, startedAt: number }>({
    qId: currentQuestion?.id,
    optId: null,
    startedAt: new Date().getTime(),
  });

  // Derivando estado directamente según la recomendación de React (sin useEffect cascades)
  if (currentQuestion?.id !== interaction.qId) {
    setInteraction({
      qId: currentQuestion?.id,
      optId: null,
      startedAt: new Date().getTime(),
    });
  }

  const selectedId = interaction.optId;

  const handleSelect = (id: string) => {
    if (selectedId || status !== 'playing') return;
    setInteraction(prev => ({ ...prev, optId: id }));
    
    const nowTs = new Date().getTime();
    onSubmitAnswer(id, nowTs - interaction.startedAt);
  };

  const optionColors = ['bg-[#e21b3c]', 'bg-[#1368ce]', 'bg-[#d89e00]', 'bg-[#26890c]']; // Estilo Kahoot! vibrante para los botones en celular

  if (status === 'revealed') {
    const isCorrect = correctOptions.includes(selectedId || '');
    return (
       <div className={`flex flex-col items-center justify-center min-h-[80vh] w-full text-white animate-in zoom-in duration-300 ${isCorrect ? 'bg-green-500' : 'bg-red-500'} rounded-3xl p-6 shadow-2xl`}>
          {isCorrect ? <CheckCircle2 className="w-32 h-32 mb-6" /> : <XCircle className="w-32 h-32 mb-6" />}
          <h1 className="text-5xl font-extrabold mb-4">{isCorrect ? '¡Correcto!' : 'Incorrecto'}</h1>
          <div className="flex items-center gap-2 text-2xl font-bold bg-white/20 px-6 py-2 rounded-full">
            <Trophy /> Puntuación Total: {playerScore}
          </div>
       </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[80vh] max-w-2xl mx-auto gap-4 animate-in fade-in">
       <div className="flex justify-between items-center bg-surface p-4 rounded-2xl shadow-sm border border-border">
          <div className="font-bold text-xl flex items-center gap-2 text-primary"><Trophy className="w-6 h-6"/> {playerScore}</div>
          <div className="font-bold text-sm bg-primary-light text-primary px-4 py-1.5 rounded-full">
            {selectedId ? 'Enviado, cargando...' : '¡Responde rápido!'}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mt-4">
          {currentQuestion?.options.map((opt, i) => (
            <button
               key={opt.id}
               disabled={!!selectedId}
               onClick={() => handleSelect(opt.id)}
               className={`w-full min-h-[140px] rounded-3xl shadow-lg transition-transform duration-200 ${optionColors[i % 4]} text-white text-2xl font-bold hover:brightness-110 active:scale-95 disabled:scale-100 ${selectedId === opt.id ? 'opacity-100 ring-4 ring-offset-4 ring-text-main' : selectedId ? 'opacity-40' : ''}`}
            >
               {opt.content}
            </button>
          ))}
       </div>
    </div>
  );
};
