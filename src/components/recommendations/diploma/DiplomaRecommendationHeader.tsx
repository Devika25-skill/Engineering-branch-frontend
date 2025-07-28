import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface DiplomaRecommendationHeaderProps {
  formData: any;
}

export const DiplomaRecommendationHeader = ({ formData }: DiplomaRecommendationHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4">
        <Sparkles className="text-white" size={28} />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
        Direct Second Year Engineering
      </h1>
      <p className="text-gray-600 text-lg">
        Get personalized college recommendations for diploma holders
      </p>
    </div>
  );
};