import React from 'react';
import type { AvatarId } from '../types/user';
import {
  PenLine,
  Wind,
  Sparkles,
  Mountain,
  Compass,
  Feather,
  User,
} from 'lucide-react';

interface FlatAvatarProps {
  id?: AvatarId | string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AVATAR_ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  ink: PenLine,
  bamboo: Feather,
  wind: Wind,
  aurora: Sparkles,
  nebula: Compass,
  mountain: Mountain,
};

export const FlatAvatar: React.FC<FlatAvatarProps> = ({
  id,
  className = '',
  size = 'md',
}) => {
  const IconComponent = (id && AVATAR_ICON_MAP[id]) || User;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      aria-hidden="true"
    >
      <IconComponent className={sizeClasses} strokeWidth={1.5} />
    </span>
  );
};
