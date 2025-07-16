
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { RecommendationResults as ResultsComponent } from "@/components/recommendations/RecommendationResults";

import { Link, useNavigate } from "react-router-dom";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from "@/components/recommendations/StepLoadingMessages";
import { useRecommendation } from "@/hooks/useRecommendation";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useFeedbackTimer } from "@/hooks/useFeedbackTimer";

const RecommendationResults = () => {
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { generateRecommendation, isLoggedIn } = useRecommendation();
  const { showFeedback, handleClose, handleSkipSession } = useFeedbackTimer();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // First try to get cached recommendations
        const cachedRecommendations = sessionStorage.getItem('cachedRecommendations');
        const storedFormData = sessionStorage.getItem('recommendationFormData');
        
        if (cachedRecommendations && storedFormData) {
          const parsedRecommendations = JSON.parse(cachedRecommendations);
          const parsedFormData = JSON.parse(storedFormData);
          
          setRecommendations(parsedRecommendations);
          setFormData(parsedFormData);
          setIsLoading(false);
          return;
        }

        // If no cached data, check if we have form data and should generate
        const formDataFromStorage = recommendationStorage.getFormData();
        if (formDataFromStorage && isLoggedIn) {
          setFormData(formDataFromStorage);
          setIsGenerating(true);
          
          try {
            const result = await generateRecommendation(formDataFromStorage);

            if (result && result.success) {
              setRecommendations(result.recommendations || []);
              setRecommendationId(result.recommendation_id);
            } else {
              console.error('❌ Failed to generate recommendations');
            }
          } catch (error) {
            console.error('Error generating recommendations:', error);
          } finally {
            setIsGenerating(false);
            setIsLoading(false);
          }
          return;
        }

    
        navigate('/recommendations/steps');
      } catch (error) {
        navigate('/recommendations/steps');
      }
    };

    loadRecommendations();
  }, []);

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <StepLoadingMessages />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-1 sm:mb-1">
          <Link to="/recommendations/steps">
            <Button variant="outline" className="rounded-lg hover:shadow-md transition-all duration-200 w-full sm:w-auto">
              <ArrowLeft size={16} className="mr-2" />
              Back to Form
            </Button>
          </Link>
        </div>

        <ResultsComponent 
          recommendations={recommendations || []} 
          formData={formData}
          recommendationId={recommendationId}
        />
        
        {/* Feedback Section */}
        <div className="mt-12 mb-8">
          <FeedbackSection />
        </div>
      </div>

      {/* Feedback Dialog
      <FeedbackDialog
        isOpen={showFeedback}
        onClose={handleClose}
        onSkipSession={handleSkipSession}
      /> */}
    </div>
  );
};

export default RecommendationResults;
