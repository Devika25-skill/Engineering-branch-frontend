import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { RecommendationResults as ResultsComponent } from "@/components/recommendations/RecommendationResults";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

import { Link, useNavigate, useLocation } from "react-router-dom";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from "@/components/recommendations/StepLoadingMessages";
import { useRecommendation } from "@/hooks/useRecommendation";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useFeedbackTimer } from "@/hooks/useFeedbackTimer";
import { mapApiResponseToFormData } from "@/utils/recommendationUtils";

const RecommendationResults = () => {
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
              name: item.college.College_Name || item.college.college_name,
              city: item.college.City || item.college.city,
              logo: item.college.College_Logo || item.college.college_logo,
              college_code:
                item.college.College_Code ||
                item.college.College_code ||
                item.college.college_code ||
                item.college.dte_code ||
                item.college.institute_code,
              website:
                item.college.College_Website || item.college.college_website,
              type: item.college.College_Type || item.college.college_type,
              nirf_rank: item.college.NIRF_Rank_Min,
              fees:
                item.college["Annual_Fees_(INR)"] || item.college.annual_fees,
              placement:
                item.college.Overall_College_Placement_Percentage ||
                item.college.overall_college_placement_percentage ||
                null,
              Student_Intake:
                item.college.Student_Intake ||
                item.college.student_intake ||
                null,
              top_recruiters:
                item.college.Top_Recruiters ||
                item.college.top_recruiters ||
                [],
              rating:
                item.college.College_Reviews_out_of_5 ||
                item.college.college_reviews_out_of_5 ||
                null,
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile || item.cet_rank,
            reservation_category: item.category,
            choice_code: item.choice_code || null,
          });
        });
      }
    });
    return recommendations;
  }, []);

  const fetchRound1Data = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Check for cached data first
      const cachedCallbacks = sessionStorage.getItem(
        "cachedRecommendations_v3",
      );
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
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      // Ensure we have form data, if not try to fetch it first
      if (!currentFormData || Object.keys(currentFormData).length === 0) {
        if (
          isLoggedIn &&
          user?.accessToken &&
          user?.email &&
          !isKarnataka // Skip for Karnataka
        ) {
          try {
            const capResponse = await apiService.fetchAICapDetails(
              user.accessToken,
              user.email,
            );
            if (capResponse.success && capResponse.data) {
              const mappedFormData = mapApiResponseToFormData(capResponse.data);

              // Restore to storage (all keys to ensure backward compatibility)
              recommendationStorage.saveAcademicDetails(mappedFormData);
              recommendationStorage.savePreferences(mappedFormData);
              recommendationStorage.savePriorities(mappedFormData);

              sessionStorage.setItem(
                "recommendationFormData",
                JSON.stringify(mappedFormData),
              );
              sessionStorage.setItem(
                "recommendation_form_data",
                JSON.stringify(mappedFormData),
              );
              localStorage.setItem(
                "recommendationFormData",
                JSON.stringify(mappedFormData),
              ); // For PDF robustness

              currentFormData = mappedFormData;
              setFormData(mappedFormData);
            }
          } catch (error) {
            console.error("Failed to fetch CAP details", error);
          }
        }
      }

      currentFormData = recommendationStorage.getFormData();

      if (isLoggedIn && user?.accessToken && !isKarnataka) {
        try {
          const round1Response = await apiService.getRoundRecommendations(
            1,
            user.accessToken,
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
              "cachedRecommendations_v3",
              JSON.stringify(recs),
            );
            // Also update localStorage with the raw data to ensure consistency with useRecommendation
            localStorage.setItem(
              "recommendations",
              JSON.stringify(round1Response.data),
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
                  result.recommendations,
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
      } else if (isKarnataka) {
        // Karnataka: Check local storage first
        let storedRecs = localStorage.getItem("round1Recommendations");
        if (!storedRecs) {
          storedRecs = localStorage.getItem("karnataka_recommendations");
        }

        let loadedFromStorage = false;

        if (storedRecs) {
          try {
            const parsed = JSON.parse(storedRecs);
            let recs: any[] = [];
            // Check if it's the object format (Dream/Reach etc) or array
            if (parsed.Dream || parsed.Reach || parsed.Match || parsed.Safety) {
              recs = convertApiResponseToRecommendations(parsed);
            } else if (Array.isArray(parsed)) {
              recs = parsed;
            }
            if (recs.length > 0) {
              setRecommendations(recs);
              loadedFromStorage = true;
            }
          } catch (e) {
            console.error("Error parsing stored Karnataka recs", e);
          }
        }

        if (!loadedFromStorage) {
          // Fetch from API
          try {
            const response = await apiService.getRoundRecommendations(
              1,
              user.accessToken,
            );
            if (response.success && response.data) {
              let recs: any[] = [];
              // API response is likely the object format
              if (
                response.data.Dream ||
                response.data.Reach ||
                response.data.Match ||
                response.data.Safety
              ) {
                recs = convertApiResponseToRecommendations(response.data);
              } else if (Array.isArray(response.data)) {
                recs = response.data;
              }

              setRecommendations(recs);

              // Store in localStorage for future use
              localStorage.setItem(
                "round1Recommendations",
                JSON.stringify(response.data),
              );
              // Also update generic key if needed
              localStorage.setItem(
                "karnataka_recommendations",
                JSON.stringify(response.data),
              );
            }
          } catch (e) {
            console.error("Failed to fetch Round 1 data", e);
          }
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
  ]);

  const loadRecommendations = useCallback(async () => {
    try {
      setFormData((prev: any) => {
        const stored = recommendationStorage.getFormData();
        return stored || prev;
      });

      if (isLoggedIn && user?.accessToken) {
        const isKarnataka =
          localStorage.getItem("selected_state") === "Karnataka";

        // 1. Fetch Form Data if missing
        let currentFormData = recommendationStorage.getFormData();
        if (!currentFormData || Object.keys(currentFormData).length === 0) {
          if (!isKarnataka) {
            try {
              const capResponse = await apiService.fetchAICapDetails(
                user.accessToken,
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
          "cachedRecommendations",
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
    setFormData,
    setRecommendations,
    setIsLoading,
  ]);

  const [currentTab, setCurrentTab] = useState<string>(
    localStorage.getItem("activeRoundTab") || "round2",
  );

  const handleTabChange = useCallback(
    async (tab: string) => {
      setCurrentTab(tab);
      localStorage.setItem("activeRoundTab", tab);
      if (tab === "round1") {
        await fetchRound1Data();
      }
    },
    [fetchRound1Data],
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
              selectionData: (() => {
                try {
                  const getValue = (key: string) => {
                    const saved = localStorage.getItem(key);
                    if (!saved) return null;
                    return JSON.parse(saved);
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
          round2Key="round2-tab"
          round3Key="round3-tab"
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
