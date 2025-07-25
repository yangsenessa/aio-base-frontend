
import React from 'react';
import { cn } from '@/lib/utils';

interface AIOLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'sidebar';
  showText?: boolean;
  className?: string;
}

const AIOLogo = ({ 
  size = 'md', 
  variant = 'default',
  showText = true,
  className 
}: AIOLogoProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      case 'md':
      default: return 'w-10 h-10 text-base';
    }
  };

  const getTextSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case 'md':
      default: return 'text-base';
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        getSizeClass(),
        'relative flex items-center justify-center flex-shrink-0'
      )}>
        <img 
          src="/newlogo.png" 
          alt="AIO Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "font-bold tracking-tight leading-none text-foreground",
            getTextSizeClass()
          )}>
             ALAYA
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground leading-tight">Agentic AI Developer Hub</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AIOLogo;
