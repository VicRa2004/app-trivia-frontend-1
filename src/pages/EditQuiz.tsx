import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Loader2, Plus, GripVertical, CheckCircle2 } from 'lucide-react';
import { useQuizByIdQuery, useCreateQuestionMutation } from '../features/quizzes/hooks/useQuizzesHooks';

const EditQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading, isError } = useQuizByIdQuery(id!);
  const { mutate: createQuestion, isPending: isSaving } = useCreateQuestionMutation();

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { content: '', isCorrect: true, position: 1 },
    { content: '', isCorrect: false, position: 2 },
    { content: '', isCorrect: false, position: 3 },
    { content: '', isCorrect: false, position: 4 },
  ]);

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    createQuestion(
      {
        quizId: id,
        data: {
          questionText,
          questionType: 'multiple_choice',
          points: 1000,
          timeLimit: 20,
          orderNumber: (quiz?.questions?.length || 0) + 1,
          options,
        },
      },
      {
         onSuccess: () => {
            setQuestionText('');
            setOptions([
               { content: '', isCorrect: true, position: 1 },
               { content: '', isCorrect: false, position: 2 },
               { content: '', isCorrect: false, position: 3 },
               { content: '', isCorrect: false, position: 4 },
            ]);
            alert('¡Pregunta añadida con éxito!');
         }
      }
    );
  };

  const setCorrectOption = (index: number) => {
    setOptions(opts => opts.map((o, i) => ({ ...o, isCorrect: i === index })));
  };

  const changeOptionText = (index: number, val: string) => {
    setOptions(opts => opts.map((o, i) => i === index ? { ...o, content: val } : o));
  };

  if (isLoading) return <Layout><div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></Layout>;
  if (isError || !quiz) return <Layout><div className="text-center p-20 text-red-500 font-bold">Error al cargar el quiz</div></Layout>;

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in">
         {/* Sidebar: Lista de Preguntas creadas */}
         <div className="w-full md:w-1/3 flex flex-col gap-4">
            <h2 className="text-xl font-bold px-2">{quiz.title}</h2>
            <Card className="h-fit max-h-[70vh] overflow-y-auto">
               <CardHeader className="sticky top-0 bg-surface z-10 border-b pb-2 mb-2">
                 <CardTitle className="text-sm text-text-muted uppercase">Preguntas ({quiz.questions?.length || 0})</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-3">
                  {quiz.questions?.map((q, i) => (
                    <div key={q.id} className="p-3 bg-surface border rounded-xl flex items-start gap-3 shadow-sm group">
                       <GripVertical className="text-border group-hover:text-text-muted mt-1" size={20}/>
                       <div>
                         <div className="text-xs font-bold text-primary mb-1">Pregunta {i + 1}</div>
                         <div className="text-sm font-semibold line-clamp-2">{q.questionText}</div>
                       </div>
                    </div>
                  ))}
                  {(!quiz.questions || quiz.questions.length === 0) && (
                    <div className="text-center p-6 border-2 border-dashed rounded-xl text-text-muted text-sm">
                      No hay preguntas aún
                    </div>
                  )}
               </CardContent>
            </Card>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="mt-2">Volver al Dashboard</Button>
         </div>
         
         {/* Contenido Principal: Formulario añadir pregunta */}
         <div className="w-full md:w-2/3">
            <Card className="border-4 border-transparent focus-within:border-primary/20 transition-all duration-300">
              <CardHeader className="bg-primary/5 border-b mb-6 rounded-t-2xl">
                <CardTitle className="text-2xl text-primary font-extrabold flex items-center gap-2">
                   <Plus /> Añadir Nueva Pregunta
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleCreateQuestion} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-text-main text-lg">Escribe tu pregunta</label>
                      <textarea
                        className="w-full min-h-[100px] border-2 border-border focus:border-primary rounded-2xl p-4 text-xl font-bold bg-surface text-center resize-none outline-none shadow-sm transition-all text-text-main placeholder:text-text-muted"
                        placeholder="Empezar a escribir..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                       {options.map((opt, i) => (
                         <div key={i} className={`flex items-center gap-3 p-2 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-border bg-surface'}`}>
                            <button 
                               type="button" 
                               onClick={() => setCorrectOption(i)}
                               className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg scale-110' : 'bg-transparent border-2 border-border text-border hover:border-text-muted hover:text-text-muted'}`}
                            >
                               {opt.isCorrect && <CheckCircle2 size={24} />}
                            </button>
                            <input
                              type="text"
                              className="w-full bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-sm text-text-main"
                              placeholder={`Opción ${i+1}`}
                              value={opt.content}
                              onChange={(e) => changeOptionText(i, e.target.value)}
                              required={i < 2} // Exige al menos 2
                            />
                         </div>
                       ))}
                    </div>
                    
                    <div className="flex justify-end pt-6 mt-4 border-t">
                      <Button type="submit" isLoading={isSaving} className="text-lg px-8 py-6 shadow-xl shadow-primary/30">
                        Guardar Pregunta
                      </Button>
                    </div>
                 </form>
              </CardContent>
            </Card>
         </div>
      </div>
    </Layout>
  );
};

export default EditQuiz;
