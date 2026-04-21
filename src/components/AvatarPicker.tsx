import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Card } from './Card';
import type { Avatar } from '../features/users/types';

interface AvatarPickerProps {
  avatars: Avatar[];
  selectedId?: string;
  onSelect: (avatar: Avatar) => void;
  isLoading?: boolean;
}

export const AvatarPicker = ({ avatars, selectedId, onSelect, isLoading }: AvatarPickerProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {avatars.map((avatar) => {
        const isSelected = selectedId === avatar.id;
        const isHovered = hoveredId === avatar.id;

        return (
          <Card
            key={avatar.id}
            className={`
              relative cursor-pointer overflow-hidden transition-all duration-300
              ${isSelected
                ? 'ring-4 ring-primary shadow-lg shadow-primary/30 scale-[1.02]'
                : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20'
              }
            `}
            onClick={() => onSelect(avatar)}
            onMouseEnter={() => setHoveredId(avatar.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="aspect-square relative bg-gradient-to-br from-primary-light/30 to-primary/10 flex items-center justify-center p-4">
              <img
                src={avatar.imageUrl}
                alt={avatar.name}
                className={`
                  w-full h-full object-contain transition-all duration-300
                  ${isHovered ? 'scale-110' : 'scale-100'}
                  ${isSelected ? 'drop-shadow-lg' : ''}
                `}
              />

              {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            <div className={`
              p-3 text-center transition-colors duration-200
              ${isSelected ? 'bg-primary text-white' : 'bg-surface'}
            `}>
              <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-text-main'}`}>
                {avatar.name}
              </p>
            </div>

            {isHovered && !isSelected && (
              <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-in fade-in duration-200" />
            )}
          </Card>
        );
      })}
    </div>
  );
};