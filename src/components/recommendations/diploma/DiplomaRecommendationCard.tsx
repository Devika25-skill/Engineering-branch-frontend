import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollegeRecommendation } from "@/services/cutoffService";
import { MapPin, Users, DollarSign, TrendingUp, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface DiplomaRecommendationCardProps {
  recommendation: CollegeRecommendation;
  index: number;
}

export const DiplomaRecommendationCard = ({ recommendation, index }: DiplomaRecommendationCardProps) => {
  const { college, course_name, category, admission_probability, probability_message, cutoff_percentile } = recommendation;
  const recommendationFormData = JSON.parse(sessionStorage.getItem('diplomaRecommendationFormData') || '{}');
  const { diplomaPercentage } = recommendationFormData;

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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCollegeClick = () => {
    sessionStorage.setItem('navigationSource', 'diploma-recommendations');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative">
      <CardHeader className="pb-2">
        <div className="flex gap-3 pr-16 sm:pr-20">
          {/* Index Number */}
          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {index}
          </div>

          {/* College Logo */}
          <div className="flex-shrink-0">
            {college.logo ? (
              <img
                src={college.logo}
                alt={`${college.name} logo`}
                className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                <span className="text-gray-600 text-xs font-bold">
                  {college.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <Link
                  to={`/college/${college.SJ_Institute_code || college.id}`}
                  onClick={handleCollegeClick}
                  className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors block leading-tight line-clamp-1"
                >
                  {college.name}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <MapPin size={12} />
                  <span className="truncate">{college.city}</span>
                  {college.rating && (
                    <>
                      <span>•</span>
                      <span>⭐ {college.rating}/5</span>
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
                <span className="font-medium">Course:</span> {course_name}
                {cutoff_percentile && (
                  <span className="ml-2 text-blue-700">• Cutoff: {cutoff_percentile}%ile</span>
                )}
              </div>
            </div>

            {/* Metrics Row */}
            <div className="flex gap-2 mb-2 text-xs">
              {college.fees && (
                <div className="bg-green-50 rounded-md px-2 py-1 border border-green-100 flex-1">
                  <div className="flex items-center gap-1">
                    {/* <DollarSign size={10} className="text-green-600" /> */}
                    <span className="font-medium text-green-800 truncate">{formatCurrency(college.fees)}</span>
                  </div>
                </div>
              )}

              {college.placement && (
                <div className="bg-purple-50 rounded-md px-2 py-1 border border-purple-100 flex-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-purple-600" />
                    <span className="font-medium text-purple-800">{college.placement}%</span>
                  </div>
                </div>
              )}

              {college.Student_Intake && (
                <div className="bg-blue-50 rounded-md px-2 py-1 border border-blue-100 flex-1">
                  <div className="flex items-center gap-1">
                    <Users size={10} className="text-blue-600" />
                    <span className="font-medium text-blue-800">{college.Student_Intake}</span>
                  </div>
                </div>
              )}
            </div>
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
              <>
             
              <p className="text-xs text-gray-600 line-clamp-1">{recommendationFormData.diplomaPercentage ? `Your Diploma Percentage: ${recommendationFormData.diplomaPercentage}%` : ''} </p>
              <p className="text-xs text-gray-600 line-clamp-1">{recommendationFormData.reservationCategory ? ` Reservation Category: ${recommendationFormData.reservationCategory}` : ''}</p>
            </> )}
          </div>
        </div>

        {/* Compact View Details Button - Positioned at top right */}
        <div className="absolute top-3 right-3">
          <Link
            to={`/college/${college.SJ_Institute_code || college.id}`}
            onClick={handleCollegeClick}
          >
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all duration-200 flex items-center gap-1"
            >
              {/* <span className="hidden sm:inline">View</span> */}
              <ExternalLink size={12} />
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
};