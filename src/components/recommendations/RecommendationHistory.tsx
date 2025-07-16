
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, MapPin, Trash2, Eye } from "lucide-react";
import { recommendationStorage } from "@/services/recommendationStorage";
import { useNavigate } from "react-router-dom";

interface RecommendationHistoryProps {
  onLoadFormData: (formData: any) => void;
}

export const RecommendationHistory = ({ onLoadFormData }: RecommendationHistoryProps) => {
  const [history, setHistory] = useState(recommendationStorage.getHistory());
  const navigate = useNavigate();

  const handleViewRecommendation = (recommendation: any) => {
    // Store the recommendation data in session storage
    sessionStorage.setItem('recommendationFormData', JSON.stringify(recommendation.formData));
    sessionStorage.setItem('cachedRecommendations', JSON.stringify(recommendation.recommendations));
    navigate('/recommendations/results');
  };

  const handleLoadFormData = (formData: any) => {
    onLoadFormData(formData);
  };

  const handleDeleteRecommendation = (id: string) => {
    recommendationStorage.deleteRecommendation(id);
    setHistory(recommendationStorage.getHistory());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.recommendations.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Previous Recommendations</h3>
          <p className="text-gray-600 text-sm">
            Your recommendation history will appear here after you generate your first recommendation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Recommendations</h3>
      
      <div className="grid gap-3">
        {history.recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(recommendation.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recommendation.formData.preferredStreams?.slice(0, 2).map((stream: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {stream}
                      </Badge>
                    ))}
                    {recommendation.formData.preferredStreams?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{recommendation.formData.preferredStreams.length - 2} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={12} />
                    <span>
                      {recommendation.formData.preferredCities?.slice(0, 2).join(', ')}
                      {recommendation.formData.preferredCities?.length > 2 && 
                        ` +${recommendation.formData.preferredCities.length - 2} more`
                      }
                    </span>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  {recommendation.recommendations.length} colleges
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewRecommendation(recommendation)}
                  className="flex-1 text-xs"
                >
                  <Eye size={14} className="mr-1" />
                  View Results
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadFormData(recommendation.formData)}
                  className="flex-1 text-xs"
                >
                  <BookOpen size={14} className="mr-1" />
                  Load Form
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteRecommendation(recommendation.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
