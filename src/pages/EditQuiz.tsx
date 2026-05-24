import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Loader2, Plus, GripVertical, CheckCircle2, Image as ImageIcon, Edit2, X, Save, Trash2, Users, Lock } from 'lucide-react';
import { useQuizByIdQuery, useCreateQuestionMutation, useUpdateQuizMutation, useUpdateQuestionMutation, useDeleteQuestionMutation, useCategoriesQuery } from '../features/quizzes/hooks/useQuizzesHooks';
import type { QuizQuestion } from '../features/quizzes/types';

const optionMeta = [
  { 
    border: 'border-[#ff3355]/30 focus-within:border-[#ff3355]', 
    bg: 'bg-[#ff3355]/5', 
    text: 'text-[#ff3355]', 
    bgActive: 'bg-[#ff3355]', 
    icon: '▲', 
    label: 'Rojo' 
  },
  { 
    border: 'border-[#2a82e6]/30 focus-within:border-[#2a82e6]', 
    bg: 'bg-[#2a82e6]/5', 
    text: 'text-[#2a82e6]', 
    bgActive: 'bg-[#2a82e6]', 
    icon: '◆', 
    label: 'Azul' 
  },
  { 
    border: 'border-[#ffca28]/30 focus-within:border-[#ffca28]', 
    bg: 'bg-[#ffca28]/5', 
    text: 'text-[#ffca28]', 
    bgActive: 'bg-[#ffca28]', 
    icon: '●', 
    label: 'Amarillo' 
  },
  { 
    border: 'border-[#4cd137]/30 focus-within:border-[#4cd137]', 
    bg: 'bg-[#4cd137]/5', 
    text: 'text-[#4cd137]', 
    bgActive: 'bg-[#4cd137]', 
    icon: '■', 
    label: 'Verde' 
  },
];

const EditQuiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quiz, isLoading, isError } = useQuizByIdQuery(id!);
  const { mutate: createQuestion, isPending: isSaving } = useCreateQuestionMutation();
  const { mutate: updateQuestion } = useUpdateQuestionMutation();
  const { mutate: deleteQuestion } = useDeleteQuestionMutation();
  const { mutate: updateQuiz, isPending: isUpdatingQuiz } = useUpdateQuizMutation();
  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.data || [];

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
  const [showImageInputs, setShowImageInputs] = useState<boolean[]>([false, false, false, false]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [quizBanner, setQuizBanner] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizIsPublic, setQuizIsPublic] = useState<boolean | null>(null);

  // Sincronizar quizBanner, quizCategory y quizIsPublic iniciales desde quiz
  if (quiz && quizBanner === '' && quiz.thumbnailUrl) {
     setQuizBanner(quiz.thumbnailUrl);
  }
  if (quiz && quizCategory === '' && quiz.categoryId) {
     setQuizCategory(quiz.categoryId);
  }
  if (quiz && quizIsPublic === null) {
     setQuizIsPublic(quiz.isPublic);
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
    setShowImageInputs([false, false, false, false]);
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
    const finalOptions = mappedOptions.slice(0, 4).map((o, idx) => ({
       content: o.content || '',
       imageUrl: o.imageUrl || '',
       isCorrect: o.isCorrect || false,
       position: o.position || idx + 1
    }));
    setOptions(finalOptions);
    setShowImageInputs(finalOptions.map(o => !!o.imageUrl));
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !quiz) return;

    const questionData = {
      questionText,
      imageUrl: imageUrl || undefined,
      questionType,
      points: 1000,
      timeLimit: 20,
      orderNumber: editingQuestionId
        ? (quiz.questions?.find(q => q.id === editingQuestionId)?.orderNumber || 1)
        : (quiz.questions?.length || 0) + 1,
      options: options
         .slice(0, questionType === 'true_false' ? 2 : questionType === 'ordering' ? 4 : questionType === 'short_answer' ? 3 : 4)
         .filter((opt, i) => questionType !== 'short_answer' || (opt.content && opt.content.trim() !== '') || i === 0)
         .map((opt, i) => ({
           content: questionType === 'image_choice' ? `Imagen ${i + 1}` : opt.content,
           isCorrect: questionType === 'short_answer' ? true : opt.isCorrect,
           position: i + 1,
           imageUrl: opt.imageUrl ? opt.imageUrl : undefined
         })),
    };

    if (editingQuestionId) {
      updateQuestion(
        {
          quizId: id,
          questionId: editingQuestionId,
          data: questionData,
        },
        {
          onSuccess: () => {
            resetForm();
            setToast({ message: '¡Pregunta actualizada con éxito!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
          },
        }
      );
    } else {
      createQuestion(
        {
          quizId: id,
          data: questionData,
        },
        {
          onSuccess: () => {
            resetForm();
            setToast({ message: '¡Pregunta añadida con éxito!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
          },
        }
      );
    }
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

  const handleSaveQuizInfo = () => {
    if (!id) return;
    updateQuiz({
      quizId: id,
      data: { 
        thumbnailUrl: quizBanner || undefined,
        categoryId: quizCategory || undefined,
        isPublic: quizIsPublic ?? true
      }
    }, {
      onSuccess: () => {
        setIsEditingQuiz(false);
        setToast({ message: '¡Quiz actualizado con éxito!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    });
  };

  const handleDeleteQuestion = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      deleteQuestion(
        { quizId: id!, questionId },
        {
          onSuccess: () => {
            setToast({ message: '¡Pregunta eliminada con éxito!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
            if (editingQuestionId === questionId) {
              resetForm();
            }
          }
        }
      );
    }
  };

  if (isLoading) return <Layout><div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div></Layout>;
  if (isError || !quiz) return <Layout><div className="text-center p-20 text-red-500 font-bold">Error al cargar el quiz</div></Layout>;

  return (
    <Layout>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 text-white font-bold ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>
      )}
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
                  {!isEditingQuiz && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      icon={Edit2}
                      onClick={() => setIsEditingQuiz(true)} 
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-xs shadow-sm"
                    >
                      Editar Info
                    </Button>
                  )}
              </div>
              
              {isEditingQuiz && (
                <div className="p-3 bg-surface border-b animate-in slide-in-from-top-2 flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-text-main mb-1 block">URL del Banner</label>
                    <input 
                      type="text" 
                      className="w-full text-sm p-2 rounded-lg border border-border outline-none focus:border-primary bg-surface text-text-main"
                      placeholder="https://..."
                      value={quizBanner}
                      onChange={e => setQuizBanner(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-main mb-1 block">Categoría</label>
                    <select
                      className="w-full text-sm p-2 rounded-lg border border-border outline-none focus:border-primary bg-surface text-text-main font-semibold"
                      value={quizCategory}
                      onChange={e => setQuizCategory(e.target.value)}
                    >
                      <option value="">Selecciona una categoría...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-text-main mb-1 block">Privacidad</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQuizIsPublic(true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                          quizIsPublic === true
                            ? 'border-primary bg-primary/5 text-primary shadow-xs'
                            : 'border-border bg-surface text-text-muted hover:border-primary/20 hover:text-text-main'
                        }`}
                      >
                        <Users size={14} /> Público
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuizIsPublic(false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                          quizIsPublic === false
                            ? 'border-primary bg-primary/5 text-primary shadow-xs'
                            : 'border-border bg-surface text-text-muted hover:border-primary/20 hover:text-text-main'
                        }`}
                      >
                        <Lock size={14} /> Privado
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      icon={X} 
                      onClick={() => setIsEditingQuiz(false)} 
                      className="px-3 border-border hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" icon={Save} onClick={handleSaveQuizInfo} isLoading={isUpdatingQuiz} className="px-3">
                      Guardar Info
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-xl font-bold text-text-main wrap-break-word">{quiz.title}</h2>
                  {quiz.category && (
                    <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0">
                      {quiz.category.name}
                    </span>
                  )}
                </div>
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
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 size={12} />
                              <button
                                type="button"
                                onClick={(e) => handleDeleteQuestion(e, q.id!)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                         </div>
                         <div className="text-sm font-semibold line-clamp-2 text-text-main">{q.questionText}</div>
                       </div>
                    </div>
                  ))}
                  {(!quiz.questions || quiz.questions.length === 0) && (
                    <div className="text-center p-8 border-2 border-dashed rounded-xl text-text-muted text-sm flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus size={24} className="text-primary" />
                      </div>
                      <span>No hay preguntas aún</span>
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
                     {/* Textarea de pregunta principal */}
                     <div className="flex flex-col gap-2">
                       <label className="font-bold text-text-main text-lg">Pregunta principal</label>
                       <textarea
                         className="w-full min-h-[110px] border-2 border-border focus:border-primary rounded-3xl p-6 text-2xl font-black bg-surface text-center resize-none outline-none shadow-md transition-all text-text-main placeholder:text-text-muted/50 focus:scale-[1.01]"
                         placeholder="Escribe tu pregunta aquí..."
                         value={questionText}
                         onChange={(e) => setQuestionText(e.target.value)}
                         required
                       />
                     </div>

                     {/* Selector visual de tipo de pregunta y URL de Imagen */}
                     <div className="flex flex-col gap-5 mt-2">
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-text-main">Tipo de Pregunta</label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                             {[
                               { id: 'multiple_choice', label: 'Opción Múltiple', icon: '🗳️' },
                               { id: 'true_false', label: 'Verdadero / Falso', icon: '⚖️' },
                               { id: 'image_choice', label: 'Selección Imagen', icon: '🖼️' },
                               { id: 'short_answer', label: 'Respuesta Corta', icon: '✍️' },
                               { id: 'ordering', label: 'Ordenamiento', icon: '📋' },
                             ].map((t) => (
                               <button
                                 key={t.id}
                                 type="button"
                                 onClick={() => handleQuestionTypeChange(t.id)}
                                 className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                                   questionType === t.id
                                     ? 'border-primary bg-primary/5 text-primary font-bold shadow-md scale-[1.02]'
                                     : 'border-border bg-surface text-text-muted hover:border-primary/20 hover:text-text-main hover:bg-gray-50/50'
                                 }`}
                               >
                                 <span className="text-2xl mb-1">{t.icon}</span>
                                 <span className="text-xs font-bold leading-tight">{t.label}</span>
                               </button>
                             ))}
                           </div>
                        </div>

                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-text-main">URL Imagen de Apoyo (Opcional)</label>
                           <div className="flex gap-4 items-center">
                              <div className="relative flex-1">
                                 <input 
                                   type="text"
                                   placeholder="https://ejemplo.com/img.jpg"
                                   value={imageUrl}
                                   onChange={(e) => setImageUrl(e.target.value)}
                                   className="w-full p-3.5 pl-11 bg-surface border-2 border-border rounded-2xl outline-none focus:border-primary transition-all text-text-main text-sm"
                                 />
                                 <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                              </div>
                              {imageUrl && (
                                <div className="h-14 w-20 rounded-xl relative overflow-hidden border-2 border-border shrink-0 shadow-sm bg-surface">
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
                     </div>

                     <div className="flex justify-between items-center mt-4">
                       <label className="font-bold text-text-main text-lg">Opciones de Respuesta</label>
                       {questionType === 'ordering' && <span className="text-xs text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">Coloca las opciones en orden del 1 al 4</span>}
                       {questionType === 'short_answer' && <span className="text-xs text-green-700 font-bold bg-green-500/10 px-3.5 py-1.5 rounded-full border border-green-500/20">Respuestas correctas alternativas (Máx 3)</span>}
                       {questionType === 'true_false' && <span className="text-xs text-blue-700 font-bold bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">Selecciona la opción correcta</span>}
                     </div>

                     {/* Opciones de respuesta dinámicas */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        {options
                          .slice(0, questionType === 'true_false' ? 2 : questionType === 'short_answer' ? 3 : 4)
                          .map((opt, i) => {
                             const meta = optionMeta[i];
                             const isTrueFalse = questionType === 'true_false';
                             const isShortAnswer = questionType === 'short_answer';
                             const isImageChoice = questionType === 'image_choice';
                             const isOrdering = questionType === 'ordering';
                             
                             const showImageInput = showImageInputs[i];
                             const hasImage = !!opt.imageUrl;

                             const isCorrect = opt.isCorrect;
                             const isCorrectHighlight = (isCorrect && !isOrdering && !isShortAnswer) || isShortAnswer;

                             return (
                               <div 
                                 key={i} 
                                 className={`flex flex-col gap-3.5 p-4 rounded-3xl border-2 transition-all ${
                                   isCorrectHighlight 
                                     ? 'border-green-500 bg-green-500/5 shadow-sm' 
                                     : `${meta.border} ${meta.bg}`
                                 }`}
                               >
                                 <div className="flex items-center gap-3">
                                    {/* Botón de Correcta */}
                                    {!isOrdering && !isShortAnswer && (
                                      <button 
                                        type="button" 
                                        onClick={() => setCorrectOption(i)}
                                        className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                                          isCorrect 
                                            ? 'bg-green-500 border-green-500 text-white shadow-md scale-105' 
                                            : 'bg-white border-border text-text-muted hover:border-text-muted'
                                        }`}
                                      >
                                         {isCorrect ? <CheckCircle2 size={24} /> : <span className="font-extrabold text-sm">{meta.icon}</span>}
                                      </button>
                                    )}

                                    {/* Indicador de Orden */}
                                    {isOrdering && (
                                      <div className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-full font-black text-lg border-2 shadow-sm ${meta.bgActive} text-white border-transparent`}>
                                        {i + 1}
                                      </div>
                                    )}

                                    {/* Indicador de Respuesta Corta */}
                                    {isShortAnswer && (
                                       <div className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white shadow-md border-2 border-green-600">
                                          <CheckCircle2 size={24} />
                                       </div>
                                    )}

                                    {/* Input de texto para opción */}
                                    {!isImageChoice ? (
                                      <input
                                        type="text"
                                        className={`w-full bg-transparent outline-none font-bold text-lg text-text-main ${
                                          isTrueFalse ? 'opacity-80 cursor-default' : ''
                                        }`}
                                        placeholder={
                                          isShortAnswer 
                                            ? `Respuesta válida ${i+1}${i > 0 ? ' (Opcional)' : ''}` 
                                            : `Escribe la respuesta ${meta.label}...`
                                        }
                                        value={opt.content}
                                        onChange={(e) => changeOptionText(i, e.target.value)}
                                        readOnly={isTrueFalse}
                                        required={(i < 2 && !isShortAnswer) || (i === 0 && isShortAnswer) || isOrdering}
                                      />
                                    ) : (
                                      <div className="font-bold text-lg text-text-main flex-1">
                                        Opción {i + 1} ({meta.label})
                                      </div>
                                    )}
                                 </div>

                                 {/* Sección de Imagen para la opción (Solo si no es F/V ni Respuesta Corta) */}
                                 {!isTrueFalse && !isShortAnswer && (
                                    <div className="flex flex-col gap-2.5 border-t border-dashed border-border/60 pt-3">
                                      {/* Contenedor especial para image_choice */}
                                      {isImageChoice ? (
                                        <div className="flex flex-col gap-2">
                                          <div className="relative">
                                            <input
                                              type="text"
                                              className="w-full p-2.5 pl-9 bg-white border-2 border-border rounded-xl outline-none focus:border-primary transition-all text-xs text-text-muted"
                                              placeholder="URL de Imagen (Requerida)"
                                              value={opt.imageUrl || ''}
                                              onChange={(e) => changeOptionImage(i, e.target.value)}
                                              required={i < 2}
                                            />
                                            <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                          </div>
                                          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-border bg-white relative flex items-center justify-center group shadow-inner">
                                            {opt.imageUrl ? (
                                              <img 
                                                src={opt.imageUrl} 
                                                alt={`Preview ${i+1}`} 
                                                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                                onError={(e) => {
                                                   (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Error';
                                                }}
                                              />
                                            ) : (
                                              <div className="text-center p-4 flex flex-col items-center gap-1.5 text-text-muted">
                                                <ImageIcon size={28} className="text-border" />
                                                <span className="text-xs font-semibold">Sin imagen</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        /* Modo colapsable para multiple_choice y ordering */
                                        <div>
                                          {!showImageInput && !hasImage ? (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const copy = [...showImageInputs];
                                                copy[i] = true;
                                                setShowImageInputs(copy);
                                              }}
                                              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary hover:bg-primary/5 py-1.5 px-3 rounded-lg border border-border border-dashed transition-all cursor-pointer"
                                            >
                                              <Plus size={12} /> Añadir Imagen
                                            </button>
                                          ) : (
                                            <div className="flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-200">
                                              <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                  <input
                                                    type="text"
                                                    className="w-full p-2 pl-8 bg-white border border-border rounded-xl outline-none focus:border-primary transition-all text-xs text-text-main"
                                                    placeholder="URL de Imagen"
                                                    value={opt.imageUrl || ''}
                                                    onChange={(e) => changeOptionImage(i, e.target.value)}
                                                  />
                                                  <ImageIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    changeOptionImage(i, '');
                                                    const copy = [...showImageInputs];
                                                    copy[i] = false;
                                                    setShowImageInputs(copy);
                                                  }}
                                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                  title="Quitar Imagen"
                                                >
                                                  <X size={14} />
                                                </button>
                                              </div>
                                              {opt.imageUrl && (
                                                <div className="h-16 w-24 rounded-lg overflow-hidden border border-border bg-white relative shadow-sm">
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
                                          )}
                                        </div>
                                      )}
                                    </div>
                                 )}
                               </div>
                             );
                          })}
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
