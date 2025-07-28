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
        // Check cached data first
        const cachedData = sessionStorage.getItem("cachedRecommendations");
        if (cachedData) {
          navigate('/recommendations/results', { replace: true });
          return;
        }

        // If user is logged in, check if they have profile details first
        if (isLoggedIn && user?.accessToken) {
          try {
            // First check if user has filled profile details
            const profileResponse = await apiService.fetchAICapDetails(user.accessToken);
            
            if (profileResponse.success && profileResponse.data) {
              // User has profile details, now check for existing recommendations
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