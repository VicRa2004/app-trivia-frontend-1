import { useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import {
  PlusCircle,
  Loader2,
  Play,
  Users,
  Send,
  Lock,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useQuizzesQuery,
  useMyQuizzesQuery,
  useDeleteQuizMutation,
} from "../features/quizzes/hooks/useQuizzesHooks";
import { useNavigate } from "react-router-dom";
import type { Quiz } from "../features/quizzes/types";
import { useCreateGameSessionMutation } from "../features/game/hooks/useGameApiHooks";
import { useGameStore } from "../features/game/store/useGameStore";
import { AiGenerateQuizModal } from "../components/AiGenerateQuizModal";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Paginación
  const [myPage, setMyPage] = useState(1);
  const [publicPage, setPublicPage] = useState(1);

  const myQuizzesRef = useRef<HTMLDivElement>(null);
  const publicQuizzesRef = useRef<HTMLDivElement>(null);

  const handleMyPageChange = (page: number) => {
    setMyPage(page);
    setTimeout(() => {
      myQuizzesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handlePublicPageChange = (page: number) => {
    setPublicPage(page);
    setTimeout(() => {
      publicQuizzesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const {
    data: myData,
    isLoading: isMyLoading,
    isError: isMyError,
  } = useMyQuizzesQuery(myPage, 6);
  const {
    data: publicData,
    isLoading: isPublicLoading,
    isError: isPublicError,
  } = useQuizzesQuery(publicPage, 6);
  const { mutate: createGame, isPending } = useCreateGameSessionMutation();
  const deleteMutation = useDeleteQuizMutation();
  const resetGame = useGameStore((state) => state.resetGame);
  const [pinInput, setPinInput] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().length > 0) {
      resetGame();
      navigate(`/game/${pinInput.trim()}`);
    }
  };

  const handleDeleteQuiz = (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    if (
      confirm(
        "¿Estás seguro de eliminar este quiz? Esta acción no se puede deshacer.",
      )
    ) {
      deleteMutation.mutate(quizId);
    }
  };

  const myQuizzes = myData?.data || [];
  const myMeta = myData?.meta;
  const myTotalPages = myMeta ? myMeta.lastPage : 0;

  const publicQuizzes = publicData?.data || [];
  const publicMeta = publicData?.meta;
  const publicTotalPages = publicMeta ? publicMeta.lastPage : 0;

  const renderQuizCard = (q: Quiz, isMine: boolean) => (
    <Card
      key={q.id}
      className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 shadow-sm border-border flex flex-col"
    >
      <div className="h-40 bg-primary-light/30 w-full relative flex items-center justify-center overflow-hidden shrink-0">
        {q.thumbnailUrl ? (
          <img
            src={q.thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="font-bold text-5xl text-primary/20">
            {q.title.charAt(0)}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-text-main shadow-sm flex items-center gap-1">
          {q.isPublic ? (
            <>
              <Users className="w-3 h-3" /> Público
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" /> Privado
            </>
          )}
        </div>
        {!isMine && q.creator && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium max-w-[80%] truncate">
            Por: {q.creator?.username}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 relative flex-1">
        <span className="text-xs font-bold text-primary bg-primary-light/50 w-fit px-2 py-1 rounded-md">
          {q.category?.name || "Varios"}
        </span>
        <h3 className="font-extrabold text-xl line-clamp-1">{q.title}</h3>
        <p className="text-sm text-text-muted line-clamp-2 mb-4 h-10">
          {q.description}
        </p>

        <div className="flex gap-2 mt-auto">
          <Button
            icon={Play}
            className="flex-1 text-sm h-10 shadow-primary-light shadow-md"
            onClick={() => {
              createGame(q.id, {
                onError: (err: unknown) => {
                  let msg =
                    "Error del servidor: Posiblemente el Quiz no tiene preguntas.";
                  const e = err as {
                    response?: { data?: { message?: string } };
                  };
                  if (e?.response?.data?.message) {
                    msg = String(e.response.data.message);
                  }
                  alert(msg);
                },
              });
            }}
            disabled={isPending}
          >
            Iniciar Partida
          </Button>
          {isMine && (
            <>
              <Button
                variant="outline"
                className="px-4 text-sm h-10 border-border text-text-muted hover:text-red-500 shrink-0 flex items-center justify-center"
                onClick={(e) => handleDeleteQuiz(e, q.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="px-4 text-sm h-10 border-border text-text-muted hover:text-primary shrink-0 flex items-center justify-center"
                onClick={() => navigate(`/dashboard/quiz/${q.id}/edit`)}
              >
                Editar
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-10 w-full animate-in fade-in duration-300 pb-12">
        {/* Unirse a Juego Rápido */}
        <Card className="bg-primary text-white border-0 shadow-xl shadow-primary/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
              ¿Tienes un PIN de juego?
            </h2>
            <p className="text-white/80 font-medium">
              Ingresa el código que te dio el presentador para unirte.
            </p>
          </div>
          <form
            onSubmit={handleJoinGame}
            className="flex w-full md:w-auto gap-2"
          >
            <input
              type="text"
              placeholder="Ej. 123456"
              className="px-6 py-4 rounded-2xl text-center font-extrabold text-2xl text-text-main bg-surface border border-border outline-none w-full md:w-48 placeholder:text-text-muted/50 focus:ring-4 focus:ring-primary/50 transition-all uppercase"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-auto px-6"
              icon={Send}
            >
              Entrar
            </Button>
          </form>
        </Card>

        {/* Sección: Mis Quizzes */}
        <section ref={myQuizzesRef}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
                Mis Quizzes
              </h1>
              <p className="text-text-muted mt-1 font-medium text-lg">
                Administra tus juegos y reta a tus amigos.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                icon={Sparkles}
                className="w-full sm:w-auto text-lg shadow-primary-light/50 shadow-lg bg-linear-to-r from-primary to-purple-600 border-0 text-white"
                onClick={() => setIsAiModalOpen(true)}
              >
                Crear con IA
              </Button>
              <Button
                variant="outline"
                icon={PlusCircle}
                className="w-full sm:w-auto text-lg border-border hover:bg-primary-light text-text-main"
                onClick={() => navigate("/dashboard/create-quiz")}
              >
                Crear Nuevo Quiz
              </Button>
            </div>
          </div>

          {isMyLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : isMyError ? (
            <Card className="flex flex-col items-center justify-center p-12 bg-red-50/50 border-red-100">
              <h2 className="text-xl font-bold text-red-700">
                Parece que hubo un error
              </h2>
              <p className="text-red-500 mt-2 text-center">
                No pudimos cargar tus trivias.
              </p>
            </Card>
          ) : myQuizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 border-dashed border-2 border-border bg-transparent shadow-none">
              <div className="w-20 h-20 rounded-full bg-primary-light mb-4 flex items-center justify-center">
                <PlusCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-text-main">
                No tienes Quizzes
              </h2>
              <p className="text-text-muted mt-2 mb-6 text-center max-w-sm">
                Empieza por crear algunas preguntas para tus amigos o
                estudiantes.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/create-quiz")}
              >
                Comenzar Ahora
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myQuizzes.map((q: Quiz) => renderQuizCard(q, true))}
              </div>
              
              {/* Controles de Paginación Mis Quizzes */}
              {myTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 animate-in fade-in duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={ChevronLeft}
                    onClick={() => handleMyPageChange(Math.max(1, myPage - 1))}
                    disabled={myPage === 1}
                    className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1.5 mx-2">
                    {Array.from({ length: myTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleMyPageChange(page)}
                        className={`w-9 h-9 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                          myPage === page
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
                    onClick={() => handleMyPageChange(Math.min(myTotalPages, myPage + 1))}
                    disabled={myPage === myTotalPages}
                    className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                  >
                    <span className="flex items-center gap-1">
                      Siguiente <ChevronRight size={14} className="ml-1" />
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Sección: Quizzes Públicos */}
        <section ref={publicQuizzesRef}>
          <div className="flex flex-col mb-6">
            <h2 className="text-3xl font-extrabold text-text-main tracking-tight">
              Quizzes Públicos
            </h2>
            <p className="text-text-muted mt-1 font-medium text-lg">
              Explora y juega trivias creadas por la comunidad.
            </p>
          </div>

          {isPublicLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : isPublicError ? (
            <Card className="flex flex-col items-center justify-center p-12 bg-red-50/50 border-red-100">
              <h2 className="text-xl font-bold text-red-700">
                Parece que hubo un error
              </h2>
              <p className="text-red-500 mt-2 text-center">
                No pudimos cargar las trivias públicas.
              </p>
            </Card>
          ) : publicQuizzes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 border-dashed border-2 border-border bg-transparent shadow-none">
              <h2 className="text-xl font-bold text-text-main">
                Aún no hay Quizzes Públicos
              </h2>
              <p className="text-text-muted mt-2 text-center max-w-sm">
                ¡Sé el primero en crear uno y compartirlo con todos!
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicQuizzes.map((q: Quiz) => renderQuizCard(q, false))}
              </div>

              {/* Controles de Paginación Quizzes Públicos */}
              {publicTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 animate-in fade-in duration-200">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={ChevronLeft}
                    onClick={() => handlePublicPageChange(Math.max(1, publicPage - 1))}
                    disabled={publicPage === 1}
                    className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1.5 mx-2">
                    {Array.from({ length: publicTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePublicPageChange(page)}
                        className={`w-9 h-9 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                          publicPage === page
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
                    onClick={() => handlePublicPageChange(Math.min(publicTotalPages, publicPage + 1))}
                    disabled={publicPage === publicTotalPages}
                    className="px-3 border-border hover:bg-primary-light hover:text-primary active:scale-95 transition-all duration-200"
                  >
                    <span className="flex items-center gap-1">
                      Siguiente <ChevronRight size={14} className="ml-1" />
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <AiGenerateQuizModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </Layout>
  );
};

export default Dashboard;
