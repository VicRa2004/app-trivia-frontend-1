import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useGameHistoryQuery } from '../features/game/hooks/useGameApiHooks';
import type { HistoryResponse } from '../features/game/api/game.api';

const isUuid = (val: string) => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(val);
};

const getResponseTooltip = (response: HistoryResponse | undefined) => {
  if (!response) return 'Sin respuesta';
  const timeSec = response.responseTimeMs !== null && response.responseTimeMs !== undefined 
    ? (response.responseTimeMs / 1000).toFixed(1) 
    : '0.0';
  const statusText = response.isCorrect ? 'Correcta' : 'Incorrecta';
  
  if (!response.givenAnswer) {
    return `Sin respuesta (${statusText}, ${timeSec}s)`;
  }

  if (isUuid(response.givenAnswer)) {
    return `Respuesta: ${statusText} (${timeSec}s)`;
  }

  return `Respuesta: "${response.givenAnswer}" (${statusText}, ${timeSec}s)`;
};

import { 
  Loader2, 
  Calendar, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Play, 
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
  Search
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

interface SessionMetrics {
  playerCount: number;
  overallAccuracy: number;
  averageTimeSec: number;
  hardestQuestion: {
    label: string;
    accuracy: number;
    text: string;
  } | null;
}

const calculateSessionMetrics = (session: any): SessionMetrics => {
  const playerCount = session.attempts?.length || 0;
  let totalResponses = 0;
  let correctResponses = 0;
  let totalTimeMs = 0;
  let timeCount = 0;

  const questionCorrectCounts: Record<string, number> = {};
  const questionTotalCounts: Record<string, number> = {};

  session.attempts?.forEach((attempt: any) => {
    attempt.responses?.forEach((resp: any) => {
      totalResponses++;
      if (resp.isCorrect) {
        correctResponses++;
      }
      if (resp.responseTimeMs !== null && resp.responseTimeMs !== undefined) {
        totalTimeMs += resp.responseTimeMs;
        timeCount++;
      }

      const qId = resp.questionId;
      questionTotalCounts[qId] = (questionTotalCounts[qId] || 0) + 1;
      if (resp.isCorrect) {
        questionCorrectCounts[qId] = (questionCorrectCounts[qId] || 0) + 1;
      }
    });
  });

  const overallAccuracy = totalResponses > 0 
    ? Math.round((correctResponses / totalResponses) * 100) 
    : 0;

  const averageTimeSec = timeCount > 0 
    ? parseFloat((totalTimeMs / timeCount / 1000).toFixed(1)) 
    : 0;

  let hardestQ: { label: string; accuracy: number; text: string; } | null = null;
  let minAccuracy = 1.1;

  session.quiz?.questions?.forEach((q: any, idx: number) => {
    const total = questionTotalCounts[q.id] || 0;
    const correct = questionCorrectCounts[q.id] || 0;
    const accuracyRate = total > 0 ? correct / total : 0;

    if (accuracyRate < minAccuracy) {
      minAccuracy = accuracyRate;
      hardestQ = {
        label: `P${idx + 1}`,
        accuracy: Math.round(accuracyRate * 100),
        text: q.questionText,
      };
    }
  });

  return {
    playerCount,
    overallAccuracy,
    averageTimeSec,
    hardestQuestion: hardestQ,
  };
};

const History = () => {
  const navigate = useNavigate();
  const { data: historyData, isLoading, isError } = useGameHistoryQuery();
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'podium' | 'questions' | 'matrix'>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const handleTabChange = (sessionId: string, tab: 'podium' | 'questions' | 'matrix') => {
    setActiveTabs(prev => ({ ...prev, [sessionId]: tab }));
  };

  const handleSearchChange = (sessionId: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [sessionId]: query }));
  };

  const toggleQuestion = (sessionId: string, questionId: string) => {
    const key = `${sessionId}-${questionId}`;
    setExpandedQuestions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Paginación del lado del cliente
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const historyList = historyData || [];
  const totalPages = Math.ceil(historyList.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSessions = historyList.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedSessions({}); // Cerrar expansores al cambiar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {currentSessions.map((session) => {
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

                  {/* Detalle desplegable con panel de pestañas y métricas */}
                  {isExpanded && (() => {
                    const metrics = calculateSessionMetrics(session);
                    const currentTab = activeTabs[session.id] || 'podium';
                    const searchQuery = searchQueries[session.id] || '';
                    const filteredAttempts = topAttempts.filter(attempt => 
                      attempt.user.username.toLowerCase().includes(searchQuery.toLowerCase())
                    );

                    return (
                      <div className="border-t border-border bg-primary-light/5 dark:bg-slate-900/20 px-5 py-5 animate-in slide-in-from-top-2 duration-200">
                        {/* Fila de Métricas Rápidas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                          <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-primary" /> Jugadores
                            </span>
                            <span className="text-lg font-black text-text-main mt-0.5">{metrics.playerCount}</span>
                          </div>
                          
                          <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                              <Target className="w-3.5 h-3.5 text-emerald-500" /> Precisión Promedio
                            </span>
                            <span className="text-lg font-black text-emerald-500 mt-0.5">{metrics.overallAccuracy}%</span>
                          </div>

                          <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-center shadow-sm">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary" /> Tiempo de Respuesta
                            </span>
                            <span className="text-lg font-black text-primary dark:text-primary-light mt-0.5">{metrics.averageTimeSec}s</span>
                          </div>

                          <div className="p-3 bg-surface border border-border rounded-xl flex flex-col justify-center shadow-sm" title={metrics.hardestQuestion?.text || ''}>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Pregunta más Difícil
                            </span>
                            <span className="text-xs font-black text-rose-500 mt-0.5 truncate max-w-full">
                              {metrics.hardestQuestion ? `${metrics.hardestQuestion.label} (${metrics.hardestQuestion.accuracy}% acierto)` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Switcher de Pestañas */}
                        <div className="flex border-b border-border mb-5 gap-6">
                          <button
                            onClick={() => handleTabChange(session.id, 'podium')}
                            className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                              currentTab === 'podium' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                          >
                            🏆 Podio
                          </button>
                          <button
                            onClick={() => handleTabChange(session.id, 'questions')}
                            className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                              currentTab === 'questions' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                          >
                            📊 Preguntas
                          </button>
                          <button
                            onClick={() => handleTabChange(session.id, 'matrix')}
                            className={`pb-2 text-xs font-extrabold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                              currentTab === 'matrix' 
                                ? 'border-primary text-primary' 
                                : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                          >
                            🎛️ Matriz
                          </button>
                        </div>

                        {topAttempts.length === 0 ? (
                          <p className="text-sm text-text-muted py-2 italic">
                            No hubo participantes registrados en esta partida.
                          </p>
                        ) : (
                          <div>
                            {/* Pestaña: Podio */}
                            {currentTab === 'podium' && (
                              <div className="animate-in fade-in duration-300">
                                {/* Podium Block Row */}
                                <div className="flex items-end justify-center gap-3 sm:gap-6 my-6 pt-4 max-w-md mx-auto">
                                  {/* 2nd Place */}
                                  {topAttempts[1] && (
                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                      <div className="text-center mb-2">
                                        <p className="font-extrabold text-xs text-text-main truncate max-w-[80px]" title={topAttempts[1].user.username}>
                                          {topAttempts[1].user.username}
                                        </p>
                                        <p className="text-[10px] text-text-muted font-bold">{topAttempts[1].totalScore} pts</p>
                                      </div>
                                      <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/60 border border-slate-300 dark:border-slate-700 rounded-t-xl h-20 flex flex-col items-center justify-center shadow-inner relative group hover:scale-105 transition-transform duration-200">
                                        <span className="absolute -top-3.5 bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200 w-7 h-7 rounded-full border-2 border-surface flex items-center justify-center text-xs font-black shadow">
                                          2
                                        </span>
                                        <Trophy className="w-6 h-6 text-slate-400 mt-2" />
                                      </div>
                                    </div>
                                  )}

                                  {/* 1st Place */}
                                  {topAttempts[0] && (
                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                      <div className="text-center mb-2">
                                        <p className="font-black text-sm text-text-main truncate max-w-[90px]" title={topAttempts[0].user.username}>
                                          {topAttempts[0].user.username}
                                        </p>
                                        <p className="text-xs text-primary font-black">{topAttempts[0].totalScore} pts</p>
                                      </div>
                                      <div className="w-full bg-gradient-to-t from-yellow-400 to-amber-300 dark:from-yellow-500/20 dark:to-amber-500/10 border-2 border-yellow-400 dark:border-yellow-500/40 rounded-t-xl h-28 flex flex-col items-center justify-center shadow-md relative group hover:scale-105 transition-transform duration-200">
                                        <span className="absolute -top-4 bg-yellow-400 text-yellow-950 w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-xs font-black shadow shadow-yellow-400/30 animate-bounce">
                                          1
                                        </span>
                                        <Trophy className="w-8 h-8 text-yellow-500 mt-2" />
                                      </div>
                                    </div>
                                  )}

                                  {/* 3rd Place */}
                                  {topAttempts[2] && (
                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                      <div className="text-center mb-2">
                                        <p className="font-extrabold text-xs text-text-main truncate max-w-[80px]" title={topAttempts[2].user.username}>
                                          {topAttempts[2].user.username}
                                        </p>
                                        <p className="text-[10px] text-text-muted font-bold">{topAttempts[2].totalScore} pts</p>
                                      </div>
                                      <div className="w-full bg-gradient-to-t from-amber-600/20 to-amber-700/10 dark:from-amber-900/30 dark:to-amber-800/10 border border-amber-600/30 dark:border-amber-900/40 rounded-t-xl h-16 flex flex-col items-center justify-center shadow-inner relative group hover:scale-105 transition-transform duration-200">
                                        <span className="absolute -top-3.5 bg-amber-600 text-amber-50 dark:bg-amber-800 dark:text-amber-100 w-7 h-7 rounded-full border-2 border-surface flex items-center justify-center text-xs font-black shadow">
                                          3
                                        </span>
                                        <Trophy className="w-5 h-5 text-amber-600 mt-2" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Listado de Posiciones */}
                                <div className="mt-6 flex flex-col gap-2.5 max-w-md mx-auto">
                                  {topAttempts.map((attempt, index) => {
                                    const isPodium = index < 3;
                                    return (
                                      <div 
                                        key={attempt.id}
                                        className={`flex items-center justify-between p-3 rounded-xl border border-border bg-surface shadow-sm transition-transform duration-200 hover:translate-x-1 ${
                                          isPodium ? 'border-primary/10 bg-primary-light/5' : ''
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className={`w-7 h-7 rounded-lg font-extrabold text-xs border flex items-center justify-center shrink-0 ${getPodiumBadgeColor(index)}`}>
                                            {isPodium ? <Trophy className="w-3.5 h-3.5" /> : index + 1}
                                          </div>
                                          <span className="font-bold text-text-main text-sm">
                                            {attempt.user.username}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <span className="font-extrabold text-primary text-sm">
                                            {attempt.totalScore}
                                          </span>
                                          <span className="text-[10px] text-text-muted font-medium ml-1">
                                            pts
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Pestaña: Preguntas */}
                            {currentTab === 'questions' && (
                              <div className="animate-in fade-in duration-300 flex flex-col gap-3">
                                {session.quiz.questions.map((question, qIdx) => {
                                  let correctCount = 0;
                                  let incorrectCount = 0;
                                  let unansCount = 0;
                                  const responses: Array<{ username: string; response: HistoryResponse | undefined }> = [];

                                  topAttempts.forEach((attempt) => {
                                    const r = attempt.responses?.find((resp) => resp.questionId === question.id);
                                    responses.push({
                                      username: attempt.user.username,
                                      response: r,
                                    });

                                    if (!r) {
                                      unansCount++;
                                    } else if (r.isCorrect) {
                                      correctCount++;
                                    } else {
                                      incorrectCount++;
                                    }
                                  });

                                  const totalCount = playerCount;
                                  const correctPct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
                                  const incorrectPct = totalCount > 0 ? Math.round((incorrectCount / totalCount) * 100) : 0;
                                  const unansPct = totalCount > 0 ? Math.round((unansCount / totalCount) * 100) : 0;

                                  const questionKey = `${session.id}-${question.id}`;
                                  const isQuestionExpanded = !!expandedQuestions[questionKey];

                                  return (
                                    <div key={question.id} className="border border-border rounded-xl bg-surface overflow-hidden shadow-sm transition-all duration-300">
                                      <div 
                                        onClick={() => toggleQuestion(session.id, question.id)}
                                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-primary-light/10 dark:hover:bg-slate-800/40 transition-colors"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                              P{qIdx + 1}
                                            </span>
                                            <span className="text-text-muted text-[10px] font-bold">
                                              {question.questionType === 'multiple' ? 'Opción Múltiple' : 'Verdadero/Falso'}
                                            </span>
                                          </div>
                                          <h4 className="font-extrabold text-sm text-text-main line-clamp-2 leading-snug">
                                            {question.questionText}
                                          </h4>
                                        </div>

                                        <div className="flex flex-col gap-1.5 w-full sm:w-[160px] shrink-0">
                                          <div className="flex items-center justify-between text-[10px] font-extrabold text-text-muted">
                                            <span className="text-emerald-500 font-extrabold">{correctPct}% acierto</span>
                                            <span>{correctCount}/{totalCount} jug.</span>
                                          </div>
                                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${correctPct}%` }} />
                                            <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${incorrectPct}%` }} />
                                            <div className="bg-slate-300 dark:bg-slate-600 h-full transition-all duration-500" style={{ width: `${unansPct}%` }} />
                                          </div>
                                        </div>
                                      </div>

                                      {isQuestionExpanded && (
                                        <div className="border-t border-border bg-slate-50/50 dark:bg-slate-900/10 p-3.5">
                                          <h5 className="text-[10px] font-extrabold tracking-wider text-text-muted uppercase mb-2">
                                            Respuestas de los participantes:
                                          </h5>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                            {responses.map((item, idx) => {
                                              let statusColor = 'border-slate-200 dark:border-slate-800 text-text-muted bg-slate-50 dark:bg-slate-800/20';
                                              let answerText = 'Sin respuesta';

                                              if (item.response) {
                                                const timeSec = item.response.responseTimeMs !== null && item.response.responseTimeMs !== undefined 
                                                  ? (item.response.responseTimeMs / 1000).toFixed(1) 
                                                  : '0.0';

                                                if (item.response.isCorrect) {
                                                  statusColor = 'border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400';
                                                } else {
                                                  statusColor = 'border-rose-100 dark:border-rose-950/20 bg-rose-50/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400';
                                                }

                                                if (item.response.givenAnswer) {
                                                  answerText = isUuid(item.response.givenAnswer) 
                                                    ? (item.response.isCorrect ? 'Correcta' : 'Incorrecta') 
                                                    : `"${item.response.givenAnswer}"`;
                                                }
                                                answerText += ` (${timeSec}s)`;
                                              }

                                              return (
                                                <div 
                                                  key={idx} 
                                                  className={`p-2 rounded-lg border flex items-center justify-between text-xs font-semibold ${statusColor}`}
                                                >
                                                  <span className="font-bold text-text-main truncate max-w-[100px]" title={item.username}>
                                                    {item.username}
                                                  </span>
                                                  <span className="text-[11px] truncate max-w-[140px] ml-2" title={answerText}>
                                                    {answerText}
                                                  </span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Pestaña: Matriz */}
                            {currentTab === 'matrix' && (
                              <div className="animate-in fade-in duration-300 flex flex-col gap-3">
                                {/* Barra de búsqueda */}
                                <div className="flex items-center gap-2 max-w-sm relative">
                                  <Search className="w-4 h-4 text-text-muted absolute left-3" />
                                  <input
                                    type="text"
                                    placeholder="Buscar jugador..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(session.id, e.target.value)}
                                    className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-border text-xs bg-surface text-text-main placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold"
                                  />
                                  {searchQuery && (
                                    <button
                                      onClick={() => handleSearchChange(session.id, '')}
                                      className="absolute right-2.5 text-[10px] text-text-muted hover:text-primary font-bold cursor-pointer shrink-0"
                                    >
                                      Limpiar
                                    </button>
                                  )}
                                </div>

                                <div className="overflow-x-auto border border-border rounded-xl bg-surface shadow-sm max-w-full font-sans">
                                  <table className="w-full border-collapse text-left text-sm min-w-[500px]">
                                    <thead>
                                      <tr className="border-b border-border bg-primary-light/10 dark:bg-slate-800/40">
                                        <th className="p-3 font-extrabold text-text-main text-xs uppercase tracking-wider sticky left-0 bg-surface border-r border-border min-w-[140px] z-10">
                                          Jugador
                                        </th>
                                        <th className="p-3 font-extrabold text-text-main text-xs uppercase tracking-wider text-center border-r border-border min-w-[100px]">
                                          Puntos
                                        </th>
                                        {session.quiz.questions.map((question, qIdx) => (
                                          <th 
                                            key={question.id}
                                            title={question.questionText}
                                            className="p-3 font-extrabold text-text-main text-xs uppercase tracking-wider text-center cursor-help hover:bg-primary-light/20 dark:hover:bg-slate-800/60 transition-colors border-r border-border last:border-r-0 min-w-[60px]"
                                          >
                                            P{qIdx + 1}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {filteredAttempts.length === 0 ? (
                                        <tr>
                                          <td colSpan={2 + session.quiz.questions.length} className="p-8 text-center text-xs text-text-muted font-bold italic">
                                            No se encontraron jugadores que coincidan con "{searchQuery}".
                                          </td>
                                        </tr>
                                      ) : (
                                        filteredAttempts.map((attempt) => {
                                          const originalIndex = topAttempts.findIndex(a => a.id === attempt.id);
                                          const isPodium = originalIndex < 3;
                                          return (
                                            <tr 
                                              key={attempt.id} 
                                              className="hover:bg-primary-light/5 dark:hover:bg-slate-800/20 transition-colors"
                                            >
                                              <td className="p-3 sticky left-0 bg-surface border-r border-border z-10">
                                                <div className="flex items-center gap-2">
                                                  <div className={`w-6 h-6 rounded-md font-extrabold text-xs border flex items-center justify-center shrink-0 ${getPodiumBadgeColor(originalIndex)}`}>
                                                    {isPodium ? (
                                                      <Trophy className="w-3.5 h-3.5" />
                                                    ) : (
                                                      originalIndex + 1
                                                    )}
                                                  </div>
                                                  <span className="truncate max-w-[90px] font-bold text-text-main" title={attempt.user.username}>
                                                    {attempt.user.username}
                                                  </span>
                                                </div>
                                              </td>

                                              <td className="p-3 font-extrabold text-primary dark:text-primary-light text-center border-r border-border font-sans">
                                                {attempt.totalScore} <span className="text-[10px] text-text-muted font-normal">pts</span>
                                              </td>

                                              {session.quiz.questions.map((question) => {
                                                const response = attempt.responses.find(r => r.questionId === question.id);
                                                const tooltipText = getResponseTooltip(response);
                                                
                                                let bgColor = 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500';
                                                if (response) {
                                                  if (response.isCorrect) {
                                                    bgColor = 'bg-emerald-500 text-white';
                                                  } else {
                                                    bgColor = 'bg-rose-500 text-white';
                                                  }
                                                }

                                                return (
                                                  <td 
                                                    key={question.id}
                                                    className="p-2 text-center border-r border-border last:border-r-0"
                                                  >
                                                    <div 
                                                      title={tooltipText}
                                                      className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm cursor-help transition-all duration-200 hover:scale-110 ${bgColor}`}
                                                    >
                                                      {response ? (response.isCorrect ? '✓' : '✗') : '-'}
                                                    </div>
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Card>
              );
            })}

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 animate-in fade-in duration-200">
                <Button
                  size="sm"
                  variant="outline"
                  icon={ChevronLeft}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1.5 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                          : 'border border-border bg-surface text-text-muted hover:border-primary/30 hover:text-text-main'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                >
                  <span className="flex items-center gap-1">
                    Siguiente <ChevronRight size={14} className="ml-1" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
