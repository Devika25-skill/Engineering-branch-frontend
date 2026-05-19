// src/components/StepTracker.tsx
import React from 'react';

// Define the properties expected by the component
interface StepTrackerProps {
  step: number;
}

export default function StepTracker({ step }: StepTrackerProps): React.ReactElement {
  // Progress reflects completed steps — 0% while on step 0, 25% after completing it, etc.
  const progress: number = (step / 4) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
          Step {step + 1} of 4
        </span>
        <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
          {Math.round(progress)}% Complete
        </span>
      </div>

      <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100 relative">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out shadow-lg shadow-indigo-100"
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-100%] animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  );
}
