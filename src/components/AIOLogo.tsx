
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
        <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="crownGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9370DB" />
              <stop offset="100%" stopColor="#C0C0C0" />
            </linearGradient>
          </defs>
          {/* Geometric Crown Shape */}
          <path 
            d="M40,220 L70,100 L100,180 L130,90 L160,180 L190,110 L220,220 Z" 
            fill="url(#crownGradient)" 
            stroke={variant === 'default' ? '#4B0082' : '#6E4C9F'} 
            strokeWidth="3" 
          />
          {/* Integrated Q element: a circle with a tail */}
          <circle 
            cx="150" 
            cy="170" 
            r="25" 
            fill="none" 
            stroke={variant === 'default' ? '#4B0082' : '#6E4C9F'} 
            strokeWidth="3" 
          />
          <line 
            x1="168" 
            y1="170" 
            x2="200" 
            y2="200" 
            stroke={variant === 'default' ? '#4B0082' : '#6E4C9F'} 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          {/* Crown Decorative Dots */}
          <circle cx="70" cy="100" r="4" fill={variant === 'default' ? '#4B0082' : '#6E4C9F'} />
          <circle cx="130" cy="90" r="4" fill={variant === 'default' ? '#4B0082' : '#6E4C9F'} />
          <circle cx="190" cy="110" r="4" fill={variant === 'default' ? '#4B0082' : '#6E4C9F'} />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
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
