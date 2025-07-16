
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
import { capRecommendationService } from "@/services/capRecommendationService";

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
        // If user is logged in, try to fetch data from API or cache
        if (isLoggedIn) {
          setIsLoading(true);
          
          const result = await capRecommendationService.checkAndFetchData();
          
          if (result.success) {
            setRecommendations(result.recommendations || []);
            setFormData(result.formData);
            setIsLoading(false);
            return;
          } else if (result.error === 'NO_DATA') {
            // No previous data found, redirect to form
            console.log('📝 No previous data found, redirecting to form');
            navigate('/recommendations/steps');
            return;
          } else {
            // API error, check if we have form data in storage as fallback
            console.log('⚠️ API error, checking local storage fallback');
          }
        }

        // Fallback: check local storage for form data
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

        // No data available, redirect to form
        navigate('/recommendations/steps');
      } catch (error) {
        console.error('Error loading recommendations:', error);
        navigate('/recommendations/steps');
      }
    };

    loadRecommendations();
  }, [isLoggedIn, generateRecommendation, navigate]);

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
