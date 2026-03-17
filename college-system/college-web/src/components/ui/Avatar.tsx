/**
 * Avatar Component
 * 
 * Displays user profile images or initials fallback.
 * Includes support for sizing, presence status dots, and an upload trigger mode.
 * Automatically handles generating deterministic background colors for initials.
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

// Map sizes to pixel dimensions for consistent aspect ratios
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

// Deterministic colors for initials
const colorSchemes = [
  'bg-[var(--primary)]/15 text-[var(--primary)]', // teal
  'bg-[var(--gold)]/15 text-[#B48B30]',           // gold (darker text variant)
  'bg-[#7C3AED]/15 text-[#7C3AED]',               // purple
  'bg-[#2563EB]/15 text-[#2563EB]',               // blue
  'bg-[#E11D48]/15 text-[#E11D48]',               // rose
];

// Simple hash function for consistent color generation
const hashName = (name: string): number => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Extract 1-2 characters for initials
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
    sizeMap[size],
    showInitials ? activeColorScheme : 'bg-[var(--surface-hover)]',
    (onClick || uploadable) && 'cursor-pointer hover:opacity-85 transition-opacity duration-200',
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
          <span>{initials}</span>
        )}

        {/* Upload Overlay */}
        {uploadable && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Camera className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Status Dot Overlay */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-[var(--surface)]',
            statusDotSizeMap[size],
            {
              'bg-[var(--success)]': status === 'online',
              'bg-[var(--warning)]': status === 'away',
              'bg-[#9CA3AF]': status === 'offline', // gray-400
            }
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
}
