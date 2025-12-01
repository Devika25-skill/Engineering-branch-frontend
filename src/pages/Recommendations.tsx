import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const Recommendations = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExistingRecommendations = async () => {
      try {
        const recommendationType = localStorage.getItem('recommendation_type');
        const isMedical = recommendationType === 'First_Year_Medical';
        
        // Check cached data first
        const cacheKey = isMedical ? "cachedMedicalRecommendations" : "cachedRecommendations";
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const resultsPath = isMedical ? '/medical-recommendations/results' : '/recommendations/results';
          navigate(resultsPath, { replace: true });
          return;
        }

        // If user is logged in, check if they have profile details first
        if (isLoggedIn && user?.accessToken) {
          try {
            // Call appropriate API based on program type
            const profileResponse = isMedical 
              ? await apiService.fetchMedicalStudentDetails(user.accessToken)
              : await apiService.fetchAICapDetails(user.accessToken);
            
            if (profileResponse.success && profileResponse.data) {
            // For medical, check if recommendations exist for both rounds
            if (isMedical) {
              try {
                // Check Round 2 first
                const round2Response = await apiService.getMedicalRecommendationsByRound(2, user.accessToken);
                
                if (round2Response.success && round2Response.data) {
                  const hasRound2Recommendations = 
                    (round2Response.data.Dream && round2Response.data.Dream.length > 0) ||
                    (round2Response.data.Reach && round2Response.data.Reach.length > 0) ||
                    (round2Response.data.Match && round2Response.data.Match.length > 0) ||
                    (round2Response.data.Safety && round2Response.data.Safety.length > 0);
                  
                  if (hasRound2Recommendations) {
                    // Cache Round 2 recommendations and navigate to results with Round 2 active
                    const recommendationsData = {
                      Dream: round2Response.data.Dream || [],
                      Reach: round2Response.data.Reach || [],
                      Match: round2Response.data.Match || [],
                      Safety: round2Response.data.Safety || []
                    };
                    sessionStorage.setItem("cachedMedicalRecommendations", JSON.stringify(recommendationsData));
                    sessionStorage.setItem("medicalRecommendationPaymentData", JSON.stringify({
                      is_payment: round2Response.data.is_payment || false,
                      accept_payment: round2Response.data.accept_payment || true
                    }));
                    sessionStorage.setItem("activeRound", "round2");
                    navigate('/medical-recommendations/results', { replace: true });
                    return;
                  }
                }
                
                // Check Round 1 if Round 2 has no data
                const round1Response = await apiService.getMedicalRecommendationsByRound(1, user.accessToken);
                
                if (round1Response.success && round1Response.data) {
                  const hasRound1Recommendations = 
                    (round1Response.data.Dream && round1Response.data.Dream.length > 0) ||
                    (round1Response.data.Reach && round1Response.data.Reach.length > 0) ||
                    (round1Response.data.Match && round1Response.data.Match.length > 0) ||
                    (round1Response.data.Safety && round1Response.data.Safety.length > 0);
                  
                  if (hasRound1Recommendations) {
                    // Cache Round 1 recommendations and navigate to results with Round 1 active
                    const recommendationsData = {
                      Dream: round1Response.data.Dream || [],
                      Reach: round1Response.data.Reach || [],
                      Match: round1Response.data.Match || [],
                      Safety: round1Response.data.Safety || []
                    };
                    sessionStorage.setItem("cachedMedicalRecommendations", JSON.stringify(recommendationsData));
                    sessionStorage.setItem("medicalRecommendationPaymentData", JSON.stringify({
                      is_payment: round1Response.data.is_payment || false,
                      accept_payment: round1Response.data.accept_payment || true
                    }));
                    sessionStorage.setItem("activeRound", "round1");
                    navigate('/medical-recommendations/results', { replace: true });
                    return;
                  }
                }
              } catch (error) {
                console.error('Failed to fetch medical recommendations:', error);
              }
              
              // If no recommendations found, go to steps page
              navigate('/recommendations/steps', { replace: true });
              return;
            }
              
              // For engineering, check for existing recommendations
              const response = await apiService.getExistingRecommendations(user.accessToken);
              if (response.success && response.data) {
                // Check if any recommendations exist (Dream, Reach, Match, Safety)
                const hasRecommendations = (response.data.Dream && response.data.Dream.length > 0) ||
                                         (response.data.Reach && response.data.Reach.length > 0) ||
                                         (response.data.Match && response.data.Match.length > 0) ||
                                         (response.data.Safety && response.data.Safety.length > 0);
                
                if (hasRecommendations) {
                  // Cache the recommendations and navigate to results
                  sessionStorage.setItem("cachedRecommendations", JSON.stringify(response.data));
                  navigate('/recommendations/results', { replace: true });
                  return;
                }
              }
              // User has profile details but no recommendations, go to steps
              navigate('/recommendations/steps', { replace: true });
              return;
            }
          } catch (error) {
            // If API call fails, fall back to steps page
            console.error('Failed to fetch profile details or recommendations:', error);
          }
        }

        // If no cached data, not logged in, or no profile details, go to steps
        navigate('/recommendations/steps', { replace: true });
      } catch (error) {
        console.error('Error checking recommendations:', error);
        navigate('/recommendations/steps', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingRecommendations();
  }, [navigate, isLoggedIn, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Recommendations;