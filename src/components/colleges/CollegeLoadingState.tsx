
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Sparkles } from 'lucide-react';

const CollegeCardSkeleton = () => (
  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
    <CardContent className="p-4">
      <div className="flex gap-3 mb-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-2 rounded-lg bg-gray-50">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const loadingMessages = [
  "Finding the perfect colleges just for you...",
  "AI is analyzing the best colleges for your profile...",
  "Curating top engineering colleges based on your preferences..."
];

const CollegeLoadingState = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Loading Message */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 animate-fade-in">
        <div className="relative">
          <Brain className="animate-pulse text-purple-600" size={32} />
          <div className="absolute inset-0 animate-spin">
            <Sparkles className="text-pink-400" size={32} />
          </div>
        </div>
        <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
          {loadingMessages[currentMessageIndex]}
        </span>
      </div>

      {/* Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
        {[...Array(6)].map((_, i) => (
          <CollegeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default CollegeLoadingState;
