import { useGameStore } from "../store/useGameStore";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Users, Play, User, Share2, Check } from "lucide-react";
import { API_URL } from "../../../config/env";
import { useGameAudio } from "../hooks/useGameAudio";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const getFullAvatarUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_URL}/public${url}`;
};

export const LobbyView = ({ onStart }: { onStart: () => void }) => {
  const { gamePin, players, isHost } = useGameStore();
  const { startLobbyMusic, stopMusic } = useGameAudio();
  const [copied, setCopied] = useState(false);

  // Iniciar la música del Lobby al montar el componente
  useEffect(() => {
    startLobbyMusic();
    return () => {
      // Detenemos la música del lobby cuando el usuario sale del lobby (sea por iniciar partida o por salir al dashboard)
      stopMusic();
    };
  }, [startLobbyMusic, stopMusic]);

  const copyToClipboard = () => {
    if (!gamePin) return;
    // Intentar copiar tanto el PIN como una invitación amigable
    const inviteText = `¡Únete a mi trivia! Entra a la app e ingresa el PIN: ${gamePin}`;
    navigator.clipboard.writeText(inviteText).then(() => {
      setCopied(true);
      toast.success("¡Invitación copiada al portapapeles!");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("No se pudo copiar el PIN.");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto min-h-[75vh] animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
      
      {/* Elementos decorativos animados en el fondo */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-[#7f0df2]/5 rounded-full blur-2xl animate-pulse duration-[4s]" />
      <div className="absolute bottom-10 right-10 w-44 h-44 bg-pink-500/5 rounded-full blur-3xl animate-pulse duration-[6s]" />

      {/* Tarjeta del PIN principal con Glassmorphism y sombras premium */}
      <Card className="w-full text-center border-2 border-gray-100 p-8 md:p-12 mb-8 bg-white/80 backdrop-blur-md shadow-xl rounded-[2.5rem] relative group">
        <h2 className="text-sm md:text-md font-black text-gray-400 mb-2 uppercase tracking-[0.25em]">
          PIN de Juego
        </h2>
        
        {/* PIN con animación de volteo en cada dígito */}
        <div className="text-6xl md:text-8xl font-black text-[#7f0df2] tracking-widest my-4 flex items-center justify-center select-none">
          {(gamePin || "000000").split("").map((digit, i) => (
            <span
              key={i}
              className="inline-block animate-[flip_0.6s_ease-in-out_both] drop-shadow-sm"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {digit}
            </span>
          ))}
        </div>

        {/* Botón de Compartir PIN */}
        <button
          onClick={copyToClipboard}
          className="mt-2 text-sm font-bold text-gray-500 hover:text-[#7f0df2] bg-gray-50 hover:bg-[#7f0df2]/5 border border-gray-100 hover:border-[#7f0df2]/10 py-2 px-4 rounded-full inline-flex items-center gap-2 transition-all cursor-pointer"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
          {copied ? "¡Copiado!" : "Compartir Invitación"}
        </button>
      </Card>

      {/* Cabecera del Listado de Jugadores */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h3 className="text-2xl font-black flex items-center gap-3 text-gray-800">
          <Users className="text-[#7f0df2] w-7 h-7" /> Jugadores unidos:{" "}
          <span className="text-[#7f0df2] bg-[#7f0df2]/10 px-3 py-1 rounded-xl text-xl font-black border border-[#7f0df2]/15">
            {players.length}
          </span>
        </h3>
        {isHost && (
          <Button
            icon={Play}
            size="lg"
            onClick={onStart}
            className="text-xl font-black bg-[#7f0df2] hover:bg-[#6b0bc0] text-white px-8 py-4 rounded-2xl shadow-xl shadow-[#7f0df2]/20 hover:scale-103 active:scale-[0.98] transition-all border-none cursor-pointer"
          >
            ¡Comenzar!
          </Button>
        )}
      </div>

      {/* Listado de Jugadores */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {players.map((p, i) => (
          <div
            key={i}
            className="bg-white hover:bg-gray-50 hover:-translate-y-1 transition-all border border-gray-100 text-gray-800 px-4 py-5 rounded-[2rem] font-bold text-center shadow-md flex flex-col items-center gap-3 relative group animate-in zoom-in duration-300"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Contenedor de Avatar con efecto hover */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7f0df2] to-pink-500 p-0.5 shadow-md transition-all group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                {p.avatarUrl ? (
                  <img
                    src={getFullAvatarUrl(p.avatarUrl)}
                    alt={p.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Nombre del jugador */}
            <span className="text-md font-black tracking-tight text-gray-700 truncate w-full px-2">
              {p.username}
            </span>
          </div>
        ))}

        {players.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 font-extrabold text-xl bg-white/60 backdrop-blur-sm rounded-[2.5rem] border-4 border-dashed border-gray-100">
            <span className="inline-block animate-bounce text-4xl mb-3">⏳</span>
            <p>Esperando a que se unan los jugadores...</p>
            <p className="text-sm font-semibold text-gray-400/80 mt-1">¡Comparte el PIN para empezar la diversión!</p>
          </div>
        )}
      </div>
    </div>
  );
};
