import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { api } from '../api/axios';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const QUICK_SUGGESTIONS = [
  '¿Cómo inicio una partida con amigos?',
  '¿Cómo se calculan los puntos?',
  '¿Cómo puedo crear mi propia trivia?',
  '¿Qué tecnologías se usaron para crear esta app?'
];

// Componente para renderizar Markdown básico de forma segura
const MarkdownText = ({ text }: { text: string }) => {
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let html = escapeHtml(text);

  // Negrita (**texto**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-primary dark:text-emerald-400">$1</strong>');
  
  // Cursiva (*texto*)
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Bloques de código (```código```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-background/90 dark:bg-background/40 p-3 rounded-xl text-xs font-mono my-2.5 overflow-x-auto border border-border/80 text-text-main"><code class="block whitespace-pre">$1</code></pre>');

  // Código en línea (`código`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-primary-light/65 dark:bg-primary-light/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-primary dark:text-emerald-300 font-bold">$1</code>');

  // Encabezados (### título o ## título)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="font-extrabold text-sm text-primary dark:text-emerald-400 mt-3 mb-1.5">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h4 class="font-extrabold text-base text-primary dark:text-emerald-400 mt-3 mb-1.5">$1</h4>');

  // Listas de viñetas (- elemento o * elemento)
  html = html.replace(/^[-\*]\s+(.*?)$/gm, '<li class="ml-4 list-disc mb-1">$1</li>');

  // Agrupar elementos li consecutivos en un ul
  html = html.replace(/(<li.*?>.*?<\/li>)+/gs, '<ul class="my-2 space-y-1">$1</ul>');

  // Párrafos y saltos de línea
  const paragraphs = html.split(/\n\n+/);
  const formattedHtml = paragraphs.map(p => {
    if (p.startsWith('<ul') || p.startsWith('<h') || p.startsWith('<pre')) {
      return p;
    }
    return `<p class="mb-2 last:mb-0">${p.replace(/\n/g, '<br />')}</p>`;
  }).join('');

  return <div className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedHtml }} />;
};

export const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan mensajes nuevos o cambia de estado
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Mapear historial al formato esperado por el backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await api.post('/ai/chat', {
        message: text,
        history: historyPayload
      });

      const aiText = response.data?.text || 'No obtuve respuesta del asistente.';
      setMessages((prev) => [...prev, { role: 'model', text: aiText }]);
    } catch (error: any) {
      console.error('Error in AI Chat:', error);
      const errMsg = error.response?.data?.message || 'Lo siento, ocurrió un error al procesar tu solicitud.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `⚠️ Error: ${errMsg}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all duration-300 z-50 cursor-pointer"
        title="Preguntar a la IA"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-fade-in" />
        ) : (
          <Sparkles className="w-6 h-6 animate-fade-in" />
        )}
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[360px] sm:w-[400px] md:w-[480px] h-[520px] md:h-[650px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-surface/90 dark:bg-surface/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl z-50 flex flex-col overflow-hidden animate-scale-in transition-all duration-300">
          {/* Cabecera */}
          <div className="bg-primary text-white p-4.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10 shadow-inner">
                <Bot className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide md:text-base">GreenQuiz AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] md:text-xs font-semibold text-white/80">En línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-5 bg-background/30 bg-dots-pattern">
            {/* Mensaje de Bienvenida por Defecto */}
            <div className="flex gap-2.5 max-w-[90%] self-start animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0 border border-primary/20 dark:bg-primary-light/10">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-surface border border-border text-text-main rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm">
                <MarkdownText text="¡Hola! Soy tu asistente de **GreenQuiz**. Estoy listo para responder tus dudas sobre el juego, las tecnologías utilizadas o la configuración del sistema." />
              </div>
            </div>

            {/* Sugerencias Rápidas iniciales si no hay mensajes del usuario */}
            {messages.length === 0 && (
              <div className="pl-9 space-y-3 animate-fade-in stagger-1">
                <p className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Preguntas sugeridas:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-left text-xs font-semibold text-primary bg-primary-light/50 dark:bg-primary-light/10 hover:bg-primary hover:text-white border border-primary/25 rounded-full px-3.5 py-1.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm hover:shadow-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de Mensajes */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[90%] animate-fade-in ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.role === 'user'
                      ? 'bg-primary/10 border-primary/20'
                      : 'bg-primary-light border-primary/20 dark:bg-primary-light/10'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <span className="text-[10px] font-bold text-primary">Tú</span>
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none whitespace-pre-wrap'
                      : 'bg-surface border border-border text-text-main rounded-tl-none'
                  }`}
                >
                  {msg.role === 'user' ? msg.text : <MarkdownText text={msg.text} />}
                </div>
              </div>
            ))}

            {/* Cargando respuesta */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[90%] self-start animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center shrink-0 border border-primary/20 dark:bg-primary-light/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-surface border border-border text-text-muted rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm flex items-center gap-1">
                  <span>Pensando</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={handleSubmit}
            className="p-3 md:p-4 border-t border-border bg-surface/50 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Haz tu pregunta aquí..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-background dark:bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-main placeholder:text-text-muted/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="h-10 w-10 shrink-0 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:hover:bg-primary active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
