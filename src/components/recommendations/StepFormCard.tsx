import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { User, Heart, Target } from "lucide-react";

interface StepFormCardProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  onGenerateRecommendations: () => void;
  isGenerating: boolean;
}

const StepFormCard = ({ 
  currentStep, 
  totalSteps, 
  children, 
  onNext, 
  onPrevious, 
  onGenerateRecommendations, 
  isGenerating 
}: StepFormCardProps) => {
  const steps = [
    {
      number: 1,
      title: "Academic Profile",
      description: "Tell us about your academic journey",
      icon: User,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      number: 2,
      title: "Preferences",
      description: "What are you looking for?",
      icon: Heart,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      number: 3,
      title: "Priorities",
      description: "What matters most to you?",
      icon: Target,
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const currentStepInfo = steps[currentStep - 1];

  return (
    <Card className="shadow-2xl border-0 bg-white backdrop-blur-sm rounded-3xl overflow-hidden relative z-[25]">
      <div className={`h-2 bg-gradient-to-r ${currentStepInfo.gradient}`}></div>
      
      <div className="p-4 sm:p-8 lg:p-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${currentStepInfo.gradient} text-white mb-4`}>
            <currentStepInfo.icon size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            {currentStepInfo.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 px-2">
            {currentStepInfo.description}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 relative z-[30]">
          {children}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100 relative z-[5]">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 1}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 rounded-xl border-2 hover:shadow-lg transition-all duration-200 font-medium text-base h-12"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={onNext}
              className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 rounded-xl bg-gradient-to-r ${currentStepInfo.gradient} hover:shadow-xl transition-all duration-200 text-white font-bold text-base sm:text-lg h-12`}
            >
              Continue
              <ArrowRight size={18} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onGenerateRecommendations}
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl transition-all duration-200 text-white font-bold text-base sm:text-lg h-12"
            >
              <Sparkles size={20} className="mr-3" />
              <span className="hidden sm:inline">Get My Recommendations! 🚀</span>
              <span className="sm:hidden">Get Recommendations! 🚀</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StepFormCard;
