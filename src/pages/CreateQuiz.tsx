import { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FileText, Save, Image as ImageIcon } from 'lucide-react';
import { useCreateQuizMutation } from '../features/quizzes/hooks/useQuizzesHooks';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { mutate: createQuiz, isPending } = useCreateQuizMutation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuiz(
      { title, description, thumbnailUrl, isPublic: true },
      { onSuccess: () => navigate('/dashboard') }
    );
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
                    <img 
                      src={thumbnailUrl} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+al+cargar+imagen';
                      }}
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
