import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { PlusCircle, Loader2, Play, Users, Send } from 'lucide-react';
import { useQuizzesQuery } from '../features/quizzes/hooks/useQuizzesHooks';
import { useNavigate } from 'react-router-dom';
import type { Quiz } from '../features/quizzes/types';
import { useCreateGameSessionMutation } from '../features/game/hooks/useGameApiHooks';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuizzesQuery(1, 10);
  const { mutate: createGame, isPending } = useCreateGameSessionMutation();
  const [pinInput, setPinInput] = useState('');

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length > 0) {
      navigate(`/game/${pinInput.trim()}`);
    }
  };

  const quizzes = data?.data || [];

  return (
    <Layout>
      <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
        
        {/* Unirse a Juego Rápido */}
        <Card className="bg-primary text-white border-0 shadow-xl shadow-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">¿Tienes un PIN de juego?</h2>
            <p className="text-white/80 font-medium">Ingresa el código que te dio el presentador para unirte.</p>
          </div>
          <form onSubmit={handleJoinGame} className="flex w-full md:w-auto gap-2">
            <input 
              type="text" 
              placeholder="Ej. 123456" 
              className="px-6 py-4 rounded-2xl text-center font-extrabold text-2xl text-primary bg-white outline-none w-full md:w-48 placeholder:text-text-muted/50 focus:ring-4 focus:ring-white/50 transition-all uppercase"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              required
            />
            <Button type="submit" variant="secondary" className="h-auto px-6" icon={Send}>
              Entrar
            </Button>
          </form>
        </Card>

        {/* Encabezado Mis Quizzes */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Mis Quizzes</h1>
            <p className="text-text-muted mt-1 font-medium text-lg">Administra tus juegos y reta a tus amigos.</p>
          </div>
          <Button 
            icon={PlusCircle} 
            className="w-full md:w-auto text-lg shadow-primary-light/50 shadow-lg"
            onClick={() => navigate('/dashboard/create-quiz')}
          >
            Crear Nuevo Quiz
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <Card className="flex flex-col items-center justify-center p-12 bg-red-50/50 border-red-100">
             <h2 className="text-xl font-bold text-red-700">Parece que hubo un error</h2>
             <p className="text-red-500 mt-2 text-center">No pudimos contactar al servidor para cargar tus trivias.</p>
          </Card>
        ) : quizzes.length === 0 ? (
          /* Zona Vacía */
          <Card className="flex flex-col items-center justify-center p-12 mt-6 border-dashed border-2 border-border bg-transparent shadow-none">
            <div className="w-20 h-20 rounded-full bg-primary-light mb-4 flex items-center justify-center">
              <PlusCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-text-main">No tienes Quizzes</h2>
            <p className="text-text-muted mt-2 mb-6 text-center max-w-sm">
              Empieza por crear algunas preguntas para tus amigos o estudiantes.
            </p>
            <Button variant="outline" onClick={() => navigate('/dashboard/create-quiz')}>
              Comenzar Ahora
            </Button>
          </Card>
        ) : (
          /* Lista Rendereada Completa */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {quizzes.map((q: Quiz) => (
                <Card key={q.id} className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm border-border">
                  <div className="h-40 bg-primary-light/30 w-full relative flex items-center justify-center overflow-hidden">
                     {q.thumbnailUrl ? (
                         <img src={q.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                     ) : (
                         <div className="font-bold text-5xl text-primary/20">{q.title.charAt(0)}</div>
                     )}
                     <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-text-main shadow-sm flex items-center gap-1">
                        <Users className="w-3 h-3" /> Público
                     </div>
                  </div>
                  <div className="p-5 flex flex-col gap-2 relative">
                     <span className="text-xs font-bold text-primary bg-primary-light/50 w-fit px-2 py-1 rounded-md">
                        {q.category?.name || 'Varios'}
                     </span>
                     <h3 className="font-extrabold text-xl line-clamp-1">{q.title}</h3>
                     <p className="text-sm text-text-muted line-clamp-2 mb-4 h-10">
                        {q.description}
                     </p>
                     
                     <div className="flex gap-2">
                         <Button 
                           icon={Play} 
                           className="flex-1 text-sm h-10 shadow-primary-light shadow-md"
                           onClick={() => {
                             createGame(q.id, {
                               onError: (err: unknown) => {
                                 let msg = 'Error del servidor: Posiblemente el Quiz no tiene preguntas.';
                                 const e = err as { response?: { data?: { message?: string } } };
                                 if (e?.response?.data?.message) {
                                   msg = String(e.response.data.message);
                                 }
                                 alert(msg);
                               }
                             })
                           }}
                           disabled={isPending}
                         >
                           Iniciar Partida
                         </Button>
                         <Button 
                           variant="outline" 
                           className="px-4 text-sm h-10 border-border text-text-muted hover:text-primary"
                           onClick={() => navigate(`/dashboard/quiz/${q.id}/edit`)}
                         >
                           Editar
                         </Button>
                     </div>
                  </div>
                </Card>
             ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
