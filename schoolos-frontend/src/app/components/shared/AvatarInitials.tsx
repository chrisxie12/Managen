import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/formatters';

interface AvatarInitialsProps {
  name?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({
  name = '',
  initials: initialsOverride,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const backgroundColor = getAvatarColor(name);
  const initials = initialsOverride || getInitials(name);

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
      title={name}
    >
      {initials}
    </div>
  );
};
