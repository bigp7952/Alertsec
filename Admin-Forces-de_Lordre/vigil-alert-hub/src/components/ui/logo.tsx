import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-14 w-14',
    lg: 'h-18 w-18',
    xl: 'h-22 w-22'
  };

  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <img
        src="/alertsec-logo.png"
        alt="AlertSec Logo"
        className="h-full w-full object-contain"
      />
    </div>
  );
};