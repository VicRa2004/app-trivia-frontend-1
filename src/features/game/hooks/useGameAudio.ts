import { useEffect, useRef, useCallback } from "react";

// Singleton para mantener la referencia de la música activa y que no se duplique al renderizar componentes
let currentMusic: HTMLAudioElement | null = null;
let currentMusicType: "lobby" | "battle" | null = null;

export const useGameAudio = () => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar efectos de sonido de forma perezosa en el cliente
  const getAudio = useCallback((ref: React.MutableRefObject<HTMLAudioElement | null>, path: string) => {
    if (typeof window === "undefined") return null;
    if (!ref.current) {
      ref.current = new Audio(path);
      ref.current.volume = 0.4;
    }
    return ref.current;
  }, []);

  const playCorrect = useCallback(() => {
    const audio = getAudio(correctAudioRef, "/audio/correct.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const playIncorrect = useCallback(() => {
    const audio = getAudio(incorrectAudioRef, "/audio/incorrect.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const playTick = useCallback(() => {
    const audio = getAudio(tickAudioRef, "/audio/tick.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.15; // Un poco más silencioso el tick
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const startMusic = useCallback((path: string, type: "lobby" | "battle") => {
    if (typeof window === "undefined") return;

    // Si ya está sonando esta misma música, no hacer nada
    if (currentMusic && currentMusicType === type) {
      return;
    }

    // Detener la música anterior si existiera
    if (currentMusic) {
      currentMusic.pause();
      currentMusic = null;
    }

    const music = new Audio(path);
    music.loop = true;
    music.volume = 0.2; // Música de fondo suave
    currentMusic = music;
    currentMusicType = type;

    music.play().catch((err) => {
      // Los navegadores a veces bloquean el autoplay si el usuario no ha interactuado
      console.log("Autoplay de música bloqueado por el navegador. Esperando interacción:", err);
    });
  }, []);

  const startLobbyMusic = useCallback(() => startMusic("/audio/lobby.wav", "lobby"), [startMusic]);
  const startBattleMusic = useCallback(() => startMusic("/audio/battle.wav", "battle"), [startMusic]);

  const stopMusic = useCallback(() => {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic = null;
      currentMusicType = null;
    }
  }, []);

  // Limpiar referencias locales al desmontar el componente (opcional)
  useEffect(() => {
    return () => {
      // No detenemos la música global aquí porque queremos que continúe sonando
      // entre pantallas (de Lobby a Juego por ejemplo)
    };
  }, []);

  return {
    playCorrect,
    playIncorrect,
    playTick,
    startLobbyMusic,
    startBattleMusic,
    stopMusic,
  };
};
