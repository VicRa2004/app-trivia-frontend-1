import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../features/auth/store/useAuthStore";
import { Button } from "./Button";
import { LogOut, User } from "lucide-react";
import { API_URL } from "../config/env";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 cursor-pointer no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-sm">
              T
            </div>
            <span className="font-extrabold tracking-tight text-xl text-text-main hidden sm:inline-block">
              TriviaApp
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light hover:bg-primary-hover transition-colors no-underline"
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
                  onClick={logout}
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

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-10 flex flex-col">
        {children}
      </main>
    </div>
  );
};
