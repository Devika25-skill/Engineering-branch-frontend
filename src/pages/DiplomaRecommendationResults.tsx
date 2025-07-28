import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { DiplomaRecommendationResults as ResultsComponent } from "@/components/recommendations/diploma/DiplomaRecommendationResults";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "@/services/api";
import StepLoadingMessages from "@/components/recommendations/StepLoadingMessages";
import { useAuth } from "@/contexts/AuthContext";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useFeedbackTimer } from "@/hooks/useFeedbackTimer";
import { toast } from "sonner";

interface DiplomaFormData {
  diplomaPercentage?: number;
  reservationCategory?: string;
  selectedBranches?: string[];
  selectedCities?: string[];
}

const DiplomaRecommendationResults = () => {
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { showFeedback, handleClose, handleSkipSession } = useFeedbackTimer();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // First check if we have cached recommendations and should show them
        const cachedRecommendations = sessionStorage.getItem('cachedDiplomaRecommendations');
        const storedFormData = sessionStorage.getItem('diplomaRecommendationFormData');
        
        if (cachedRecommendations && storedFormData) {
          const parsedRecommendations = JSON.parse(cachedRecommendations);
          const parsedFormData = JSON.parse(storedFormData);
          
          setRecommendations(parsedRecommendations);
          setFormData(parsedFormData);
          setIsLoading(false);
          return;
        }

        // If no cached data, check if we have form data from steps and should generate new recommendations
        const formDataFromSession = sessionStorage.getItem('diplomaRecommendationFormData');
        const formDataFromStorage = localStorage.getItem('diploma_form_data');
        
        if (formDataFromSession && isLoggedIn) {
          // Coming from steps - use session storage data and generate new recommendations
          const parsedFormData = JSON.parse(formDataFromSession);
          setFormData(parsedFormData);
          setIsGenerating(true);
          
          try {
            const result = await generateDiplomaRecommendation(parsedFormData);

            if (result && result.success) {
              setRecommendations(result.recommendations || []);
              setRecommendationId(result.recommendation_id);
            } else {
              console.error('❌ Failed to generate diploma recommendations');
            }
          } catch (error) {
            console.error('Error generating diploma recommendations:', error);
          } finally {
            setIsGenerating(false);
            setIsLoading(false);
          }
          return;
        } else if (formDataFromStorage && isLoggedIn) {
          // Direct navigation - use localStorage data and generate
          const parsedFormData = JSON.parse(formDataFromStorage);
          setFormData(parsedFormData);
          setIsGenerating(true);
          
          try {
            const result = await generateDiplomaRecommendation(parsedFormData);

            if (result && result.success) {
              setRecommendations(result.recommendations || []);
              setRecommendationId(result.recommendation_id);
            } else {
              console.error('❌ Failed to generate diploma recommendations');
            }
          } catch (error) {
            console.error('Error generating diploma recommendations:', error);
          } finally {
            setIsGenerating(false);
            setIsLoading(false);
          }
          return;
        }

        // No data available, redirect to steps
        navigate('/diploma-recommendations/steps');
      } catch (error) {
        navigate('/diploma-recommendations/steps');
      }
    };

    loadRecommendations();
  }, []);

  const generateDiplomaRecommendation = async (formData: any) => {
    try {
      // Prepare API payload
      const payload = {
        category: formData.reservationCategory || 'GOPENS',
        cet_percentile: parseFloat(formData.diplomaPercentage) || 0,
        cet_course: formData.selectedBranches || [],
        location: formData.selectedCities || []
      };

      console.log('Generating diploma recommendations with payload:', payload);
      
      // Call API to generate recommendations
      const response = await apiService.generateDiplomaRoundList(payload);
      
      if (response.success) {
        // Convert API response to recommendations format
        const recommendations = convertApiResponseToRecommendations(response.data);
        
        // Cache the data
        sessionStorage.setItem('cachedDiplomaRecommendations', JSON.stringify(recommendations));
        sessionStorage.setItem('diplomaRecommendationFormData', JSON.stringify(formData));
        
        toast.success('Diploma recommendations generated successfully!');
        return {
          success: true,
          recommendations: recommendations,
          recommendation_id: null
        };
      } else {
        throw new Error(response.message || 'Failed to generate diploma recommendations');
      }
    } catch (error: any) {
      console.error('Error generating diploma recommendations:', error);
      toast.error('Failed to generate diploma recommendations');
      return { success: false, error: error.message };
    }
  };

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];
    
    ['Dream', 'Reach', 'Match', 'Safety'].forEach(category => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              id: item.college.College_Code || item.college.SJ_Institute_Code,
              name: item.college.College_Name,
              city: item.college.City,
              logo: item.college.College_Logo,
              website: item.college.College_Website,
              type: item.college.College_Type,
              nirf_rank: item.college.NIRF_Rank_Min,
              fees: item.college["Annual_Fees_(INR)"],
              placement: item.college.Overall_College_Placement_Percentage,
              rating: item.college.College_Reviews_out_of_5,
              Student_Intake: item.college.Student_Intake,
              SJ_Institute_code: item.college.SJ_Institute_Code,
              Top_Recruiters: item.college.Top_Recruiters || []
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            match_reasons: []
          });
        });
      }
    });
    
    return recommendations;
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <StepLoadingMessages />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-1 sm:mb-1">
          <Link to="/diploma-recommendations/steps">
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

export default DiplomaRecommendationResults;