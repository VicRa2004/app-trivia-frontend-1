import { useEffect, useRef, useCallback, useState } from "react";
import { useGameStore } from "../store/useGameStore";

// Singleton para mantener la referencia de la música activa y que no se duplique al renderizar componentes
let currentMusic: HTMLAudioElement | null = null;
let currentMusicType: "lobby" | "battle" | "victory" | null = null;
let isAudioMuted = typeof window !== "undefined" ? localStorage.getItem("audio-muted") === "true" : false;

// Listener global para reproducir la música tan pronto como el usuario interactúe con el documento (soluciona bloqueo de autoplay)
if (typeof window !== "undefined") {
  const handleGlobalInteraction = () => {
    if (isAudioMuted) return;
    if (currentMusic && currentMusic.paused) {
      currentMusic.play()
        .then(() => {
          console.log(`Música (${currentMusicType}) iniciada tras interacción global.`);
        })
        .catch((err) => {
          console.log("Fallo al reproducir música tras interacción global:", err);
        });
    }
  };
  window.addEventListener("click", handleGlobalInteraction, { capture: true, passive: true });
  window.addEventListener("keydown", handleGlobalInteraction, { capture: true, passive: true });
  window.addEventListener("touchstart", handleGlobalInteraction, { capture: true, passive: true });
}

export const useGameAudio = () => {
  const [muted, setMuted] = useState(isAudioMuted);
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
    if (isAudioMuted) return;
    const audio = getAudio(correctAudioRef, "/audio/correct.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const playIncorrect = useCallback(() => {
    if (isAudioMuted) return;
    const audio = getAudio(incorrectAudioRef, "/audio/incorrect.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const playTick = useCallback(() => {
    if (isAudioMuted) return;
    const audio = getAudio(tickAudioRef, "/audio/tick.wav");
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.15; // Un poco más silencioso el tick
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
  }, [getAudio]);

  const startMusic = useCallback((path: string, type: "lobby" | "battle" | "victory") => {
    if (typeof window === "undefined") return;
    if (isAudioMuted) return;

    // Si ya está sonando esta misma música, no hacer nada (a menos que esté pausada)
    if (currentMusic && currentMusicType === type) {
      if (currentMusic.paused) {
        currentMusic.play().catch((err) => {
          console.log(`Intento de reproducir música existente pausada (${type}) falló:`, err);
        });
      }
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
      console.log(`Autoplay de música (${type}) bloqueado por el navegador. Esperando interacción:`, err);
    });
  }, []);

  const startLobbyMusic = useCallback(() => startMusic("/audio/sala_de_espera.mp3", "lobby"), [startMusic]);
  const startBattleMusic = useCallback(() => startMusic("/audio/preguntas.mp3", "battle"), [startMusic]);
  const startVictoryMusic = useCallback(() => startMusic("/audio/victoria.mp3", "victory"), [startMusic]);

  const stopMusic = useCallback(() => {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic = null;
      currentMusicType = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    isAudioMuted = !isAudioMuted;
    setMuted(isAudioMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("audio-muted", String(isAudioMuted));
    }
    if (isAudioMuted) {
      if (currentMusic) {
        currentMusic.pause();
        currentMusic = null;
        currentMusicType = null;
      }
    } else {
      const gameStatus = useGameStore.getState().status;
      if (gameStatus === "lobby") {
        startLobbyMusic();
      } else if (gameStatus === "playing") {
        startBattleMusic();
      } else if (gameStatus === "finished") {
        startVictoryMusic();
      }
    }
  }, [startLobbyMusic, startBattleMusic, startVictoryMusic]);

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
    startVictoryMusic,
    stopMusic,
    toggleMute,
    muted,
  };
};
