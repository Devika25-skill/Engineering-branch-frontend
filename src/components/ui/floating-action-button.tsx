
import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const FloatingActionButton = ({ 
  icon: Icon, 
  onClick, 
  className,
  children 
}: FloatingActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50",
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
        className
      )}
      size="icon"
    >
      <Icon size={24} className="text-white" />
      {children}
    </Button>
  );
};
