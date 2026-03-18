/**
 * Avatar Component
 * Polished profile display with hover ring, pulsing status, upload overlay,
 * and AvatarGroup sub-component for overlapping stacks.
 */

import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  uploadable?: boolean;
  onUploadClick?: () => void;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const statusDotSizeMap = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
  xl: 'h-5 w-5',
};

const colorSchemes = [
  'bg-[var(--primary)]/15 text-[var(--primary)]',
  'bg-[var(--gold)]/15 text-[var(--gold-dark)]',
  'bg-[#7C3AED]/15 text-[#7C3AED]',
  'bg-[#2563EB]/15 text-[#2563EB]',
  'bg-[#E11D48]/15 text-[#E11D48]',
];

const hashName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const getInitials = (name: string): string => {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function Avatar({
  name,
  src,
  size = 'md',
  status,
  uploadable = false,
  onUploadClick,
  onClick,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showInitials = !src || imgError;

  const colorIndex = hashName(name) % colorSchemes.length;
  const activeColorScheme = colorSchemes[colorIndex];
  const initials = getInitials(name);

  const containerClasses = cn(
    'relative inline-flex items-center justify-center shrink-0 rounded-full font-body font-semibold overflow-hidden select-none',
    'transition-all duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
    'ring-2 ring-transparent',
    sizeMap[size],
    showInitials ? activeColorScheme : 'bg-[var(--surface-alt)]',
    (onClick || uploadable) && 'cursor-pointer hover:ring-[var(--primary)]/40',
    className
  );

  const handleClick = () => {
    if (uploadable && onUploadClick) {
      onUploadClick();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative inline-block">
      <div
        className={containerClasses}
        onClick={handleClick}
        role={(onClick || uploadable) ? 'button' : 'img'}
        aria-label={`Avatar for ${name}`}
        tabIndex={(onClick || uploadable) ? 0 : undefined}
      >
        {!showInitials ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="leading-none">{initials}</span>
        )}

        {/* Upload Overlay */}
        {uploadable && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-all duration-[180ms] group/upload">
            <Camera className="h-4 w-4 text-white opacity-0 group-hover/upload:opacity-100 transition-opacity duration-[180ms]" />
          </div>
        )}
      </div>

      {/* Status Dot */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--surface)]',
            statusDotSizeMap[size],
            {
              'bg-[#10B981] animate-pulse-dot': status === 'online',
              'bg-[#F59E0B]': status === 'away',
              'bg-[#9CA3AF]': status === 'offline',
            }
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}

/** AvatarGroup — overlapping stack of avatars with +N counter */
export interface AvatarGroupProps {
  avatars: { name: string; src?: string }[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
  max?: number;
  className?: string;
}

export function AvatarGroup({ avatars, size = 'md', max = 4, className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const overlapMap = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
  };

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((avatar, i) => (
        <div
          key={i}
          className={cn(
            'relative ring-2 ring-[var(--surface)] rounded-full',
            i > 0 && overlapMap[size]
          )}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={avatar.name} src={avatar.src} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--surface)] flex items-center justify-center font-body font-semibold text-[var(--text-muted)]',
            overlapMap[size],
            sizeMap[size]
          )}
          style={{ zIndex: 0 }}
        >
          <span className="text-[10px]">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

export default Avatar;
