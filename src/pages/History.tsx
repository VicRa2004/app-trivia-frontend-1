import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useGameHistoryQuery } from '../features/game/hooks/useGameApiHooks';
import { 
  Loader2, 
  Calendar, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Play, 
  Award,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const navigate = useNavigate();
  const { data: historyData, isLoading, isError } = useGameHistoryQuery();
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getPodiumBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'; // Oro
      case 1:
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700'; // Plata
      case 2:
        return 'bg-amber-600/10 text-amber-800 border-amber-600/30 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50'; // Bronce
      default:
        return 'bg-surface text-text-muted border-border';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300 pb-12">
        {/* Cabecera */}
        <div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Historial de Partidas</h1>
          <p className="text-text-muted mt-1 font-medium text-lg">
            Revisa los resultados y puntajes de las salas que has creado y dirigido.
          </p>
        </div>

        {/* Contenido Principal */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <Card className="flex flex-col items-center justify-center p-12 bg-red-50/50 border-red-100 dark:bg-red-950/10 dark:border-red-950/30">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Error al cargar el historial</h2>
            <p className="text-red-500 dark:text-red-400/80 mt-2 text-center">
              No pudimos cargar tus registros. Por favor, intenta de nuevo más tarde.
            </p>
          </Card>
        ) : !historyData || historyData.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-16 border-dashed border-2 border-border bg-transparent shadow-none">
            <div className="w-20 h-20 rounded-full bg-primary-light/50 mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text-main">Ninguna partida registrada</h2>
            <p className="text-text-muted mt-2 mb-8 text-center max-w-md text-base">
              Las partidas que crees y finalices con tus amigos se guardarán de forma automática aquí para que puedas ver los puntajes.
            </p>
            <Button icon={Play} onClick={() => navigate('/dashboard')}>
              Iniciar mi primer juego
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {historyData.map((session) => {
              const isExpanded = !!expandedSessions[session.id];
              const playerCount = session.attempts?.length || 0;
              const topAttempts = session.attempts || [];

              return (
                <Card 
                  key={session.id} 
                  className="overflow-hidden border-border hover:shadow-md transition-shadow duration-300 flex flex-col p-0"
                >
                  {/* Encabezado de la partida */}
                  <div 
                    onClick={() => toggleSession(session.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-primary-light/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Miniatura / Thumbnail */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center overflow-hidden shrink-0 border border-primary/20 shadow-sm">
                        {session.quiz.thumbnailUrl ? (
                          <img 
                            src={session.quiz.thumbnailUrl} 
                            alt={session.quiz.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-extrabold text-2xl text-white">
                            {session.quiz.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <h3 className="font-extrabold text-xl text-text-main line-clamp-1 leading-snug">
                          {session.quiz.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                            {formatDate(session.createdAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-primary" />
                            {playerCount === 1 ? '1 jugador' : `${playerCount} jugadores`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                      <div className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light font-bold text-xs px-3 py-1.5 rounded-full">
                        <Award className="w-3.5 h-3.5" />
                        Finalizada
                      </div>
                      <button 
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors focus:outline-none"
                        aria-label="Expandir resultados"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalle desplegable con tabla de posiciones / podio */}
                  {isExpanded && (
                    <div className="border-t border-border bg-primary-light/5 dark:bg-slate-900/20 px-5 py-4 animate-in slide-in-from-top-2 duration-200">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-extrabold tracking-wider text-text-muted uppercase">
                          Resultados y Tabla de Posiciones
                        </span>
                      </div>

                      {topAttempts.length === 0 ? (
                        <p className="text-sm text-text-muted py-2 italic">
                          No hubo participantes registrados en esta partida.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {topAttempts.map((attempt, index) => {
                            const isPodium = index < 3;
                            return (
                              <div 
                                key={attempt.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface shadow-sm hover:translate-x-0.5 transition-transform duration-200"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Puesto */}
                                  <div className={`w-8 h-8 rounded-lg font-extrabold text-sm border flex items-center justify-center shrink-0 ${getPodiumBadgeColor(index)}`}>
                                    {isPodium ? (
                                      <Trophy className="w-4 h-4" />
                                    ) : (
                                      index + 1
                                    )}
                                  </div>
                                  <span className="font-bold text-text-main text-base">
                                    {attempt.user.username}
                                  </span>
                                </div>
                                
                                <div className="text-right">
                                  <span className="font-extrabold text-primary text-base">
                                    {attempt.totalScore}
                                  </span>
                                  <span className="text-xs text-text-muted font-medium ml-1">
                                    pts
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
