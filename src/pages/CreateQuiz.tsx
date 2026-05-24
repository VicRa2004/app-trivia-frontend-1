import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FileText, Save, Image as ImageIcon, Loader2, Users, Lock } from 'lucide-react';
import { useCreateQuizMutation, useCategoriesQuery } from '../features/quizzes/hooks/useQuizzesHooks';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const { data: categoriesData } = useCategoriesQuery();
  const categories = categoriesData?.data || [];
  const { mutate: createQuiz, isPending } = useCreateQuizMutation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuiz({ 
      title, 
      description, 
      thumbnailUrl: thumbnailUrl || undefined, 
      categoryId: categoryId || undefined, 
      isPublic 
    });
  };

  return (
    <Layout>
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="px-3">
            ← Volver
          </Button>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Nuevo Quiz</h1>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader>
             <CardTitle className="text-xl px-2">Detalles Generales</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                icon={FileText}
                label="Título del Quiz"
                placeholder="Ej. Mitología Griega"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-semibold text-text-main">Descripción</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-main placeholder:text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent resize-y"
                  placeholder="Escribe de qué trata el quiz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-semibold text-text-main">Categoría</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-border bg-surface px-4 py-2 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent font-semibold"
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">Privacidad del Quiz</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                      isPublic
                        ? 'border-primary bg-primary/5 text-primary shadow-md scale-[1.01]'
                        : 'border-border bg-surface text-text-muted hover:border-primary/20 hover:text-text-main hover:bg-gray-50/50'
                    }`}
                  >
                    <Users size={24} className={isPublic ? 'text-primary' : 'text-text-muted'} />
                    <span className="text-sm font-extrabold mt-1.5">Público</span>
                    <span className="text-xs text-text-muted mt-1 leading-normal">Cualquiera puede jugar y competir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                      !isPublic
                        ? 'border-primary bg-primary/5 text-primary shadow-md scale-[1.01]'
                        : 'border-border bg-surface text-text-muted hover:border-primary/20 hover:text-text-main hover:bg-gray-50/50'
                    }`}
                  >
                    <Lock size={24} className={!isPublic ? 'text-primary' : 'text-text-muted'} />
                    <span className="text-sm font-extrabold mt-1.5">Privado</span>
                    <span className="text-xs text-text-muted mt-1 leading-normal">Solo tú y quienes tengan el PIN de juego</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  icon={ImageIcon}
                  label="URL del Banner (Opcional)"
                  placeholder="https://ejemplo.com/banner.jpg"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
                {thumbnailUrl && (
                  <div className="mt-2 rounded-2xl overflow-hidden border-2 border-border relative h-40">
                    {isImageLoading && (
                      <div className="absolute inset-0 bg-border/50 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                    <img
                      src={thumbnailUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onLoad={() => setIsImageLoading(false)}
                      onError={(e) => {
                        setIsImageLoading(false);
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
                      }}
                      onLoadStart={() => setIsImageLoading(true)}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" icon={Save} isLoading={isPending} className="shadow-primary-light/50 shadow-lg">
                  Guardar Borrador
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateQuiz;
