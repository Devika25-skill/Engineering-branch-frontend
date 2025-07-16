
import { useState, useEffect } from 'react';
import { Sparkles, Brain, Target } from 'lucide-react';

const loadingMessages = [
  "Building your personalized profile...",
  "Analyzing your academic preferences...",
  "Finding the perfect colleges for you...",
  "Customizing recommendations based on your priorities..."
];

const StepLoadingMessages = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 animate-fade-in">
      <div className="relative">
        <Brain className="animate-pulse text-purple-600" size={24} />
        <div className="absolute inset-0 animate-spin">
          <Sparkles className="text-pink-400" size={24} />
        </div>
      </div>
      <span className="text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center px-4">
        {loadingMessages[currentMessageIndex]}
      </span>
    </div>
  );
};

export default StepLoadingMessages;
