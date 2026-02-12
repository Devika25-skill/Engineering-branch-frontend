import { useState, useCallback } from "react";
import { apiService, type GenerateRecommendationRequest } from "@/services/api";
import { type CollegeRecommendation } from "@/services/cutoffService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { recommendationStorage } from "@/services/recommendationStorage";
import { useMedicalRecommendation } from "./useMedicalRecommendation";

export const useRecommendation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { generateMedicalRecommendation } = useMedicalRecommendation();

  const generateRecommendation = useCallback(
    async (formData: any, round: number = 1, prevChoiceCode?: string) => {
      const recommendationType = localStorage.getItem("recommendation_type");
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      // Route to medical recommendations if it's a medical program
      if (recommendationType === "First_Year_Medical") {
        const result = await generateMedicalRecommendation(formData);
        return {
          recommendations: result.recommendations,
          formData: result.formData,
          success: true,
        };
      }
      if (!isLoggedIn || !user) {
        throw new Error("User must be logged in to generate recommendations");
      }

      // Validate mandatory fields - removed 'preferredCities' as it's now optional
      const requiredFields = [
        "tenthMarks",
        "reservationCategory",
        "twelfthMarks",
        "grouping",
        "groupingMarks",
        "preferredStreams",
        "maxBudget",
      ];

      // Add specific field check based on region
      if (isKarnataka) {
        requiredFields.push("cetRank");
      } else {
        requiredFields.push("cetPercentile");
      }

      const missingFields = requiredFields.filter((field) => {
        const value = formData[field];
        return !value || (Array.isArray(value) && value.length === 0);
      });

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Information",
          description:
            "Please fill in all required fields before generating recommendations.",
          variant: "destructive",
        });
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Only check percentile range if not Karnataka
      if (
        !isKarnataka &&
        (formData.cetPercentile < 0 || formData.cetPercentile > 100)
      ) {
        toast({
          title: "Invalid CET Percentile",
          description: "CET percentile must be between 0 and 100.",
          variant: "destructive",
        });
        throw new Error("Invalid CET percentile range");
      }

      setIsGenerating(true);

      try {
        // Create recommendation record
        let response: any;
        let recommendationId: string;

        if (isKarnataka) {
          const karnatakaPayload: any = {
            academic_credentials: {
              educationBackground: {
                educationType: "12th",
                stream: formData.grouping,
                // district removed for Karnataka
              },
              academicMarks: {
                _10thGradeMarksPercent: formData.tenthMarks,
                _12thGradeMarksPercent: formData.twelfthMarks,
                groupingMarksPercent: formData.groupingMarks,
              },
              examPercentiles: {
                CET_Rank: formData.cetRank, // Mapping to CET_Rank directly based on interface
                JEE:
                  formData.jeePercentile && formData.jeePercentile !== ""
                    ? Number(formData.jeePercentile)
                    : 0,
                otherEntranceExam:
                  formData.otherExamName && formData.otherExamPercentile
                    ? [
                        {
                          examName: formData.otherExamName,
                          percentileOrScore: Number(
                            formData.otherExamPercentile,
                          ),
                        },
                      ]
                    : [],
              },
              achievementsExperience: {
                sportsAchievements: formData.sportsAchievements,
                certifications: formData.certifications,
                internshipsWorkExperience: formData.internships,
                otherAchievements: formData.otherAchievements,
              },
              preferences: {
                engineeringBranches: formData.preferredStreams || [],
                preferredCities:
                  formData.preferredCities &&
                  formData.preferredCities.length > 0
                    ? formData.preferredCities
                    : ["ALL"],
              },
              campusFacilitiesEnvironment: {
                hostelFacility: formData.hostelPreference,
                campusSetting: formData.campusSetting,
                transportFacility: formData.transportFacility,
                wifiTechInfrastructure: formData.wifiTechInfrastructure,
                coCurricularActivities: formData.coCurricularActivities,
              },
              annualBudget: formData.maxBudget,
              collegeTypePreferences: formData.collegeTypes || [],
              priorityFactors: formData.priorities || [],
            },
            username: user.email,
            gender: formData.gender,
            reservationCategory: formData.reservationCategory,
          };
          const res =
            await apiService.storeKarnatakaEngineeringConfig(karnatakaPayload);
          response = res;
          recommendationId = res.data.engineering_configuration_id;
        } else {
          // Existing Logic
          const payload: GenerateRecommendationRequest = {
            academic_credentials: {
              educationBackground: {
                educationType: "12th",
                stream: formData.grouping,
                district: formData.district,
              },
              academicMarks: {
                _10thGradeMarksPercent: formData.tenthMarks,
                _12thGradeMarksPercent: formData.twelfthMarks,
                groupingMarksPercent: formData.groupingMarks,
              },
              examPercentiles: {
                CET: formData.cetPercentile,
                JEE:
                  formData.jeePercentile && formData.jeePercentile !== ""
                    ? Number(formData.jeePercentile)
                    : undefined,
                otherEntranceExam:
                  formData.otherExamName && formData.otherExamPercentile
                    ? [
                        {
                          examName: formData.otherExamName,
                          percentileOrScore: Number(
                            formData.otherExamPercentile,
                          ),
                        },
                      ]
                    : undefined,
              },
              reservationCategory: formData.reservationCategory,
              achievementsExperience: {
                sportsAchievements: formData.sportsAchievements,
                certifications: formData.certifications,
                internshipsWorkExperience: formData.internships,
                otherAchievements: formData.otherAchievements,
              },
              preferences: {
                engineeringBranches: formData.preferredStreams || [],
                preferredCities:
                  formData.preferredCities &&
                  formData.preferredCities.length > 0
                    ? formData.preferredCities
                    : ["ALL"],
              },
              campusFacilitiesEnvironment: {
                hostelFacility: formData.hostelPreference,
                campusSetting: formData.campusSetting,
                transportFacility: formData.transportFacility,
                wifiTechInfrastructure: formData.wifiTechInfrastructure,
                coCurricularActivities: formData.coCurricularActivities,
              },
              annualBudget: formData.maxBudget,
              collegeTypePreferences: formData.collegeTypes || [],
              priorityFactors: formData.priorities || [],
            },
            username: user.email,
            gender: formData.gender,
          };
          const res = await apiService.generateRecommendation(payload);
          response = res;
          recommendationId = res.data.recommendation_id;
        }

        if (response.success) {
          const token = user.accessToken;
          if (!token) {
            throw new Error("No access token available");
          }

          // Sync preferences for Round 2 and 3
          if (round === 2 || round === 3) {
            try {
              await apiService.updateRoundPreferences(
                {
                  round,
                  branches: formData.preferredStreams || [],
                  cities:
                    formData.preferredCities &&
                    formData.preferredCities.length > 0
                      ? formData.preferredCities
                      : ["ALL"],
                },
                token,
              );
            } catch (prefError) {
              console.error("Failed to sync preferences:", prefError);
            }
          }

          let recommendationsResponse: any;

          if (isKarnataka) {
            const karnatakaPayload: any = {
              category: formData.reservationCategory,
              cet_rank: Number(formData.cetRank),
              cet_course: formData.preferredStreams || [],
              cities:
                formData.preferredCities && formData.preferredCities.length > 0
                  ? formData.preferredCities
                  : ["Bengaluru"],
              gender: formData.gender || "male",
              round: round,
              last_round_choice_college_code: prevChoiceCode || "",
              last_round_choice_course_name: "",
            };

            recommendationsResponse =
              await apiService.karnatakaEngineeringRecommendation(
                karnatakaPayload,
                token,
              );
          } else {
            const recommendationPayload = {
              category: formData.reservationCategory,
              cet_percentile: formData.cetPercentile,
              cet_course: formData.preferredStreams || [],
              location:
                formData.preferredCities && formData.preferredCities.length > 0
                  ? formData.preferredCities
                  : ["ALL"],
              district: formData.district,
              gender: formData.gender || "male", // Defaulting to male if not present, but should ideally come from form
              round: round,
              last_round_college_choice_code: prevChoiceCode || null,
            };

            recommendationsResponse = await apiService.getRecommendations(
              recommendationPayload,
              token,
            );
          }

          if (recommendationsResponse.success) {
            if (
              !recommendationsResponse.data.accept_payment ||
              recommendationsResponse.data.is_payment
            ) {
              localStorage.setItem("recommendationUnlocked", "true");
            }
            const allRecommendations: CollegeRecommendation[] = [];
            const categories = ["Dream", "Reach", "Match", "Safety"] as const;

            categories.forEach((categoryName) => {
              const categoryData = recommendationsResponse.data[categoryName];

              if (Array.isArray(categoryData)) {
                categoryData.forEach((item: any, index: number) => {
                  const recommendation: CollegeRecommendation = {
                    college: {
                      id: item.college.SJ_Institute_Code,
                      name:
                        item.college.College_Name || item.college.college_name,
                      logo:
                        item.college.College_Logo ||
                        item.college.college_logo ||
                        null,
                      city: item.college.City || item.college.city,
                      type:
                        item.college.College_Type ||
                        item.college.college_type ||
                        "Private",
                      rating:
                        item.college.College_Reviews_out_of_5 ||
                        item.college.college_reviews_out_of_5 ||
                        null,
                      fees:
                        item.college["Annual_Fees_(INR)"] ||
                        item.college.annual_fees ||
                        null,
                      placement:
                        item.college.Overall_College_Placement_Percentage ||
                        item.college.overall_college_placement_percentage ||
                        null,
                      Student_Intake:
                        item.college.Student_Intake ||
                        item.college.student_intake ||
                        null,
                      College_Website:
                        item.college.College_Website ||
                        item.college.college_website ||
                        null,
                      College_Hostel_Available:
                        item.college.College_Hostel_Available ||
                        item.college.college_hostel_available ||
                        "No",
                      College_Bus_Facility_Available:
                        item.college.College_Bus_Facility_Available ||
                        item.college.college_bus_facility_available ||
                        "No",
                      Sports_Facilities:
                        item.college.Sports_Facilities ||
                        item.college.sports_facilities ||
                        null,
                      Lab_Facilities:
                        item.college.Lab_Facilities ||
                        item.college.lab_facilities ||
                        null,
                      Top_Recruiters:
                        item.college.Top_Recruiters ||
                        item.college.top_recruiters ||
                        [],
                      college_code:
                        item.college.College_Code ||
                        item.college.College_code ||
                        item.college.college_code ||
                        item.college.dte_code ||
                        item.college.institute_code,
                    },
                    course_name: item.course,
                    category: categoryName,
                    admission_probability: item.admission_probability,
                    probability_message: item.probability_message,
                    cutoff_percentile: item.cutoff,
                    match_reasons: [
                      "Based on your CET percentile and category",
                      "Matches your preferred location",
                      "Offers your preferred course",
                      "Within your specified criteria",
                    ],
                    choice_code: item.choice_code,
                    reservation_category: item.category,
                    cet_percentile: item.cet_percentile || item.cet_rank, // Handle Karnataka rank
                  };

                  allRecommendations.push(recommendation);
                });
              }
            });

            // Save to localStorage and sessionStorage
            recommendationStorage.saveRecommendation(
              formData,
              allRecommendations,
              recommendationId,
            );

            // Store in sessionStorage for immediate access
            sessionStorage.setItem(
              "recommendationFormData",
              JSON.stringify(formData),
            );
            // Store in appropriate storage based on round
            const dataString = JSON.stringify(recommendationsResponse.data);
            const mappedDataString = JSON.stringify(allRecommendations);

            if (round === 2) {
              const sessionKey = isKarnataka
                ? "karnataka_cachedRound2Recommendations"
                : "cachedRound2Recommendations";
              const localKey = isKarnataka
                ? "karnataka_round2Recommendations"
                : "round2Recommendations";
              const prefKey = isKarnataka
                ? "karnataka_round2Preferences"
                : "round2Preferences";

              // Session storage expects mapped array
              sessionStorage.setItem(sessionKey, mappedDataString);
              // Also update legacy key as per recent fixes
              if (!isKarnataka) {
                sessionStorage.setItem(
                  "cachedRound2Recommendations_v3",
                  mappedDataString,
                );
              }

              // Local storage expects raw API response object
              localStorage.setItem(localKey, dataString);

              // Also update preferences for Round 2
              localStorage.setItem(
                prefKey,
                JSON.stringify({
                  branches: formData.preferredStreams || [],
                  cities: formData.preferredCities || [],
                  timestamp: Date.now(),
                }),
              );
            } else if (round === 3) {
              const sessionKey = isKarnataka
                ? "karnataka_cachedRound3Recommendations"
                : "cachedRound3Recommendations";
              const localKey = isKarnataka
                ? "karnataka_round3Recommendations"
                : "round3Recommendations";
              const prefKey = isKarnataka
                ? "karnataka_round3Preferences"
                : "round3Preferences";

              // Session storage expects mapped array
              sessionStorage.setItem(sessionKey, mappedDataString);
              // Also update legacy key as per recent fixes
              if (!isKarnataka) {
                sessionStorage.setItem(
                  "cachedRound3Recommendations_v3",
                  mappedDataString,
                );
              }

              // Local storage expects raw API response object
              localStorage.setItem(localKey, dataString);

              // Also update preferences for Round 3
              localStorage.setItem(
                prefKey,
                JSON.stringify({
                  branches: formData.preferredStreams || [],
                  cities: formData.preferredCities || [],
                  timestamp: Date.now(),
                }),
              );
            } else {
              const sessionKey = isKarnataka
                ? "karnataka_cachedRecommendations"
                : "cachedRecommendations";
              const localKey = isKarnataka
                ? "karnataka_recommendations"
                : "recommendations";

              // Session storage expects mapped array
              sessionStorage.setItem(sessionKey, mappedDataString);
              // Round 1 might not strictly use this local key, but if it does, it likely expects raw or mapped.
              // Given R2/R3 pattern, local is usually raw. But R1 is legacy.
              // Let's store raw for consistency with other rounds, but R1 component loads from API or Session mainly.
              localStorage.setItem(localKey, dataString);
            }

            // setRecommendations(allRecommendations); // This line was removed as it's not in the provided snippet and might be handled elsewhere.

            return {
              ...response.data,
              recommendations: allRecommendations,
              success: true,
            };
          } else {
            throw new Error(
              recommendationsResponse.message ||
                "Failed to fetch recommendations from college-list API",
            );
          }
        } else {
          throw new Error(
            response.message || "Failed to generate recommendation",
          );
        }
      } catch (error: any) {
        console.error("❌ Error generating recommendation:", error);

        toast({
          title: "Failed to Generate Recommendation",
          description:
            error.message ||
            "Unable to generate AI recommendation. Please try again.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [user, isLoggedIn, generateMedicalRecommendation, toast],
  );

  return {
    generateRecommendation,
    isGenerating,
    isLoggedIn,
  };
};
