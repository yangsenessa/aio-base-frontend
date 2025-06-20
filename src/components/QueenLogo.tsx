
import React from 'react';
import { cn } from '@/lib/utils';

interface QueenLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'sidebar';
  showText?: boolean;
  className?: string;
}

const QueenLogo = ({ 
  size = 'md', 
  variant = 'default',
  showText = true,
  className 
}: QueenLogoProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      case 'md':
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getTextSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      case 'xl': return 'text-lg';
      case 'md':
      default: return 'text-sm';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        getSizeClass(),
        'relative flex items-center justify-center flex-shrink-0'
      )}>
        <img 
          src="/newlogo.png" 
          alt="Queen Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "font-bold tracking-tight leading-none text-foreground",
            getTextSizeClass()
          )}>
            Queen ALAYA
          </span>
        </div>
      )}
    </div>
  );
};

export default QueenLogo; 
