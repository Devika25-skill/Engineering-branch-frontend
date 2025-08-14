import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, ExternalLink } from "lucide-react";

interface IntegratedRecommendation {
  category: string;
  college: {
    id: number;
    name: string;
    city: string;
    logo: string | null;
    website: string;
    type: string;
    nirf_rank: number | null;
    fees: number | null;
    placement_percentage: number | null;
    top_recruiters: string[];
  };
  course_name: string;
  cutoff_percentile: number;
  admission_probability: number;
  probability_message: string;
  cet_percentile: number;
  reservation_category: string;
  choice_code: string;
}

interface IntegratedRecommendationCardProps {
  recommendation: IntegratedRecommendation;
  index: number;
}

export const IntegratedRecommendationCard = ({
  recommendation,
  index
}: IntegratedRecommendationCardProps) => {
  // Add defensive logging to understand the data structure

  const {
    college,
    course_name,
    cutoff_percentile,
    admission_probability,
    probability_message,
    cet_percentile,
    reservation_category,
    category,
    choice_code
  } = recommendation;

  // Utility function to truncate college names
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Dream": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Reach": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Match": return "bg-green-100 text-green-800 border-green-200";
      case "Safety": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Index Number - Smaller and cleaner */}
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-xs">
            {index}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1" title={college?.name || "Unknown College"}>
                  {truncateText(college?.name || "Unknown College", 100)}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={10} />
                  <span>{truncateText(college?.city || "Unknown Location", 20)}</span>
                  {college?.id && (
                    <>
                      <span className="mx-1">•</span>
                      <span>College Code: {college.id}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge className={`${getCategoryColor(category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
                {category}
              </Badge>
            </div>

            {/* Course Info - More compact */}
            <div className="bg-blue-50 rounded-lg p-2 mb-2">
              <div className="text-xs">
                <div className="font-medium text-blue-900 mb-1" title={course_name || "Unknown Course"}>
                  {truncateText(course_name || "Unknown Course", 50)}
                </div>
                <div className="flex flex-wrap gap-1">
                  {choice_code && (
                    <span className="text-blue-700 bg-blue-200 px-1.5 py-0.5 rounded text-xs">
                      Choice Code: {choice_code}
                    </span>
                  )}
                  {cutoff_percentile && (
                    <span className="text-blue-700 bg-blue-200 px-1.5 py-0.5 rounded text-xs">
                      Previouis Year Cutoff: {cutoff_percentile}%ile
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats - Simplified */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-1 font-medium">{reservation_category || "General"}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Your Admission Chances:</span>
                  <span className={`ml-1 font-semibold ${getProbabilityColor(admission_probability)}`}>
                    {admission_probability || "N/A"}% 
                    <span className="ml-1 font-medium">- {probability_message.split("-")[0].split("chances")[0] || ""}</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </CardHeader>
    </Card>
  );
};