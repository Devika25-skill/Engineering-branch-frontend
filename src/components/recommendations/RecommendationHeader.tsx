
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { RESERVATION_CATEGORIES } from "@/services/cutoffService";

interface RecommendationHeaderProps {
  formData: any;
  recommendationId?: string | null;
}

export const RecommendationHeader = ({ formData, recommendationId }: RecommendationHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
        <Sparkles className="text-white" size={28} />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
        Your Personalized Recommendations
      </h1>
    </div>
  );
};
