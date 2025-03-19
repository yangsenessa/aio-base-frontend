
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
        'rounded-full flex items-center justify-center relative overflow-hidden',
        variant === 'default' 
          ? 'bg-purple-600' 
          : 'bg-purple-700'
      )}>
        {/* Simple text logo */}
        <span className="font-bold text-white">
          {size === 'sm' ? 'A' : 'AIO'}
        </span>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight leading-none text-foreground",
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
          )}>
            AIO-center
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
