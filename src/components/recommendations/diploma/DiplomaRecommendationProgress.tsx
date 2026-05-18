import { Card, CardContent } from "@/components/ui/card";

interface DiplomaRecommendationProgressProps {
  currentStep: number;
  totalSteps: number;
}

const DiplomaRecommendationProgress = ({ currentStep, totalSteps }: DiplomaRecommendationProgressProps) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg relative z-[10]">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-indigo-600">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
          <div 
            className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500 font-medium">
            Complete your profile to get personalized recommendations
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiplomaRecommendationProgress;