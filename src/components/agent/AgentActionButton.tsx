
import React, { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AgentActionButtonProps extends ButtonProps {
  icon?: LucideIcon;
  children: ReactNode;
}

const AgentActionButton = ({ 
  icon: Icon, 
  children, 
  variant = "outline", 
  size = "sm",
  className = '',
  ...props 
}: AgentActionButtonProps) => {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`gap-1 ${className}`}
      {...props}
    >
      {Icon && <Icon size={14} />}
      {children}
    </Button>
  );
};

export default AgentActionButton;
