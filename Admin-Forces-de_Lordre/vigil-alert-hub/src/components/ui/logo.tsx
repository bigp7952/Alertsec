import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full bg-primary text-primary-foreground',
      sizeClasses[size],
      className
    )}>
      <svg
        className="h-3/4 w-3/4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
          fill="currentColor"
        />
        <path
          d="M19 15L20.5 19.5L25 21L20.5 22.5L19 27L17.5 22.5L13 21L17.5 19.5L19 15Z"
          fill="currentColor"
          opacity="0.6"
        />
        <path
          d="M5 15L6.5 19.5L11 21L6.5 22.5L5 27L3.5 22.5L-1 21L3.5 19.5L5 15Z"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};