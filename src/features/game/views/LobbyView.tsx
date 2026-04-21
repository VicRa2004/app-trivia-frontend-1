import { useGameStore } from '../store/useGameStore';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Users, Play, User } from 'lucide-react';

export const LobbyView = ({ onStart }: { onStart: () => void }) => {
  const { gamePin, players, isHost } = useGameStore();

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto min-h-[80vh] animate-in slide-in-from-bottom-8">
      <Card className="w-full text-center border-4 border-primary p-8 md:p-12 mb-8 bg-surface shadow-2xl shadow-primary-light/50">
        <h2 className="text-xl md:text-2xl font-bold text-text-muted mb-2 uppercase tracking-widest">PIN de Juego</h2>
        <div className="text-6xl md:text-9xl font-extrabold text-primary tracking-widest">{gamePin}</div>
      </Card>

      <div className="w-full flex justify-between items-end mb-4 px-2">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-primary"/> Jugadores: {players.length}
        </h3>
        {isHost && (
           <Button icon={Play} size="lg" onClick={onStart} className="text-xl font-bold shadow-xl shadow-primary/30">
             ¡Comenzar!
           </Button>
        )}
      </div>

      <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {players.map((p, i) => (
          <div
            key={i}
            className="bg-primary hover:bg-primary-hover hover:-translate-y-1 transition text-white px-4 py-4 rounded-2xl font-bold text-center shadow-md flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 shadow-inner">
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <span className="text-sm truncate w-full">{p.username}</span>
          </div>
        ))}
        {players.length === 0 && (
           <div className="col-span-full py-10 text-center text-text-muted font-medium bg-surface rounded-2xl border-2 border-dashed border-border">
             Esperando a que se unan los jugadores...
           </div>
        )}
      </div>
    </div>
  );
};
