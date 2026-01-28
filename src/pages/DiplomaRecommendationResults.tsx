import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { DiplomaRecommendationResults as ResultsComponent } from "@/components/recommendations/diploma/DiplomaRecommendationResults";
import {
  Link,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
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
  gender?: string;
}

const DiplomaRecommendationResults = () => {
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const initialRound = searchParams.get("round")
    ? `round${searchParams.get("round")}`
    : location.state?.activeRound
      ? location.state.activeRound
      : localStorage.getItem("diploma_active_round") || "round2";

  const [activeRound, setActiveRound] = useState<string>(initialRound);

  // Persist active round
  useEffect(() => {
    if (activeRound) {
      localStorage.setItem("diploma_active_round", activeRound);
    }
  }, [activeRound]);

  const { isLoggedIn } = useAuth();
  const { showFeedback, handleClose, handleSkipSession } = useFeedbackTimer();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Check if we need to start generation (passed from Steps page)
        if (location.state?.startGeneration && location.state?.payload) {
          setIsLoading(true);
          let payload = { ...location.state.payload };

          try {
            // Check if Round 2 and missing last_round_college_choice_code
            if (
              payload.round === 2 &&
              (!payload.last_round_college_choice_code ||
                payload.last_round_college_choice_code === 0)
            ) {
              try {
                const configResponse = await apiService.getDiplomaConfig(2);
                if (configResponse.success && configResponse.data) {
                  const data = configResponse.data as any;
                  const config =
                    data.diploma_user_config || data.configuration || data;
                  if (config.last_round_college_choice_code) {
                    payload.last_round_college_choice_code =
                      config.last_round_college_choice_code;
                  }
                }
              } catch (configError) {
                console.error("Failed to fetch fallback config:", configError);
                // Continue with existing payload if fetch fails
              }
            }

            // 1. Store User Config
            await apiService.storeDiplomaUserConfig(payload);

            // 2. Generate Recommendations
            const response = await apiService.generateDiplomaRoundList(payload);

            if (response.success) {
              const converted = convertApiResponseToRecommendations(
                response.data,
              );
              setRecommendations(converted);

              // Update cache
              if (activeRound === "round1") {
                sessionStorage.setItem(
                  "cachedDiplomaRecommendations",
                  JSON.stringify(converted),
                );
              } else {
                sessionStorage.setItem(
                  "cachedDiplomaRound2Recommendations",
                  JSON.stringify(converted),
                );
              }

              if (response.data.is_payment) {
                localStorage.setItem("diplomaRecommendationUnlocked", "true");
              }
            } else {
              toast.error("Failed to generate recommendations");
            }
          } catch (error) {
            console.error("Error in generation flow:", error);
            toast.error("An error occurred while generating recommendations");
          } finally {
            setIsLoading(false);
            // Clear state so we don't re-run on reload
            window.history.replaceState({}, document.title);
          }
          return;
        }

        // First check if we have cached recommendations and should show them
        const cachedRecommendations = sessionStorage.getItem(
          "cachedDiplomaRecommendations",
        );
        const cachedRound2Recommendations = sessionStorage.getItem(
          "cachedDiplomaRound2Recommendations",
        );
        const storedFormData = sessionStorage.getItem(
          "diplomaRecommendationFormData",
        );
        const localStorageFormData = localStorage.getItem("diploma_form_data");

        // If we have Round 2 data, we should allow loading even if Round 1 is missing
        if (cachedRound2Recommendations) {
          if (cachedRecommendations) {
            setRecommendations(JSON.parse(cachedRecommendations));
          }
          if (storedFormData) {
            setFormData(JSON.parse(storedFormData));
          } else if (localStorageFormData) {
            setFormData(JSON.parse(localStorageFormData));
          }
          setIsLoading(false);
          return;
        }

        if (cachedRecommendations && storedFormData) {
          const parsedRecommendations = JSON.parse(cachedRecommendations);
          const parsedFormData = JSON.parse(storedFormData);

          setRecommendations(parsedRecommendations);
          setFormData(parsedFormData);
          setIsLoading(false);
          return;
        }

        // If no cached data, check if we have form data from steps and should generate new recommendations
        const formDataFromSession = storedFormData;
        const formDataFromStorage = localStorageFormData;

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
              console.error("❌ Failed to generate diploma recommendations");
            }
          } catch (error) {
            console.error("Error generating diploma recommendations:", error);
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
              console.error("❌ Failed to generate diploma recommendations");
            }
          } catch (error) {
            console.error("Error generating diploma recommendations:", error);
          } finally {
            setIsGenerating(false);
            setIsLoading(false);
          }
          return;
        }

        // No data available, redirect to steps
        navigate("/diploma-recommendations/steps");
      } catch (error) {
        navigate("/diploma-recommendations/steps");
      }
    };

    loadRecommendations();
  }, []);

  // Handle Round switching - update recommendations from cache
  useEffect(() => {
    const updateRecommendationsForRound = () => {
      let cachedData = null;

      if (activeRound === "round1") {
        cachedData = sessionStorage.getItem("cachedDiplomaRecommendations");
      } else {
        cachedData = sessionStorage.getItem(
          "cachedDiplomaRound2Recommendations",
        );
      }

      if (cachedData) {
        setRecommendations(JSON.parse(cachedData));
      } else {
        // If no data for this round, clear recommendations so child knows to fetch or show empty
        // However, child has logic to fetch Round 1 if missing.
        // For Round 2, if missing, we usually redirect to form, but let's just clear for now.
        setRecommendations([]);
      }
    };

    updateRecommendationsForRound();
  }, [activeRound]);

  const generateDiplomaRecommendation = async (formData: any) => {
    try {
      // Prepare API payload
      const payload = {
        category: formData.reservationCategory || "GOPEN",
        cet_percentile: parseFloat(formData.diplomaPercentage) || 0,
        cet_course: formData.selectedBranches || [],
        location: formData.selectedCities || [],
        gender: formData.gender || "male",
        round: 1,
        last_round_college_choice_code: 0,
      };

      // Call API to generate recommendations
      const response = await apiService.generateDiplomaRoundList(payload);

      if (response.success) {
        // Convert API response to recommendations format
        const recommendations = convertApiResponseToRecommendations(
          response.data,
        );

        // Cache the data
        sessionStorage.setItem(
          "cachedDiplomaRecommendations",
          JSON.stringify(recommendations),
        );
        sessionStorage.setItem(
          "diplomaRecommendationFormData",
          JSON.stringify(formData),
        );
        if (response.data.is_payment) {
          localStorage.setItem("diplomaRecommendationUnlocked", "true");
        }
        return {
          success: true,
          recommendations: recommendations,
          recommendation_id: null,
        };
      } else {
        throw new Error(
          response.message || "Failed to generate diploma recommendations",
        );
      }
    } catch (error: any) {
      console.error("Error generating diploma recommendations:", error);
      toast.error("Failed to generate diploma recommendations");
      return { success: false, error: error.message };
    }
  };

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];

    ["Dream", "Reach", "Match", "Safety"].forEach((category) => {
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
              Top_Recruiters: item.college.Top_Recruiters || [],
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            choice_code: item.choice_code,
            cet_percentile: item.cet_percentile,
            reservation_category: item.category,
            match_reasons: [],
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

  const handleBackToForm = async () => {
    // If no form data, fetch config based on active round
    const roundNumber = activeRound === "round2" ? 2 : 1;
    const storageKey = `diploma_form_data_round_${roundNumber}`;

    // Check if form data exists for this specific round
    const localFormData = localStorage.getItem(storageKey);

    if (localFormData) {
      navigate(`/diploma-recommendations/steps?round=${roundNumber}`);
      return;
    }

    try {
      setIsLoading(true);
      const configResponse = await apiService.getDiplomaConfig(roundNumber);

      if (configResponse.success && configResponse.data) {
        const config = configResponse.data as any; // Cast to any to handle structure mismatch

        // Map response to form data
        // Check if structure is nested in 'diploma_user_config', 'configuration' or flat
        const validConfig =
          config.diploma_user_config || config.configuration || config;

        const mappedFormData = {
          diplomaPercentage: validConfig.cet_percentile,
          reservationCategory: validConfig.category,
          gender: validConfig.gender
            ? validConfig.gender.toLowerCase()
            : "male",
          selectedBranches: validConfig.cet_course,
          selectedCities: validConfig.location,
        };

        // Save to localStorage for the steps page to pick up
        localStorage.setItem(storageKey, JSON.stringify(mappedFormData));
        navigate(`/diploma-recommendations/steps?round=${roundNumber}`);
      } else {
        toast.error("Failed to fetch configuration. Please try again.");
        navigate(`/diploma-recommendations/steps?round=${roundNumber}`);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("An error occurred. Redirecting to form...");
      navigate(`/diploma-recommendations/steps?round=${roundNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-1 sm:mb-1">
          <Button
            variant="outline"
            className="rounded-lg hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            onClick={handleBackToForm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            ) : (
              <ArrowLeft size={16} className="mr-2" />
            )}
            Back to Form
          </Button>
        </div>

        <ResultsComponent
          recommendations={recommendations || []}
          formData={formData}
          recommendationId={recommendationId}
          activeRound={activeRound}
          onRoundChange={setActiveRound}
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
