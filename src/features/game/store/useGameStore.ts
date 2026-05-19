import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface GamePlayer {
  userId?: string;
  username: string;
  score: number;
  avatarUrl?: string;
  avatarName?: string;
}

export interface GameOption {
  id: string;
  content: string;
  imageUrl?: string;
  position?: number;
}

export interface GameQuestion {
  id: string;
  text: string;
  type: string;
  imageUrl?: string;
  points: number;
  timeLimit: number;
  options: GameOption[];
}

export interface PlayerLastResult {
  isCorrect: boolean;
  pointsScored: number;
  newScore: number;
}

interface GameState {
  gamePin: string | null;
  isHost: boolean;
  status: "lobby" | "playing" | "revealed" | "finished";
  players: GamePlayer[];
  currentQuestion: GameQuestion | null;
  questionIndex: number;
  questionTotal: number;
  correctOptions: string[];
  podium: GamePlayer[];
  playerScore: number;
  answerError: string | null;
  answersCount: { answered: number; total: number } | null;
  playerLastResult: PlayerLastResult | null;
  // Acciones
  setGamePin: (pin: string, isHost?: boolean) => void;
  setStatus: (status: GameState["status"]) => void;
  setPlayers: (players: GamePlayer[]) => void;
  setNewQuestion: (q: GameQuestion, index: number, total: number) => void;
  setRevealed: (correctOptions: string[], ranking: GamePlayer[]) => void;
  setFinished: (podium: GamePlayer[]) => void;
  setPlayerScore: (score: number) => void;
  setAnswerError: (error: string | null) => void;
  setAnswersCount: (count: { answered: number; total: number } | null) => void;
  setPlayerLastResult: (result: PlayerLastResult | null) => void;
  resetGame: () => void;
}

const initialState = {
  gamePin: null,
  isHost: false,
  status: "lobby" as const,
  players: [],
  currentQuestion: null,
  questionIndex: 0,
  questionTotal: 0,
  correctOptions: [],
  podium: [],
  playerScore: 0,
  answerError: null,
  answersCount: null,
  playerLastResult: null,
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      ...initialState,

      setGamePin: (pin, isHost = false) => set({ gamePin: pin, isHost }),
      setStatus: (status) => set({ status }),
      setPlayers: (players) => set({ players }),
      setNewQuestion: (q, index, total) =>
        set({
          currentQuestion: q,
          questionIndex: index,
          questionTotal: total,
          status: "playing",
          correctOptions: [],
        }),
      setRevealed: (correctOptions, ranking) =>
        set({
          correctOptions,
          players: ranking,
          status: "revealed",
        }),
      setFinished: (podium) => set({ podium, status: "finished" }),
      setPlayerScore: (score) => set({ playerScore: score }),
      setAnswerError: (error) => set({ answerError: error }),
      setAnswersCount: (count) => set({ answersCount: count }),
      setPlayerLastResult: (result) => set({ playerLastResult: result }),
      resetGame: () => set(initialState),
    }),
    {
      name: "game-state",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        gamePin: state.gamePin,
        isHost: state.isHost,
        status: state.status,
        players: state.players,
        currentQuestion: state.currentQuestion,
        questionIndex: state.questionIndex,
        questionTotal: state.questionTotal,
        correctOptions: state.correctOptions,
        podium: state.podium,
        playerScore: state.playerScore,
        answersCount: state.answersCount,
        playerLastResult: state.playerLastResult,
      }),
    },
  ),
);
