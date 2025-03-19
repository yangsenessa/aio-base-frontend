
import React from 'react';
import { Network, Zap, BrainCircuit, Layers, Atom } from 'lucide-react';
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
        'rounded-lg flex items-center justify-center relative overflow-hidden',
        variant === 'default' 
          ? 'bg-gradient-to-br from-primary via-purple-700 to-blue-900' 
          : 'bg-gradient-to-br from-primary to-purple-900'
      )}>
        {/* Layer 1: Network background */}
        <Network className={cn(
          'absolute opacity-20 text-primary-foreground',
          size === 'sm' ? 'h-10 w-10' : size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
        )} />
        
        {/* Layer 2: Atom decoration */}
        <Atom className={cn(
          'absolute opacity-30 text-blue-300',
          size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
        )} />
        
        {/* Layer 3: Main icon */}
        <BrainCircuit className={cn(
          'absolute text-primary-foreground z-10',
          size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
        )} />
        
        {/* Layer 4: Layered networks */}
        <Layers className={cn(
          'absolute bottom-0 left-0 opacity-60 text-blue-200',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
        )} />
        
        {/* Layer 5: Energy highlight */}
        <Zap className={cn(
          'absolute bottom-0 right-0 text-yellow-300',
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight leading-none bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent",
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
