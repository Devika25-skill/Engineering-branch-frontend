
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  className?: string;
}

export const SuccessAnimation = ({ show, message, className }: SuccessAnimationProps) => {
  if (!show) return null;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 animate-scale-in",
      className
    )}>
      <div className="relative">
        <CheckCircle 
          size={64} 
          className="text-green-500 animate-bounce" 
        />
        <div className="absolute inset-0 animate-ping">
          <CheckCircle 
            size={64} 
            className="text-green-400 opacity-75" 
          />
        </div>
      </div>
      {message && (
        <p className="text-lg font-medium text-green-600 text-center animate-fade-in animation-delay-300">
          {message}
        </p>
      )}
    </div>
  );
};
