
import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  glass = false,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'rounded-lg p-4 transition-all duration-300 shadow-sm hover:shadow', 
        glass ? 'glass-card' : 'bg-card text-card-foreground border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
