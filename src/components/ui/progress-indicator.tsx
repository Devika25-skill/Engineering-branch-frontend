
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  steps: number;
  currentStep: number;
  className?: string;
}

export const ProgressIndicator = ({ steps, currentStep, className }: ProgressIndicatorProps) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {Array.from({ length: steps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
              i + 1 <= currentStep
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {i + 1}
          </div>
          {i < steps - 1 && (
            <div
              className={cn(
                "w-12 h-1 mx-2 rounded-full transition-all duration-300",
                i + 1 < currentStep
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
