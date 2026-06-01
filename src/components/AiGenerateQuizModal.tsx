import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, Wand2 } from "lucide-react";
import { useCategoriesQuery } from "../features/quizzes/hooks/useQuizzesHooks";
import { api } from "../api/axios";
import { Button } from "./Button";
import { Input } from "./Input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AiGenerateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Iniciando el motor de Inteligencia Artificial...",
  "Investigando datos e información clave del tema...",
  "Redactando preguntas interesantes y educativas...",
  "Diseñando las opciones de respuesta correcta e incorrectas...",
  "Escribiendo explicaciones detalladas para cada pregunta...",
  "Estructurando la trivia para que sea divertida de jugar...",
  "Guardando el cuestionario completo en la base de datos...",
  "¡Casi listo, afinando los últimos detalles!",
];

export const AiGenerateQuizModal = ({
  isOpen,
  onClose,
}: AiGenerateQuizModalProps) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Rotación de mensajes de carga
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      setErrorMsg("Por favor ingresa un tema.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");

    try {
      const response = await api.post("/ai/generate-quiz", {
        theme,
        numQuestions: Number(numQuestions),
        categoryId: categoryId || undefined,
      });

      const createdQuiz = response.data;

      toast.success("¡Trivia generada con IA exitosamente!");
      onClose();
      // Redirigir directamente a la página de edición del quiz generado
      navigate(`/dashboard/quiz/${createdQuiz.id}/edit`);
    } catch (err: any) {
      console.error("Error generating AI quiz:", err);
      const msg =
        err.response?.data?.message ||
        "Hubo un error al generar la trivia con IA. Por favor intenta de nuevo.";
      setErrorMsg(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={!isGenerating ? onClose : undefined}
      />

      {/* Caja del Modal */}
      <div className="relative w-full max-w-lg bg-surface dark:bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden z-10 animate-scale-in">
        {/* Cabecera */}
        <div className="bg-primary text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10 shadow-inner">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-wide">
                Generador con IA
              </h2>
              <p className="text-[10px] md:text-xs text-white/80 font-medium">
                Crea una trivia completa al instante
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Contenido / Formulario */}
        <div className="p-6 md:p-8">
          {isGenerating ? (
            /* Vista de Carga Animada */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                {/* Doble círculo giratorio */}
                <div className="w-20 h-20 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
                <div className="absolute inset-0 w-20 h-20 flex items-center justify-center">
                  <Wand2 className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-extrabold text-lg text-text-main">
                  Generando tu Trivia...
                </h3>
                <p className="text-sm font-semibold text-primary dark:text-emerald-400 h-10 animate-fade-in">
                  {LOADING_MESSAGES[loadingTextIndex]}
                </p>
                <p className="text-xs text-text-muted">
                  Esto puede tardar entre 10 y 20 segundos dependiendo del tema.
                </p>
              </div>
            </div>
          ) : (
            /* Vista de Formulario */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tema del Quiz */}
              <Input
                icon={Wand2}
                label="Tema o Temática de la Trivia"
                placeholder="Ej. Personajes de Harry Potter, Historia del Imperio Romano"
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                required
              />

              {/* Categoría */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-semibold text-text-main">
                  Asociar a Categoría (Opcional)
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-border bg-surface px-4 py-2 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent font-semibold"
                >
                  <option value="">Ninguna - Varias categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Preguntas */}
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-semibold text-text-main">
                  Número de Preguntas:{" "}
                  <span className="text-primary font-bold">{numQuestions}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer my-2"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-bold px-1">
                  <span>1 pregunta</span>
                  <span>5 preguntas</span>
                  <span>10 preguntas (máx)</span>
                </div>
              </div>

              {/* Mensajes de Error */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-2xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón Guardar */}
              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  icon={Sparkles}
                  className="shadow-primary-light/50 shadow-lg bg-primary hover:bg-primary-hover text-white"
                >
                  Generar Trivia
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
