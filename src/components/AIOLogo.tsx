
import React from 'react';
import { cn } from '@/lib/utils';

interface AIOLogoProps {
  size?: 'sm' | 'md' | 'lg';
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
      case 'sm': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-12 h-12 text-xl';
      case 'md':
      default: return 'w-10 h-10 text-base';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        getSizeClass(),
        'relative flex items-center justify-center'
      )}>
        <img 
          src="/lovable-uploads/f98e15ee-8d13-4fcb-ba65-55c7975908bc.png" 
          alt="AIO Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
          <span className={cn(
            "font-bold tracking-tight leading-none text-foreground",
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
          )}>
            AIO-2030
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground">AI Agent Network</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AIOLogo;
