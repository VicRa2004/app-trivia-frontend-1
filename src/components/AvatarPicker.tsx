import { useState, useRef, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { Card } from "./Card";
import type { Avatar } from "../features/users/types";
import { API_URL } from "../config/env";

interface AvatarPickerProps {
  avatars: Avatar[];
  selectedId?: string;
  onSelect: (avatar: Avatar) => void;
  isLoading?: boolean;
}

export const AvatarPicker = ({
  avatars,
  selectedId,
  onSelect,
  isLoading,
}: AvatarPickerProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (avatars.length > 0 && avatarRefs.current[focusedIndex]) {
      avatarRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, avatars.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!avatars || avatars.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        No hay avatares disponibles
      </div>
    );
  }

  const cols = 4;
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let newIdx = idx;
    if (e.key === 'ArrowRight') newIdx = Math.min(idx + 1, avatars.length - 1);
    else if (e.key === 'ArrowLeft') newIdx = Math.max(idx - 1, 0);
    else if (e.key === 'ArrowDown') newIdx = Math.min(idx + cols, avatars.length - 1);
    else if (e.key === 'ArrowUp') newIdx = Math.max(idx - cols, 0);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(avatars[idx]);
      return;
    }
    if (newIdx !== idx) {
      e.preventDefault();
      setFocusedIndex(newIdx);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" role="grid" aria-label="Seleccionar avatar">
      {avatars.map((avatar, idx) => {
        const isSelected = selectedId === avatar.id;
        const isHovered = hoveredId === avatar.id;

        return (
          <div
            key={avatar.id}
            ref={(el) => { avatarRefs.current[idx] = el; }}
            onClick={() => onSelect(avatar)}
            onMouseEnter={() => setHoveredId(avatar.id)}
            onMouseLeave={() => setHoveredId(null)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            tabIndex={0}
            role="gridcell"
            aria-selected={isSelected}
            className="cursor-pointer"
          >
            <Card
              className={`
                relative overflow-hidden transition-all duration-300 outline-none
                ${isSelected ? "ring-4 ring-primary shadow-lg shadow-primary/30 scale-[1.02]" : "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"}
              `}
            >
              <div className="aspect-square relative bg-gradient-to-br from-primary-light/30 to-primary/10 flex items-center justify-center p-4">
                <img
                  src={`${API_URL}/public${avatar.imageUrl}`}
                  alt={avatar.name}
                  className={`
                    w-full h-full object-contain transition-all duration-300
                    ${isHovered ? "scale-110" : "scale-100"}
                    ${isSelected ? "drop-shadow-lg" : ""}
                  `}
                  loading="lazy"
                />

                {isSelected && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div
                className={`
                p-3 text-center transition-colors duration-200
                ${isSelected ? "bg-primary text-white" : "bg-surface"}
              `}
              >
                <p
                  className={`font-bold text-sm truncate ${isSelected ? "text-white" : "text-text-main"}`}
                >
                  {avatar.name}
                </p>
              </div>

              {isHovered && !isSelected && (
                <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-in fade-in duration-200" />
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
};