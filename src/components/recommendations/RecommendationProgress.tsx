
import { Progress } from "@/components/ui/progress";
import { CheckCircle, User, Heart, Target } from "lucide-react";

interface RecommendationProgressProps {
  currentStep: number;
  totalSteps: number;
}

const RecommendationProgress = ({ currentStep, totalSteps }: RecommendationProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-slate-600">
            {Math.round(progress)}% Complete
          </span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2.5 mb-6 bg-white shadow-sm" />
      
      <div className="flex justify-between items-center">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300 ${
                isCompleted ? 'bg-green-500 text-white shadow-lg scale-105' :
                isActive ? `bg-gradient-to-r ${step.gradient} text-white shadow-lg scale-105` :
                'bg-white text-slate-400 shadow-md'
              }`}>
                {isCompleted ? <CheckCircle size={20} /> : <StepIcon size={20} />}
              </div>
              <h3 className={`text-base font-bold text-center mb-1 ${
                isActive ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {step.title}
              </h3>
              <p className="text-sm text-slate-400 text-center">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationProgress;
