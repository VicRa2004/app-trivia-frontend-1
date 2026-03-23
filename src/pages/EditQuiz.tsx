import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Loader2, Plus, GripVertical, CheckCircle2, Image as ImageIcon, Edit2, X, Save } from 'lucide-react';
import { useQuizByIdQuery, useCreateQuestionMutation, useUpdateQuizMutation } from '../features/quizzes/hooks/useQuizzesHooks';
import type { QuizQuestion } from '../features/quizzes/types';

const EditQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading, isError } = useQuizByIdQuery(id!);
  const { mutate: saveQuestion, isPending: isSaving } = useCreateQuestionMutation();
  const { mutate: updateQuiz, isPending: isUpdatingQuiz } = useUpdateQuizMutation();

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState([
    { content: '', imageUrl: '', isCorrect: true, position: 1 },
    { content: '', imageUrl: '', isCorrect: false, position: 2 },
    { content: '', imageUrl: '', isCorrect: false, position: 3 },
    { content: '', imageUrl: '', isCorrect: false, position: 4 },
  ]);

  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [quizBanner, setQuizBanner] = useState('');

  // Sincronizar quizBanner inicial desde quiz.thumbnailUrl (solucionamos el lint error)
  if (quiz && quizBanner === '' && quiz.thumbnailUrl) {
     setQuizBanner(quiz.thumbnailUrl);
  }

  const handleQuestionTypeChange = (newType: string) => {
    setQuestionType(newType);
    if (newType === 'true_false') {
      setOptions(opts => [
        { ...opts[0], content: 'Verdadero', position: 1, isCorrect: opts[0].isCorrect },
        { ...opts[1], content: 'Falso', position: 2, isCorrect: !opts[0].isCorrect },
        { ...opts[2], content: '', position: 3, isCorrect: false },
        { ...opts[3], content: '', position: 4, isCorrect: false },
      ]);
    }
  };

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setImageUrl('');
    setQuestionType('multiple_choice');
    setOptions([
       { content: '', imageUrl: '', isCorrect: true, position: 1 },
       { content: '', imageUrl: '', isCorrect: false, position: 2 },
       { content: '', imageUrl: '', isCorrect: false, position: 3 },
       { content: '', imageUrl: '', isCorrect: false, position: 4 },
    ]);
  };

  const handleEditClick = (q: QuizQuestion) => {
    setEditingQuestionId(q.id || null);
    setQuestionText(q.questionText || '');
    setImageUrl(q.imageUrl || '');
    setQuestionType(q.questionType || 'multiple_choice');
    
    // Ensure 4 options exist for the form
    const mappedOptions = [...(q.options || [])];
    while (mappedOptions.length < 4) {
      mappedOptions.push({ content: '', imageUrl: '', isCorrect: false, position: mappedOptions.length + 1 });
    }
    setOptions(mappedOptions.slice(0, 4).map((o, idx) => ({
       content: o.content || '',
       imageUrl: o.imageUrl || '',
       isCorrect: o.isCorrect || false,
       position: o.position || idx + 1
    })));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    saveQuestion(
      {
        quizId: id,
        data: {
          id: editingQuestionId || undefined,
          questionText,
          imageUrl: imageUrl || undefined,
          questionType,
          points: 1000,
          timeLimit: 20,
          orderNumber: (quiz?.questions?.length || 0) + 1,
          options: options
             .slice(0, questionType === 'true_false' ? 2 : questionType === 'short_answer' ? 3 : 4)
             .filter((opt, i) => questionType !== 'short_answer' || (opt.content && opt.content.trim() !== '') || i === 0) // At least 1 required for short answer
             .map((opt, i) => ({
             ...opt,
             content: questionType === 'image_choice' ? `Imagen ${i + 1}` : opt.content,
             isCorrect: questionType === 'short_answer' ? true : questionType === 'true_false' ? opt.isCorrect : opt.isCorrect,
             position: i + 1,
             imageUrl: opt.imageUrl ? opt.imageUrl : undefined
          })),
        },
      },
      {
         onSuccess: () => {
            resetForm();
            alert(editingQuestionId ? '¡Pregunta actualizada con éxito!' : '¡Pregunta añadida con éxito!');
         }
      }
    );
  };

  const setCorrectOption = (index: number) => {
    if (questionType === 'true_false') {
      setOptions(opts => opts.map((o, i) => ({ ...o, isCorrect: i === index })));
    } else {
      setOptions(opts => opts.map((o, i) => ({ ...o, isCorrect: i === index })));
    }
  };

  const changeOptionText = (index: number, val: string) => {
    if (questionType === 'true_false') return; 
    setOptions(opts => opts.map((o, i) => i === index ? { ...o, content: val } : o));
  };

  const changeOptionImage = (index: number, val: string) => {
    setOptions(opts => opts.map((o, i) => i === index ? { ...o, imageUrl: val } : o));
  };

  const handleSaveQuizBanner = () => {
    if (!id) return;
    updateQuiz({
      quizId: id,
      data: { thumbnailUrl: quizBanner }
    }, {
      onSuccess: () => {
        setIsEditingQuiz(false);
      }
    });
  };

  if (isLoading) return <Layout><div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></Layout>;
  if (isError || !quiz) return <Layout><div className="text-center p-20 text-red-500 font-bold">Error al cargar el quiz</div></Layout>;

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in">
         {/* Sidebar: Lista de Preguntas creadas */}
         <div className="w-full md:w-1/3 flex flex-col gap-4">
            
            {/* Banner Section */}
            <Card className="overflow-hidden border-border/50">
              <div className="relative h-32 bg-primary/10 border-b">
                 {(quizBanner || quiz.thumbnailUrl) ? (
                   <img 
                     src={quizBanner || quiz.thumbnailUrl} 
                     alt="Quiz Banner" 
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Banner+no+encontrado';
                     }}
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-text-muted">
                      Sin Banner
                   </div>
                 )}
                 <Button 
                   size="sm" 
                   variant="secondary" 
                   onClick={() => setIsEditingQuiz(!isEditingQuiz)} 
                   className="absolute top-2 right-2 bg-white/80 hover:bg-white text-xs shadow-sm"
                 >
                   <Edit2 size={14} className="mr-1" /> Banner
                 </Button>
              </div>
              
              {isEditingQuiz && (
                <div className="p-3 bg-surface border-b animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-text-main mb-1 block">URL del Banner</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 text-sm p-2 rounded-lg border border-border outline-none focus:border-primary"
                      placeholder="https://..."
                      value={quizBanner}
                      onChange={e => setQuizBanner(e.target.value)}
                    />
                    <Button size="sm" onClick={handleSaveQuizBanner} isLoading={isUpdatingQuiz} className="px-2">
                      <Save size={16} />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="text-xl font-bold text-text-main wrap-break-word">{quiz.title}</h2>
                <p className="text-sm text-text-muted mt-1 wrap-break-word">{quiz.description}</p>
              </div>
            </Card>

            <Card className="h-fit max-h-[50vh] overflow-y-auto">
               <CardHeader className="sticky top-0 bg-surface z-10 border-b pb-2 mb-2">
                 <CardTitle className="text-sm text-text-muted uppercase">Preguntas ({quiz.questions?.length || 0})</CardTitle>
               </CardHeader>
               <CardContent className="flex flex-col gap-3">
                  {quiz.questions?.map((q, i) => (
                    <div 
                       key={q.id} 
                       className={`p-3 bg-surface border-2 rounded-xl flex items-start gap-3 shadow-sm group cursor-pointer transition-all ${editingQuestionId === q.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/30'}`}
                       onClick={() => handleEditClick(q)}
                    >
                       <GripVertical className="text-border group-hover:text-text-muted mt-1" size={20}/>
                       <div className="flex-1">
                         <div className="text-xs font-bold text-primary mb-1 flex justify-between items-center">
                            <span>Pregunta {i + 1}</span>
                            <Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <div className="text-sm font-semibold line-clamp-2 text-text-main">{q.questionText}</div>
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
            <Card className={`border-4 transition-all duration-300 ${editingQuestionId ? 'border-yellow-400 focus-within:border-yellow-500' : 'border-transparent focus-within:border-primary/20'}`}>
              <CardHeader className={`${editingQuestionId ? 'bg-yellow-50' : 'bg-primary/5'} border-b mb-6 rounded-t-2xl flex flex-row items-center justify-between`}>
                <CardTitle className={`text-2xl ${editingQuestionId ? 'text-yellow-700' : 'text-primary'} font-extrabold flex items-center gap-2`}>
                   {editingQuestionId ? <><Edit2 /> Editar Pregunta</> : <><Plus /> Añadir Nueva Pregunta</>}
                </CardTitle>
                {editingQuestionId && (
                   <button type="button" onClick={resetForm} className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full transition-colors flex items-center gap-2 font-bold text-sm">
                      <X size={16} /> Cancelar Edición
                   </button>
                )}
              </CardHeader>
              <CardContent>
                 <form onSubmit={handleSaveQuestion} className="flex flex-col gap-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-text-main">Tipo de Pregunta</label>
                          <select 
                            value={questionType}
                            onChange={(e) => handleQuestionTypeChange(e.target.value)}
                            className="p-3 bg-surface border-2 border-border rounded-2xl outline-none focus:border-primary transition-all text-text-main font-semibold"
                          >
                             <option value="multiple_choice">Opción Múltiple</option>
                             <option value="true_false">Falso o Verdadero</option>
                             <option value="image_choice">Selección de Imagen</option>
                             <option value="short_answer">Respuesta Corta</option>
                             <option value="ordering">Ordenamiento</option>
                          </select>
                       </div>
                       <div className="flex flex-col gap-1">
                          <label className="text-sm font-bold text-text-main">URL Imagen de Apoyo (Opcional)</label>
                          <input 
                            type="text"
                            placeholder="https://ejemplo.com/img.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="p-3 bg-surface border-2 border-border rounded-2xl outline-none focus:border-primary transition-all text-text-main"
                          />
                          {imageUrl && (
                            <div className="mt-2 h-20 w-32 rounded-lg relative overflow-hidden border border-border">
                              <img 
                                src={imageUrl} 
                                alt="preview" 
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                   (e.target as HTMLImageElement).src = 'https://placehold.co/128x80?text=Error';
                                }}
                              />
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <label className="font-bold text-text-main text-lg">Opciones de Respuesta</label>
                      {questionType === 'ordering' && <span className="text-sm text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">Coloca las opciones en orden del 1 al 4</span>}
                      {questionType === 'short_answer' && <span className="text-sm text-green-700 font-semibold bg-green-500/10 px-3 py-1 rounded-full">Aceptadas como correctas (Máx 3)</span>}
                      {questionType === 'true_false' && <span className="text-sm text-blue-700 font-semibold bg-blue-500/10 px-3 py-1 rounded-full">Selecciona la correcta</span>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-2">
                       {options
                         .slice(0, questionType === 'true_false' ? 2 : questionType === 'short_answer' ? 3 : 4)
                         .map((opt, i) => (
                         <div key={i} className={`flex flex-col gap-2 p-3 rounded-2xl border-2 transition-all ${(opt.isCorrect && questionType !== 'ordering' && questionType !== 'short_answer') || questionType === 'short_answer' ? 'border-green-500 bg-green-500/10' : 'border-border bg-surface'}`}>
                            <div className="flex items-center gap-3">
                               {questionType !== 'ordering' && questionType !== 'short_answer' && (
                                 <button 
                                   type="button" 
                                   onClick={() => setCorrectOption(i)}
                                   className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-transparent border-2 border-border text-border hover:border-text-muted hover:text-text-muted'}`}
                                 >
                                    {opt.isCorrect && <CheckCircle2 size={24} />}
                                 </button>
                               )}
                               {questionType === 'ordering' && (
                                 <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary font-extrabold shadow-sm border border-primary/20">
                                   {i + 1}
                                 </div>
                               )}
                               {questionType === 'short_answer' && (
                                  <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white shadow-md border border-green-600">
                                     <CheckCircle2 size={24} />
                                  </div>
                               )}
                               {questionType !== 'image_choice' && (
                                 <input
                                   type="text"
                                   className={`w-full bg-transparent outline-none font-bold text-lg placeholder:font-normal placeholder:text-sm ${questionType === 'true_false' ? 'text-text-main opacity-80 cursor-default' : 'text-text-main'}`}
                                   placeholder={questionType === 'short_answer' ? `Respuesta válida ${i+1}${i > 0 ? ' (Opcional)' : ''}` : `Texto de Opción ${i+1}`}
                                   value={opt.content}
                                   onChange={(e) => changeOptionText(i, e.target.value)}
                                   readOnly={questionType === 'true_false'}
                                   required={(i < 2 && questionType !== 'short_answer' && questionType !== 'image_choice') || (i === 0 && questionType === 'short_answer') || questionType === 'ordering'}
                                 />
                               )}
                            </div>
                            <div className="flex flex-col gap-1 pl-13 pr-2 mt-1">
                               <div className="flex items-center gap-2">
                                 <ImageIcon size={16} className="text-text-muted" />
                                 <input
                                   type="text"
                                   className="w-full bg-transparent outline-none text-sm placeholder:text-text-muted/60 text-text-muted"
                                   placeholder={questionType === 'image_choice' ? "URL de Imagen (Requerida)" : "URL de Imagen (Opcional)"}
                                   value={opt.imageUrl || ''}
                                   onChange={(e) => changeOptionImage(i, e.target.value)}
                                   required={questionType === 'image_choice' && i < 2}
                                 />
                               </div>
                               {opt.imageUrl && (
                                 <div className="mt-2 h-16 w-24 rounded-md overflow-hidden border border-border bg-surface relative">
                                    <img 
                                      src={opt.imageUrl} 
                                      alt={`Preview ${i+1}`} 
                                      className="object-cover w-full h-full"
                                      onError={(e) => {
                                         (e.target as HTMLImageElement).src = 'https://placehold.co/96x64?text=X';
                                      }}
                                    />
                                 </div>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="flex justify-end pt-6 mt-4 border-t">
                      <Button type="submit" isLoading={isSaving} className={`text-lg px-8 py-6 shadow-xl ${editingQuestionId ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-yellow-950' : 'shadow-primary/30'}`}>
                        {editingQuestionId ? 'Guardar Cambios' : 'Guardar Pregunta'}
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
