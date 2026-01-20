import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { RecommendationResults as ResultsComponent } from "@/components/recommendations/RecommendationResults";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

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
  const { generateRecommendation } = useRecommendation();
  const { user, isLoggedIn } = useAuth();
  const { showFeedback, handleClose, handleSkipSession } = useFeedbackTimer();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Convert API response to recommendation format (Same as Round2/3 Tabs)
  const convertApiResponseToRecommendations = useCallback((apiData: any) => {
    const recommendations: any[] = [];
    ["Dream", "Reach", "Match", "Safety"].forEach((category) => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              id: item.college.SJ_Institute_Code,
              name: item.college.College_Name,
              city: item.college.City,
              logo: item.college.College_Logo,
              website: item.college.College_Website,
              type: item.college.College_Type,
              nirf_rank: item.college.NIRF_Rank_Min,
              fees: item.college["Annual_Fees_(INR)"],
              placement_percentage:
                item.college.Overall_College_Placement_Percentage,
              top_recruiters: item.college.Top_Recruiters || [],
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            reservation_category: item.category,
          });
        });
      }
    });
    return recommendations;
  }, []);

  const mapApiResponseToFormData = useCallback((apiData: any) => {
    // Basic mapping or return as is if structure matches
    return apiData;
  }, []);

  const fetchRound1Data = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Check for cached data first
      const cachedCallbacks = sessionStorage.getItem("cachedRecommendations");
      if (cachedCallbacks) {
        try {
          const recs = JSON.parse(cachedCallbacks);
          if (Array.isArray(recs) && recs.length > 0) {
            setRecommendations(recs);
            setIsGenerating(false);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached recommendations", e);
        }
      }

      let currentFormData = recommendationStorage.getFormData();

      // Ensure we have form data, if not try to fetch it first
      if (!currentFormData || Object.keys(currentFormData).length === 0) {
        if (isLoggedIn && user?.accessToken) {
          try {
            const capResponse = await apiService.fetchAICapDetails(
              user.accessToken
            );
            if (capResponse.success && capResponse.data) {
              const mappedData = mapApiResponseToFormData(capResponse.data);
              recommendationStorage.saveFormData(mappedData);
              setFormData(mappedData);
              currentFormData = mappedData;
            }
          } catch (err) {
            console.error("Failed to fetch CAP details", err);
          }
        }
      }

      currentFormData = recommendationStorage.getFormData();

      if (isLoggedIn && user?.accessToken) {
        try {
          const round1Response = await apiService.getRoundRecommendations(
            1,
            user.accessToken
          );
          if (round1Response.success && round1Response.data) {
            let recs: any[] = [];
            if (Array.isArray(round1Response.data)) {
              recs = round1Response.data;
            } else if (typeof round1Response.data === "object") {
              recs = convertApiResponseToRecommendations(round1Response.data);
            }
            setRecommendations(recs);
            sessionStorage.setItem(
              "cachedRecommendations",
              JSON.stringify(recs)
            );
          } else if (
            currentFormData &&
            Object.keys(currentFormData).length > 0
          ) {
            // Fallback to generate
            const result = await generateRecommendation(currentFormData);
            if (result && "recommendations" in result) {
              let recs: any[] = [];
              if (Array.isArray(result.recommendations)) {
                recs = result.recommendations;
              } else {
                recs = convertApiResponseToRecommendations(
                  result.recommendations
                );
              }
              setRecommendations(recs);
              if ("recommendation_id" in result) {
                setRecommendationId(result.recommendation_id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch Round 1 recommendations", err);
        }
      }
    } catch (err) {
      console.error("Error in fetchRound1Data", err);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  }, [
    isLoggedIn,
    user,
    convertApiResponseToRecommendations,
    generateRecommendation,
    setRecommendations,
    setIsLoading,
    setIsGenerating,
    setRecommendationId,
    mapApiResponseToFormData,
  ]);

  const loadRecommendations = useCallback(async () => {
    try {
      setFormData((prev: any) => {
        const stored = recommendationStorage.getFormData();
        return stored || prev;
      });

      if (isLoggedIn && user?.accessToken) {
        // 1. Fetch Form Data if missing
        let currentFormData = recommendationStorage.getFormData();
        if (!currentFormData || Object.keys(currentFormData).length === 0) {
          try {
            const capResponse = await apiService.fetchAICapDetails(
              user.accessToken
            );
            if (capResponse.success && capResponse.data) {
              const mappedData = mapApiResponseToFormData(capResponse.data);
              recommendationStorage.saveFormData(mappedData);
              setFormData(mappedData);
              currentFormData = mappedData;
            }
          } catch (err) {
            console.error("Failed to fetch CAP details", err);
          }
        }

        // 2. Check active tab
        const activeTab = localStorage.getItem("activeRoundTab") || "round2";
        if (activeTab === "round1") {
          await fetchRound1Data();
        } else {
          setIsLoading(false);
        }
      } else {
        // Not logged in
        const cachedRecommendations = sessionStorage.getItem(
          "cachedRecommendations"
        );
        if (cachedRecommendations) {
          setRecommendations(JSON.parse(cachedRecommendations));
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setIsLoading(false);
    }
  }, [
    isLoggedIn,
    user,
    fetchRound1Data,
    mapApiResponseToFormData,
    setFormData,
    setRecommendations,
    setIsLoading,
  ]);

  const [currentTab, setCurrentTab] = useState<string>(
    localStorage.getItem("activeRoundTab") || "round2"
  );

  const handleTabChange = useCallback(
    async (tab: string) => {
      setCurrentTab(tab);
      localStorage.setItem("activeRoundTab", tab);
      if (tab === "round1") {
        await fetchRound1Data();
      }
    },
    [fetchRound1Data]
  );

  useEffect(() => {
    if (user !== undefined) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoggedIn, navigate]);

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
          <Link
            to="/recommendations/steps"
            state={{
              fromResults: true,
              activeRound: currentTab,
              choiceCode: (() => {
                try {
                  const getValue = (key: string) => {
                    const saved = localStorage.getItem(key);
                    if (!saved) return null;
                    const parsed = JSON.parse(saved);
                    return parsed?.selectedCollege?.selectedDepartment
                      ?.choice_code;
                  };

                  if (currentTab === "round2") {
                    return (
                      getValue("round1Selection") || getValue("round2Selection")
                    );
                  } else if (currentTab === "round3") {
                    return (
                      getValue("round2Selection") || getValue("round3Selection")
                    );
                  } else if (currentTab === "round1") {
                    return getValue("round1Selection");
                  }
                } catch (e) {
                  return undefined;
                }
                return undefined;
              })(),
            }}
          >
            <Button
              variant="outline"
              className="rounded-lg hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Form
            </Button>
          </Link>
        </div>

        <ResultsComponent
          recommendations={recommendations || []}
          formData={formData}
          recommendationId={recommendationId}
          onTabChange={handleTabChange}
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
