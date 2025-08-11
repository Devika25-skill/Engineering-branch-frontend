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
  console.log('IntegratedRecommendationCard received:', { recommendation, index });
  
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Dream': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Reach': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Match': return 'bg-green-100 text-green-800 border-green-200';
      case 'Safety': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative">
      <CardHeader className="pb-2">
        <div className="flex gap-3 pr-16 sm:pr-20">
          {/* Index Number */}
          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {index}
          </div>

          {/* College Logo Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
              <span className="text-gray-600 text-xs font-bold">
                {college?.name?.charAt(0) || '?'}
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-1">
                  {college?.name || 'Unknown College'}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <MapPin size={12} />
                  <span className="truncate">{college?.city || 'Unknown Location'}</span>
                  {college?.id && (
                    <>
                      <span>•</span>
                      <span>Code: {college.id}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge className={`${getCategoryColor(category)} px-2 py-1 text-xs font-medium flex-shrink-0`}>
                {category}
              </Badge>
            </div>

            {/* Course Info */}
            <div className="bg-blue-50 rounded-md p-2 mb-2">
              <div className="text-xs text-blue-900">
                <span className="font-medium">Course:</span> {course_name || 'Unknown Course'}
                {choice_code && (
                  <span className="ml-2 text-blue-700">• Code: {choice_code}</span>
                )}
                {cutoff_percentile && (
                  <span className="ml-2 text-blue-700">• Cutoff: {cutoff_percentile}%ile</span>
                )}
              </div>
            </div>

            {/* CET Percentile Info */}
            {cet_percentile && (
              <div className="bg-green-50 rounded-md p-2 mb-2">
                <div className="text-xs text-green-900">
                  <TrendingUp size={12} className="inline mr-1" />
                  <span className="font-medium">CET Percentile:</span> {cet_percentile}%
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admission Probability */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mt-2">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-800">Admission Chances</span>
              <span className={`text-lg font-bold ${getProbabilityColor(admission_probability)}`}>
                {admission_probability}%
              </span>
            </div>
            {probability_message && (
              <p className="text-xs text-gray-600 line-clamp-2">{probability_message}</p>
            )}
          </div>
        </div>

        {/* View Details Button - Positioned at top right */}
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all duration-200 flex items-center gap-1"
          >
            <ExternalLink size={12} />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};