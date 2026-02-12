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
        const recommendationType = localStorage.getItem("recommendation_type");
        const isMedical = recommendationType === "First_Year_Medical";

        // Check cached data first
        const cacheKey = isMedical
          ? "cachedMedicalRecommendations"
          : "cachedRecommendations";
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          const resultsPath = isMedical
            ? "/medical-recommendations/results"
            : "/recommendations/results";
          navigate(resultsPath, { replace: true });
          return;
        }

        // If user is logged in, check if they have profile details first
        if (isLoggedIn && user?.accessToken) {
          const isKarnataka =
            localStorage.getItem("selected_state") === "Karnataka";
          const isFirstYear =
            localStorage.getItem("recommendation_type") === "first-year";

          // Skip this block for Karnataka First Year Engineering (handled below)
          if (!(isKarnataka && isFirstYear)) {
            try {
              // Call appropriate API based on program type
              const selectedState =
                localStorage.getItem("selected_state") || "";
              const profileResponse = isMedical
                ? await apiService.fetchMedicalStudentDetails(
                    user.accessToken,
                    selectedState,
                  )
                : await apiService.fetchAICapDetails(user.accessToken);

              if (profileResponse.success && profileResponse.data) {
                // For medical, check if recommendations exist
                if (isMedical) {
                  // Check Round 3 recommendations first
                  try {
                    const selectedState =
                      localStorage.getItem("selected_state") || "";
                    const round3Response =
                      await apiService.getMedicalRecommendationsByRound(
                        3,
                        user.accessToken,
                        selectedState,
                      );
                    if (round3Response.success && round3Response.data) {
                      const hasRound3 =
                        (round3Response.data.Dream &&
                          round3Response.data.Dream.length > 0) ||
                        (round3Response.data.Reach &&
                          round3Response.data.Reach.length > 0) ||
                        (round3Response.data.Match &&
                          round3Response.data.Match.length > 0) ||
                        (round3Response.data.Safety &&
                          round3Response.data.Safety.length > 0);

                      if (hasRound3) {
                        // Cache Round 3 recommendations and navigate to results with Round 3 active
                        sessionStorage.setItem(
                          "cachedMedicalRecommendations",
                          JSON.stringify(round3Response.data),
                        );
                        sessionStorage.setItem("medicalActiveRound", "3");
                        navigate("/medical-recommendations/results", {
                          replace: true,
                        });
                        return;
                      }
                    }
                  } catch (error) {
                    console.error(
                      "Error checking Round 3 recommendations:",
                      error,
                    );
                  }

                  // Check Round 2 recommendations first
                  try {
                    const selectedState =
                      localStorage.getItem("selected_state") || "";
                    const round2Response =
                      await apiService.getMedicalRecommendationsByRound(
                        2,
                        user.accessToken,
                        selectedState,
                      );
                    if (round2Response.success && round2Response.data) {
                      const hasRound2 =
                        (round2Response.data.Dream &&
                          round2Response.data.Dream.length > 0) ||
                        (round2Response.data.Reach &&
                          round2Response.data.Reach.length > 0) ||
                        (round2Response.data.Match &&
                          round2Response.data.Match.length > 0) ||
                        (round2Response.data.Safety &&
                          round2Response.data.Safety.length > 0);

                      if (hasRound2) {
                        // Cache Round 2 recommendations and navigate to results with Round 2 active
                        sessionStorage.setItem(
                          "cachedMedicalRecommendations",
                          JSON.stringify(round2Response.data),
                        );
                        sessionStorage.setItem("medicalActiveRound", "2");
                        navigate("/medical-recommendations/results", {
                          replace: true,
                        });
                        return;
                      }
                    }
                  } catch (error) {
                    console.error(
                      "Error checking Round 2 recommendations:",
                      error,
                    );
                  }

                  // Check Round 1 recommendations if Round 2 doesn't exist
                  try {
                    const selectedState =
                      localStorage.getItem("selected_state") || "";
                    const round1Response =
                      await apiService.getMedicalRecommendationsByRound(
                        1,
                        user.accessToken,
                        selectedState,
                      );
                    if (round1Response.success && round1Response.data) {
                      const hasRound1 =
                        (round1Response.data.Dream &&
                          round1Response.data.Dream.length > 0) ||
                        (round1Response.data.Reach &&
                          round1Response.data.Reach.length > 0) ||
                        (round1Response.data.Match &&
                          round1Response.data.Match.length > 0) ||
                        (round1Response.data.Safety &&
                          round1Response.data.Safety.length > 0);

                      if (hasRound1) {
                        // Cache Round 1 recommendations and navigate to results with Round 1 active
                        sessionStorage.setItem(
                          "cachedMedicalRecommendations",
                          JSON.stringify(round1Response.data),
                        );
                        sessionStorage.setItem("medicalActiveRound", "1");
                        navigate("/medical-recommendations/results", {
                          replace: true,
                        });
                        return;
                      }
                    }
                  } catch (error) {
                    console.error(
                      "Error checking Round 1 recommendations:",
                      error,
                    );
                  }

                  // No recommendations exist, go to steps page
                  navigate("/recommendations/steps", { replace: true });
                  return;
                }

                // For engineering, check for existing recommendations

                // 0. Check Active Round Tab First
                const activeRoundTab = localStorage.getItem("activeRoundTab");
                if (activeRoundTab) {
                  try {
                    let activeRoundResponse = null;
                    let activeRoundNum = 0;

                    if (activeRoundTab === "round1") activeRoundNum = 1;
                    else if (activeRoundTab === "round2") activeRoundNum = 2;
                    else if (activeRoundTab === "round3") activeRoundNum = 3;

                    if (activeRoundNum > 0) {
                      activeRoundResponse =
                        await apiService.getRoundRecommendations(
                          activeRoundNum,
                          user.accessToken,
                        );

                      if (
                        activeRoundResponse.success &&
                        activeRoundResponse.data &&
                        Object.keys(activeRoundResponse.data).length > 0
                      ) {
                        const hasData =
                          (activeRoundResponse.data.Dream &&
                            activeRoundResponse.data.Dream.length > 0) ||
                          (activeRoundResponse.data.Reach &&
                            activeRoundResponse.data.Reach.length > 0) ||
                          (activeRoundResponse.data.Match &&
                            activeRoundResponse.data.Match.length > 0) ||
                          (activeRoundResponse.data.Safety &&
                            activeRoundResponse.data.Safety.length > 0);

                        if (hasData) {
                          localStorage.setItem(
                            "activeRoundTab",
                            activeRoundTab,
                          );
                          if (activeRoundNum === 3) {
                            sessionStorage.setItem(
                              "cachedRound3Recommendations_v3",
                              JSON.stringify(activeRoundResponse.data),
                            );
                            localStorage.setItem(
                              "round3Recommendations",
                              JSON.stringify(activeRoundResponse.data),
                            );
                          } else if (activeRoundNum === 2) {
                            sessionStorage.setItem(
                              "cachedRound2Recommendations_v3",
                              JSON.stringify(activeRoundResponse.data),
                            );
                            localStorage.setItem(
                              "round2Recommendations",
                              JSON.stringify(activeRoundResponse.data),
                            );
                          } else {
                            sessionStorage.setItem(
                              "cachedRecommendations",
                              JSON.stringify(activeRoundResponse.data),
                            );
                            localStorage.setItem(
                              "round1Recommendations",
                              JSON.stringify(activeRoundResponse.data),
                            );
                          }

                          navigate("/recommendations/results", {
                            replace: true,
                          });
                          return;
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Error checking active round:", e);
                  }
                }

                // 1. Check Round 3
                try {
                  const round3Response =
                    await apiService.getRoundRecommendations(
                      3,
                      user.accessToken,
                    );
                  if (
                    round3Response.success &&
                    round3Response.data &&
                    Object.keys(round3Response.data).length > 0
                  ) {
                    const hasData =
                      (round3Response.data.Dream &&
                        round3Response.data.Dream.length > 0) ||
                      (round3Response.data.Reach &&
                        round3Response.data.Reach.length > 0) ||
                      (round3Response.data.Match &&
                        round3Response.data.Match.length > 0) ||
                      (round3Response.data.Safety &&
                        round3Response.data.Safety.length > 0);

                    if (hasData) {
                      localStorage.setItem("activeRoundTab", "round3");
                      sessionStorage.setItem(
                        "cachedRound3Recommendations_v3",
                        JSON.stringify(round3Response.data),
                      );
                      localStorage.setItem(
                        "round3Recommendations",
                        JSON.stringify(round3Response.data),
                      );
                      navigate("/recommendations/results", { replace: true });
                      return;
                    }
                  }
                } catch (e) {
                  console.error("Error checking Round 3:", e);
                }

                // 2. Check Round 2
                try {
                  const round2Response =
                    await apiService.getRoundRecommendations(
                      2,
                      user.accessToken,
                    );
                  if (
                    round2Response.success &&
                    round2Response.data &&
                    Object.keys(round2Response.data).length > 0
                  ) {
                    const hasData =
                      (round2Response.data.Dream &&
                        round2Response.data.Dream.length > 0) ||
                      (round2Response.data.Reach &&
                        round2Response.data.Reach.length > 0) ||
                      (round2Response.data.Match &&
                        round2Response.data.Match.length > 0) ||
                      (round2Response.data.Safety &&
                        round2Response.data.Safety.length > 0);

                    if (hasData) {
                      localStorage.setItem("activeRoundTab", "round2");
                      sessionStorage.setItem(
                        "cachedRound2Recommendations_v3",
                        JSON.stringify(round2Response.data),
                      );
                      localStorage.setItem(
                        "round2Recommendations",
                        JSON.stringify(round2Response.data),
                      );
                      navigate("/recommendations/results", { replace: true });
                      return;
                    }
                  }
                } catch (e) {
                  console.error("Error checking Round 2:", e);
                }

                // 3. Fallback to existing logic (Round 1)
                const response = await apiService.getExistingRecommendations(
                  user.accessToken,
                );
                if (response.success && response.data) {
                  // Check if any recommendations exist (Dream, Reach, Match, Safety)
                  const hasRecommendations =
                    (response.data.Dream && response.data.Dream.length > 0) ||
                    (response.data.Reach && response.data.Reach.length > 0) ||
                    (response.data.Match && response.data.Match.length > 0) ||
                    (response.data.Safety && response.data.Safety.length > 0);

                  if (hasRecommendations) {
                    // Cache the recommendations and navigate to results
                    localStorage.setItem("activeRoundTab", "round1");
                    sessionStorage.setItem(
                      "cachedRecommendations",
                      JSON.stringify(response.data),
                    );
                    navigate("/recommendations/results", { replace: true });
                    return;
                  }
                }
                // User has profile details but no recommendations, go to steps
                navigate("/recommendations/steps", { replace: true });
                return;
              }
            } catch (error) {
              // If API call fails, fall back to steps page
              console.error(
                "Failed to fetch profile details or recommendations:",
                error,
              );
            }
          }

          // Handle Karnataka First Year Engineering specifically
          if (isKarnataka && isFirstYear) {
            try {
              // 1. Fetch User Config and Store it
              try {
                const configResponse =
                  await apiService.fetchKarnatakaEngineeringConfig(
                    user.accessToken,
                  );
                if (configResponse.success && configResponse.data) {
                  localStorage.setItem(
                    "engineering_user_config",
                    JSON.stringify(configResponse.data),
                  );
                }
              } catch (e) {
                console.log(
                  "Config fetch failed, continuing to check rounds...",
                  e,
                );
              }

              // Helper function to check if round data exists
              const hasRoundData = (data: any) => {
                return (
                  data &&
                  ((data.Dream && data.Dream.length > 0) ||
                    (data.Reach && data.Reach.length > 0) ||
                    (data.Match && data.Match.length > 0) ||
                    (data.Safety && data.Safety.length > 0))
                );
              };

              // 0. Check Active Round Tab First
              const activeRoundTab = localStorage.getItem("activeRoundTab");
              if (activeRoundTab) {
                try {
                  let activeRoundNum = 0;
                  if (activeRoundTab === "round1") activeRoundNum = 1;
                  else if (activeRoundTab === "round2") activeRoundNum = 2;
                  else if (activeRoundTab === "round3") activeRoundNum = 3;

                  if (activeRoundNum > 0) {
                    const activeRoundResponse =
                      await apiService.getRoundRecommendations(
                        activeRoundNum,
                        user.accessToken,
                      );

                    if (
                      activeRoundResponse.success &&
                      activeRoundResponse.data &&
                      hasRoundData(activeRoundResponse.data)
                    ) {
                      if (activeRoundResponse.data.is_payment === true) {
                        localStorage.setItem("recommendationUnlocked", "true");
                        localStorage.setItem("isPayment", "true");
                      }
                      localStorage.setItem("activeRoundTab", activeRoundTab);

                      if (activeRoundNum === 3) {
                        localStorage.setItem(
                          "round3Recommendations",
                          JSON.stringify(activeRoundResponse.data),
                        );
                        sessionStorage.setItem(
                          "cachedRound3Recommendations_v3",
                          JSON.stringify(activeRoundResponse.data),
                        );
                      } else if (activeRoundNum === 2) {
                        localStorage.setItem(
                          "round2Recommendations",
                          JSON.stringify(activeRoundResponse.data),
                        );
                        sessionStorage.setItem(
                          "cachedRound2Recommendations_v3",
                          JSON.stringify(activeRoundResponse.data),
                        );
                      } else {
                        localStorage.setItem(
                          "round1Recommendations",
                          JSON.stringify(activeRoundResponse.data),
                        );
                        sessionStorage.setItem(
                          "cachedRound1Recommendations_v3",
                          JSON.stringify(activeRoundResponse.data),
                        );
                      }

                      navigate("/recommendations/results", { replace: true });
                      return;
                    }
                  }
                } catch (e) {
                  console.log("Active round check failed", e);
                }
              }

              // 2. Check Round 3
              try {
                const round3Response = await apiService.getRoundRecommendations(
                  3,
                  user.accessToken,
                );
                if (
                  round3Response.success &&
                  round3Response.data &&
                  hasRoundData(round3Response.data)
                ) {
                  if (round3Response.data.is_payment === true) {
                    localStorage.setItem("recommendationUnlocked", "true");
                    localStorage.setItem("isPayment", "true");
                  }
                  localStorage.setItem("activeRoundTab", "round3");
                  localStorage.setItem(
                    "round3Recommendations",
                    JSON.stringify(round3Response.data),
                  );
                  sessionStorage.setItem(
                    "cachedRound3Recommendations_v3",
                    JSON.stringify(round3Response.data),
                  );

                  navigate("/recommendations/results", { replace: true });
                  return;
                }
              } catch (e) {
                console.log("Round 3 check failed or no data", e);
              }

              // 3. Check Round 2
              try {
                const round2Response = await apiService.getRoundRecommendations(
                  2,
                  user.accessToken,
                );
                if (
                  round2Response.success &&
                  round2Response.data &&
                  hasRoundData(round2Response.data)
                ) {
                  localStorage.setItem("activeRoundTab", "round2");
                  localStorage.setItem(
                    "round2Recommendations",
                    JSON.stringify(round2Response.data),
                  );
                  sessionStorage.setItem(
                    "cachedRound2Recommendations_v3",
                    JSON.stringify(round2Response.data),
                  );
                  navigate("/recommendations/results", { replace: true });
                  return;
                }
              } catch (e) {
                console.log("Round 2 check failed or no data", e);
              }

              // 4. Check Round 1
              try {
                const round1Response = await apiService.getRoundRecommendations(
                  1,
                  user.accessToken,
                );
                if (
                  round1Response.success &&
                  round1Response.data &&
                  hasRoundData(round1Response.data)
                ) {
                  localStorage.setItem("activeRoundTab", "round1");
                  localStorage.setItem(
                    "round1Recommendations",
                    JSON.stringify(round1Response.data),
                  );
                  sessionStorage.setItem(
                    "cachedRound1Recommendations_v3",
                    JSON.stringify(round1Response.data),
                  );
                  navigate("/recommendations/results", { replace: true });
                  return;
                }
              } catch (e) {
                console.log("Round 1 check failed or no data", e);
              }

              // 5. If data not present for any round, redirect to Steps
              navigate("/recommendations/steps", { replace: true });
              return;
            } catch (error) {
              console.error("Error in Karnataka Engineering check:", error);
              navigate("/recommendations/steps", { replace: true });
              return;
            }
          }
        }

        // If no cached data, not logged in, or no profile details, go to steps
        navigate("/recommendations/steps", { replace: true });
      } catch (error) {
        console.error("Error checking recommendations:", error);
        navigate("/recommendations/steps", { replace: true });
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
