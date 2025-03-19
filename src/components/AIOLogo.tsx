
import React from 'react';
import { Network, Zap, BrainCircuit } from 'lucide-react';
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
        variant === 'default' ? 'bg-gradient-to-br from-primary/90 to-purple-800' : 'bg-primary'
      )}>
        {/* Main icon */}
        <BrainCircuit className={cn(
          'absolute text-primary-foreground z-10',
          size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
        )} />
        
        {/* Background decoration */}
        <Network className={cn(
          'absolute opacity-20 text-primary-foreground',
          size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        )} />
        
        {/* Highlight */}
        <Zap className={cn(
          'absolute bottom-0 right-0 text-yellow-300',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight leading-none",
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
