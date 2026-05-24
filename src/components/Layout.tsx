import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import { useGameStore } from "../features/game/store/useGameStore";
import { Button } from "./Button";
import { LogOut, User, Sun, Moon, History } from "lucide-react";
import { API_URL } from "../config/env";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();
  const resetGame = useGameStore((state) => state.resetGame);
  const [isDark, setIsDark] = React.useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 cursor-pointer no-underline group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow duration-300">
              T
            </div>
            <span className="font-extrabold tracking-tight text-xl text-text-main hidden sm:inline-block">
              TriviaApp
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={isDark ? "Modo claro" : "Modo oscuro"}
              className="text-text-muted hover:text-primary rounded-full"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user ? (
              <>
                <Link
                  to="/history"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light hover:bg-primary/20 transition-colors no-underline text-primary"
                  title="Historial de partidas"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-bold hidden md:inline">
                    Historial
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light hover:bg-primary/20 transition-colors no-underline"
                >

                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                    {user.avatar?.imageUrl ? (
                      <img
                        src={`${API_URL}/public${user.avatar.imageUrl}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary hidden md:inline">
                    {user.username}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();
                    resetGame();
                  }}
                  title="Cerrar Sesión"
                  className="text-text-muted hover:text-red-500 rounded-full"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <span className="text-sm font-semibold text-text-muted">
                Invitado
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-10 flex flex-col bg-mesh-primary">
        {children}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-sm text-text-muted">
          <span>TriviaApp 2024</span>
          <div className="flex items-center gap-1">
            <span>Hecho con</span>
            <span className="text-red-500">♥</span>
            <span>y código</span>
          </div>
        </div>
      </footer>
    </div>
  );
};