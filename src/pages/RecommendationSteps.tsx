import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { AcademicInfoForm } from "@/components/recommendations/AcademicInfoForm";
import { MedicalAcademicInfoForm } from "@/components/recommendations/MedicalAcademicInfoForm";
import { PreferencesForm } from "@/components/recommendations/PreferencesForm";
import { MedicalPreferencesForm } from "@/components/recommendations/MedicalPreferencesForm";
import { PrioritiesForm } from "@/components/recommendations/PrioritiesForm";
import { RecommendationHistory } from "@/components/recommendations/RecommendationHistory";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import LoginDialog from "@/components/auth/LoginDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { RecommendationHeader } from "@/components/recommendations/RecommendationHeader";
import { toast } from "sonner";
import RecommendationProgress from "@/components/recommendations/RecommendationProgress";
import ValidationErrors from "@/components/recommendations/ValidationErrors";
import StepFormCard from "@/components/recommendations/StepFormCard";
import { recommendationStorage } from "@/services/recommendationStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import StepLoadingMessages from "@/components/recommendations/StepLoadingMessages";
import PreferencesConfirmationDialog from "@/components/recommendations/PreferencesConfirmationDialog";
import { mapApiResponseToFormData } from "@/utils/recommendationUtils";

interface FormData {
  tenthMarks?: number;
  educationType?: string;
  reservationCategory?: string;
  twelfthMarks?: number;
  grouping?: string;
  groupingMarks?: number;
  preferredStreams?: string[];
  preferredMedicalPrograms?: string[];
  preferredCities?: string[];
  maxBudget?: number;
  cetPercentile?: number;
  cetRank?: number;
  jeePercentile?: number;
  otherExamName?: string;
  otherExamPercentile?: number;
  sportsAchievements?: string;
  certifications?: string;
  internships?: string;
  otherAchievements?: string;
  hostelPreference?: string;
  campusSetting?: string;
  transportFacility?: string;
  wifiTechInfrastructure?: string;
  coCurricularActivities?: string;
  collegeTypes?: string[];
  priorities?: string[];
  district?: string;
  // Medical-specific fields
  gender?: string;
  neetPercentile?: number;
  neetAllIndiaRank?: number;
  neetRollNumber?: number;
}

const RecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const recommendationType = localStorage.getItem("recommendation_type");
  const isMedical = recommendationType === "First_Year_Medical";

  const [formData, setFormData] = useState<FormData>({
    reservationCategory:
      isMedical || localStorage.getItem("selected_state") === "Karnataka"
        ? undefined
        : "GOPENS",
    grouping: isMedical
      ? "PCB (Physics, Chemistry, Biology)"
      : "PCM (Physics, Chemistry, Mathematics)",
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreferencesConfirmation, setShowPreferencesConfirmation] =
    useState(false);
  const { generateRecommendation } = useRecommendation();
  const { isLoggedIn, user } = useAuth();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  // Map API response to form data structure for Medical
  const mapMedicalApiResponseToFormData = (apiData: any) => {
    // Extract other exam details if available
    const credentials = apiData.academic_credentials || apiData;
    const otherExam = credentials.examPercentiles?.otherEntranceExam?.[0];

    return {
      // Academic Info - gender is at top level
      gender: apiData.gender || undefined,
      reservationCategory: credentials.reservationCategory || undefined,
      grouping:
        credentials.educationBackground?.stream ||
        "PCB (Physics, Chemistry, Biology)",
      tenthMarks:
        credentials.academicMarks?.tenthGradeMarksPercent || undefined,
      twelfthMarks:
        credentials.academicMarks?.twelfthGradeMarksPercent || undefined,
      groupingMarks:
        credentials.academicMarks?.groupingMarksPercent || undefined,

      // Medical Exam Info
      neetPercentile: credentials.examPercentiles?.NEETPercentile || undefined,
      neetAllIndiaRank:
        credentials.examPercentiles?.NEETAllIndiaRank || undefined,
      neetRollNumber: credentials.examPercentiles?.NEETRollNumber || undefined,
      otherExamName: otherExam?.examName || undefined,
      otherExamPercentile: otherExam?.percentileOrScore || undefined,

      // Achievements
      sportsAchievements:
        credentials.achievementsExperience?.sportsAchievements || undefined,
      certifications:
        credentials.achievementsExperience?.certifications || undefined,
      internships:
        credentials.achievementsExperience?.internshipsWorkExperience ||
        undefined,
      otherAchievements:
        credentials.achievementsExperience?.otherAchievements || undefined,

      // Preferences
      preferredMedicalPrograms: credentials.preferences?.medicalPrograms || [],
      preferredCities: credentials.preferences?.preferredCities || [],

      // Campus Facilities
      hostelPreference:
        credentials.campusFacilitiesEnvironment?.hostelFacility || undefined,
      campusSetting:
        credentials.campusFacilitiesEnvironment?.campusSetting || undefined,
      transportFacility:
        credentials.campusFacilitiesEnvironment?.transportFacility || undefined,

      // Budget and Priorities
      maxBudget: credentials.annualBudget || undefined,
      collegeTypes: credentials.collegeTypePreferences || [],
      priorities: credentials.priorityFactors || [],
    };
  };

  const location = useLocation();

  // Load saved form data on mount and fetch existing details if user is logged in
  useEffect(() => {
    const loadFormData = async () => {
      const savedFormData = recommendationStorage.getFormData();
      if (savedFormData) {
        setFormData((prev) => ({ ...prev, ...savedFormData }));
      }

      // Fetch existing user details if logged in
      if (isLoggedIn && user?.accessToken) {
        try {
          const isKarnataka =
            localStorage.getItem("selected_state") === "Karnataka";
          // Check for existing recommendations (Karnataka or General)
          if (!isMedical && !location.state?.fromResults) {
            try {
              // Karnataka Logic
              if (isKarnataka) {
                // Check Round 3
                const round3Data = localStorage.getItem(
                  "karnataka_round3Recommendations",
                );
                if (round3Data) {
                  localStorage.setItem("activeRoundTab", "round3");
                  navigate("/recommendations/results");
                  return;
                }

                // Check Round 2
                const round2Data = localStorage.getItem(
                  "karnataka_round2Recommendations",
                );
                if (round2Data) {
                  localStorage.setItem("activeRoundTab", "round2");
                  navigate("/recommendations/results");
                  return;
                }

                // Check Round 1
                const round1Data = localStorage.getItem(
                  "karnataka_recommendations",
                );
                if (round1Data) {
                  localStorage.setItem("activeRoundTab", "round1");
                  navigate("/recommendations/results");
                  return;
                }
              } else {
                // Existing General Logic
                // Check Round 3
                const round3Response = await apiService.getRoundRecommendations(
                  3,
                  user.accessToken,
                );
                if (
                  round3Response.success &&
                  round3Response.data &&
                  Object.keys(round3Response.data).length > 0
                ) {
                  // If round 3 data exists, save it and redirect
                  localStorage.setItem(
                    "round3Recommendations",
                    JSON.stringify(round3Response.data),
                  );
                  localStorage.setItem("activeRoundTab", "round3");
                  // Also cache converted if possible but Round3Tab handles conversion from raw
                  navigate("/recommendations/results");
                  return;
                }

                // Check Round 2
                const round2Response = await apiService.getRoundRecommendations(
                  2,
                  user.accessToken,
                );
                if (
                  round2Response.success &&
                  round2Response.data &&
                  Object.keys(round2Response.data).length > 0
                ) {
                  localStorage.setItem(
                    "round2Recommendations",
                    JSON.stringify(round2Response.data),
                  );
                  localStorage.setItem("activeRoundTab", "round2");
                  navigate("/recommendations/results");
                  return;
                }

                // Check Round 1
                const round1Response = await apiService.getRoundRecommendations(
                  1,
                  user.accessToken,
                );
                if (
                  round1Response.success &&
                  round1Response.data &&
                  (Array.isArray(round1Response.data)
                    ? round1Response.data.length > 0
                    : Object.keys(round1Response.data).length > 0)
                ) {
                  // Round 1 usually uses 'cachedRecommendations' and 'recommendations'
                  sessionStorage.setItem(
                    "cachedRecommendations",
                    JSON.stringify(round1Response.data),
                  );
                  localStorage.setItem("activeRoundTab", "round1");
                  navigate("/recommendations/results");
                  return;
                }
              }
            } catch (checkError) {
              console.error(
                "Error checking existing recommendations:",
                checkError,
              );
              // Continue to load form data if check fails
            }
          }

          // Call appropriate API based on program type
          // Call appropriate API based on program type
          const selectedState = localStorage.getItem("selected_state") || "";
          let response: any = { success: false };

          if (isMedical) {
            response = await apiService.fetchMedicalStudentDetails(
              user.accessToken,
              selectedState,
            );
          } else if (
            isKarnataka ||
            selectedState.toLowerCase() === "karnataka"
          ) {
            response = await apiService.fetchKarnatakaEngineeringConfig(
              user.accessToken,
            );
          } else {
            // Strictly check to avoid calling AI Cap for Karnataka and ensure state is selected
            if (selectedState && selectedState.toLowerCase() !== "karnataka") {
              response = await apiService.fetchAICapDetails(user.accessToken);
            }
          }

          if (
            response &&
            response.success &&
            response.data?.academic_credentials
          ) {
            // Use appropriate mapping function based on program type
            const mappedData = isMedical
              ? mapMedicalApiResponseToFormData(response.data)
              : mapApiResponseToFormData(response.data);
            setFormData((prev) => ({ ...prev, ...mappedData }));
            toast.success("Loaded your previous details", {
              duration: 3000,
              dismissible: true,
            });
          }
        } catch (error) {
          console.error(
            "No existing data found or error fetching data:",
            error,
          );
        }
      }
    };

    loadFormData();
  }, [isLoggedIn, user, isMedical]);

  // Save form data whenever it changes
  useEffect(() => {
    recommendationStorage.saveFormData(formData);
  }, [formData]);

  const steps = [
    {
      number: 1,
      component: isMedical ? MedicalAcademicInfoForm : AcademicInfoForm,
    },
    {
      number: 2,
      component: isMedical ? MedicalPreferencesForm : PreferencesForm,
    },
    {
      number: 3,
      component: PrioritiesForm,
    },
  ];

  const validateCurrentStep = () => {
    const errors: string[] = [];

    if (currentStep === 1) {
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";
      if (!isMedical && !isKarnataka && !formData.district)
        errors.push("District");
      if (!formData.tenthMarks || formData.tenthMarks <= 0)
        errors.push("10th Grade Marks");
      if (!formData.reservationCategory) errors.push("Reservation Category");
      if (!formData.twelfthMarks || formData.twelfthMarks <= 0)
        errors.push("12th Grade Marks");
      if (!formData.grouping) errors.push("12th Grade Grouping");
      if (!formData.groupingMarks || formData.groupingMarks <= 0)
        errors.push("Grouping Marks");

      // Different validation for medical vs engineering
      if (isMedical) {
        if (!formData.gender) errors.push("Gender");
        if (!formData.neetPercentile || formData.neetPercentile <= 0)
          errors.push("NEET Percentile");
        if (!formData.neetAllIndiaRank || formData.neetAllIndiaRank <= 0)
          errors.push("All India Rank");
        if (
          !formData.neetRollNumber ||
          formData.neetRollNumber < 1000000000 ||
          formData.neetRollNumber > 9999999999
        )
          errors.push("NEET Roll Number");
      } else {
        if (!formData.gender) errors.push("Gender");
        if (isKarnataka) {
          if (!formData.cetRank || formData.cetRank <= 0)
            errors.push("CET Rank");
        } else {
          if (!formData.cetPercentile || formData.cetPercentile <= 0)
            errors.push("CET Percentile");
        }
      }
    }

    if (currentStep === 2) {
      if (isMedical) {
        if (
          !formData.preferredMedicalPrograms ||
          formData.preferredMedicalPrograms.length === 0
        ) {
          errors.push("Medical Programs");
        }
      } else {
        if (
          !formData.preferredStreams ||
          formData.preferredStreams.length === 0
        ) {
          errors.push("Engineering Branches");
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.maxBudget || formData.maxBudget <= 0)
        errors.push("Annual Budget");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, [currentStep]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        scrollToTop();
      }
    } else {
      toastHook({
        title: "Missing Information",
        description: "Please fill in all required fields to continue",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
      scrollToTop();
    }
  };

  const handleFormUpdate = (stepData: any) => {
    setFormData((prev) => {
      const updated = { ...prev, ...stepData };
      return updated;
    });
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleLoadFormData = (loadedFormData: any) => {
    setFormData(loadedFormData);
    setShowHistory(false);
    toastHook({
      title: "Form Data Loaded",
      description: "Previous form data has been loaded successfully.",
      duration: 3000,
    });
  };

  const handleGenerateRecommendations = async () => {
    if (!validateCurrentStep()) {
      toastHook({
        title: "Missing Information",
        description:
          "Please fill in all required fields to generate recommendations",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    const recommendationType = localStorage.getItem("recommendation_type");

    // Check login status
    if (!user) {
      setLoginOpen(true);
      return;
    }

    // Clear cached recommendations
    sessionStorage.removeItem("cachedRecommendations");
    sessionStorage.removeItem("cachedMedicalRecommendations");

    // Show loading state
    setIsLoading(true);

    try {
      // Determine round and choice code from state
      let roundNumber = 1;
      let activeRoundTab = "round_1";
      const choiceCode = location.state?.choiceCode;
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      if (location.state?.activeRound) {
        // Handle Karnataka specific Round 2/3 logic
        if (
          isKarnataka &&
          (location.state.activeRound === "round2" ||
            location.state.activeRound === "round3")
        ) {
          const targetRound = location.state.activeRound === "round2" ? 2 : 3;
          const selectionData = location.state.selectionData;

          // 1. Store Config
          const nestedPayload = {
            username: user.email || "",
            gender: formData.gender || "male",
            reservationCategory: formData.reservationCategory || "GM",
            academic_credentials: {
              educationBackground: {
                educationType: formData.educationType || "12th",
                stream:
                  formData.grouping || "PCM (Physics, Chemistry, Mathematics)",
              },
              academicMarks: {
                _10thGradeMarksPercent: formData.tenthMarks || 0,
                _12thGradeMarksPercent: formData.twelfthMarks || 0,
                groupingMarksPercent: formData.groupingMarks || 0,
              },
              examPercentiles: {
                CET_Rank: formData.cetRank || 0,
                JEE: formData.jeePercentile || 0,
                otherEntranceExam: formData.otherExamName
                  ? [
                      {
                        examName: formData.otherExamName,
                        percentileOrScore: formData.otherExamPercentile || 0,
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
                preferredCities: formData.preferredCities || [],
              },
              campusFacilitiesEnvironment: {
                hostelFacility: formData.hostelPreference,
                campusSetting: formData.campusSetting,
                transportFacility: formData.transportFacility,
                wifiTechInfrastructure: formData.wifiTechInfrastructure,
                coCurricularActivities: formData.coCurricularActivities,
              },
              annualBudget: formData.maxBudget || 0,
              collegeTypePreferences: formData.collegeTypes || [],
              priorityFactors: formData.priorities || [],
            },
          };

          await apiService.storeKarnatakaEngineeringConfig(
            nestedPayload as any,
          );

          // 2. Prepare Payload
          const category = formData.reservationCategory || "GM";
          const cetRank = formData.cetRank || 0;
          const gender = formData.gender || "male"; // Should likely come from profile if not in form

          // Need to get selected branches and cities from storage as they might not be in the form data
          // or we assume they are passed/loaded correctly.
          // Usually branches/cities are in step 2. We should assume formData has them if step 2 was completed.
          // However, if the user only edited Step 1 (profile), formData will have them if we loaded them.

          // Fallback to reading from storage if missing in formData but present in previous config
          const savedData = recommendationStorage.getFormData();
          const selectedBranches =
            formData.preferredStreams || savedData?.preferredStreams || [];
          const selectedCities = formData.preferredCities ||
            savedData?.preferredCities || ["ALL"];

          // Get previous round selection details
          // Logic: For Round 2, we need Round 1 choice. For Round 3, we need Round 2 choice.
          // The 'selectionData' passed from Results should be the RELEVANT previous selection.
          // Round2Tab passed "round1Selection" (or round2Selection context).

          // Extract codes
          let lastRoundCollegeCode = "";
          let lastRoundCourseName = "";

          if (selectionData && selectionData.selectedCollege) {
            lastRoundCollegeCode =
              selectionData.selectedCollege.college?.College_code?.toString() ||
              "";
            lastRoundCourseName =
              selectionData.selectedCollege.selectedDepartment?.course_name ||
              "";
          }

          // Fallback to session/local storage if state data is missing or empty
          if (!lastRoundCollegeCode) {
            try {
              // Keys based on user report and code inspection
              // For Round 2 (targetRound 2), we need Round 1 choice.
              // For Round 3 (targetRound 3), we need Round 2 choice.

              let storageKey = "";
              if (targetRound === 2) {
                storageKey = "round2SelectedCollege";
              } else if (targetRound === 3) {
                storageKey = "round3SelectedCollege";
              }

              let stored = sessionStorage.getItem(storageKey); // User specified session storage

              // If not found, try alternative keys
              if (!stored && targetRound === 3) {
                stored =
                  sessionStorage.getItem("round2Selection") ||
                  localStorage.getItem("round2Selection");
              }
              if (!stored && targetRound === 2) {
                stored = localStorage.getItem("round1Selection"); // Round2Tab uses localStorage for round1Selection often
              }

              if (stored) {
                const parsed = JSON.parse(stored);
                // Check structure: selectedCollege -> college -> College_code
                if (parsed.selectedCollege) {
                  lastRoundCollegeCode =
                    parsed.selectedCollege.college?.College_code?.toString() ||
                    "";
                  lastRoundCourseName =
                    parsed.selectedCollege.selectedDepartment?.course_name ||
                    "";
                } else if (parsed.college) {
                  // Possible flat structure in some cases?
                  lastRoundCollegeCode =
                    parsed.college?.College_code?.toString() || "";
                  lastRoundCourseName =
                    parsed.selectedDepartment?.course_name || "";
                }
              }
            } catch (e) {
              console.error(
                "Error reading storage fallback for Karnataka choices",
                e,
              );
            }
          }

          const payload = {
            category: category,
            cet_rank: cetRank,
            cet_course: selectedBranches,
            cities: selectedCities,
            gender: gender,
            round: targetRound,
            last_round_choice_college_code: lastRoundCollegeCode,
            last_round_choice_course_name: lastRoundCourseName,
          };

          // 3. Call API
          const response = await apiService.karnatakaEngineeringRecommendation(
            payload,
            user.accessToken,
          );

          if (response.success && response.data) {
            // 4. Map and Store
            // Note: karnatakaEngineeringRecommendation returns specific format.
            // We might need to convert it or store it raw depending on what Result page expects.
            // The Result page (Round2Tab) expects `round2Recommendations` in local storage.

            const storageKey =
              targetRound === 2
                ? "karnataka_round2Recommendations"
                : "karnataka_round3Recommendations"; // OR "round2Recommendations" ?
            // Round2Tab checks "round2Recommendations" (generic) OR "karnataka_round2Recommendations" (maybe?).
            // Let's check Round2Tab uses `localStorage.getItem("round2Recommendations")`.

            // Wait, for Karnataka, `Round2Tab` (standard) uses `response.data` stored in `round2Recommendations`.
            // Save updated preferences to storage so UI reflects changes
            recommendationStorage.saveAcademicDetails(formData);
            recommendationStorage.savePreferences(formData);
            recommendationStorage.savePriorities(formData);

            // Also update the main formData keys used by Results page
            localStorage.setItem(
              "recommendationFormData",
              JSON.stringify(formData),
            );
            sessionStorage.setItem(
              "recommendationFormData",
              JSON.stringify(formData),
            );

            localStorage.setItem(
              targetRound === 2
                ? "round2Recommendations"
                : "round3Recommendations",
              JSON.stringify(response.data),
            );

            localStorage.setItem("activeRoundTab", location.state.activeRound);
            navigate("/recommendations/results", {
              state: {
                refreshId: Date.now(),
                activeRound: location.state.activeRound, // Preserve active round
              },
            });
            return;
          } else {
            throw new Error(
              response.message || "Failed to generate recommendations",
            );
          }
        }

        if (location.state.activeRound === "round2") {
          roundNumber = 2;
          activeRoundTab = "round2";
        } else if (location.state.activeRound === "round3") {
          roundNumber = 3;
          activeRoundTab = "round3";
        } else {
          // Default or round1
          roundNumber = 1;
          activeRoundTab = "round1";
        }
      } else {
        // Default to Round 1 if no state
        roundNumber = 1;
        activeRoundTab = "round1";
      }

      // If round > 1 and choiceCode is missing, try to resolve it
      let resolvedChoiceCode = choiceCode;

      if (roundNumber > 1 && !resolvedChoiceCode) {
        // Only need previous choice for Round 3 (from Round 2)
        // Or Round 2 (from Round 1 if applicable - though usually R2 is fresh or from R1 cutoff?
        // Logic mainly applies to R3 needing R2 choice

        const prevRound = roundNumber - 1;

        // 1. Try Session Storage
        const storageKey = `round${prevRound}SelectedCollege`;
        const savedSelection = sessionStorage.getItem(storageKey);

        if (savedSelection) {
          try {
            const parsed = JSON.parse(savedSelection);
            resolvedChoiceCode = parsed.selectedDepartment?.choice_code;
          } catch (e) {
            console.error("Error parsing saved selection", e);
          }
        }

        // 2. If still missing, try API
        if (!resolvedChoiceCode && user.accessToken) {
          try {
            const detailsResponse = await apiService.getUserRoundDetails(
              prevRound,
              user.accessToken,
            );
            if (detailsResponse.success && detailsResponse.data) {
              // Assuming data has choice_code or similar structure
              // Adjust based on UserRoundDetailsResponse definition
              const data = detailsResponse.data as any;
              resolvedChoiceCode = data.choice_code;
            }
          } catch (apiError) {
            console.error("Failed to fetch previous round details", apiError);
          }
        }
      }

      // Call the recommendation generation with the specific round and previous choice code
      await generateRecommendation(formData, roundNumber, resolvedChoiceCode);

      // Set the active tab for the results page
      localStorage.setItem("activeRoundTab", activeRoundTab);

      // Navigate to results page after successful generation
      if (recommendationType === "First_Year_Medical") {
        navigate("/medical-recommendations/results");
      } else {
        navigate("/recommendations/results");
      }
    } catch (error: any) {
      console.error("Error generating recommendations:", error);

      // Parse validation errors
      if (error.message && error.message.includes("Missing required fields:")) {
        const missingFields = error.message
          .replace("Missing required fields: ", "")
          .split(", ")
          .map((field: string) => {
            // Map field names to display names if needed for specific highlighting
            // Since AcademicInfoForm checks "error.toLowerCase().includes(fieldName.toLowerCase())",
            // we can return the field name directly or a user-friendly name that matches the check.
            if (field === "reservationCategory") return "Reservation Category";
            if (field === "tenthMarks") return "10th Grade Marks";
            if (field === "twelfthMarks") return "12th Grade Marks";
            if (field === "groupingMarks") return "Grouping Marks";
            if (field === "cetRank") return "CET Rank";
            if (field === "cetPercentile") return "CET Percentile";
            if (field === "gender") return "Gender";
            if (field === "grouping") return "12th Grade Grouping";
            if (field === "neetPercentile") return "NEET Percentile";
            if (field === "neetAllIndiaRank") return "NEET All India Rank";
            if (field === "district") return "District";

            return field;
          });
        setValidationErrors(missingFields);
      } else {
        setValidationErrors([]);
      }

      toastHook({
        title: "Error",
        description:
          error.message ||
          "Failed to generate recommendations. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPreferences = async () => {
    setShowPreferencesConfirmation(false);
    sessionStorage.removeItem("cachedRecommendations");
    sessionStorage.removeItem("cachedMedicalRecommendations");

    const recommendationType = localStorage.getItem("recommendation_type");

    if (recommendationType === "First_Year_Medical") {
      navigate("/medical-recommendations/results");
    } else {
      navigate("/recommendations/results");
    }

    // Start generation in background
    try {
      window.scrollTo(0, 0);
      setIsLoading(true);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    const recommendationType = localStorage.getItem("recommendation_type");

    // Show loading state
    setIsLoading(true);

    try {
      // Generate recommendations after successful login
      await generateRecommendation(formData);

      // Navigate to results page after successful generation
      if (recommendationType === "First_Year_Medical") {
        navigate("/medical-recommendations/results");
      } else {
        navigate("/recommendations/results");
      }
    } catch (error) {
      console.error("Error generating recommendations after login:", error);
      toastHook({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  if (isLoading) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative">
      <Navigation />

      <div className="container mx-auto px-3 py-4 sm:py-6 max-w-5xl relative z-[1]">
        <div className="relative z-[5]">
          <RecommendationHeader formData={formData} />
        </div>

        <div className="relative z-[5]">
          <RecommendationProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
        </div>

        <div className="relative z-[15]">
          <ValidationErrors errors={validationErrors} />
        </div>

        <div className="relative z-[20]">
          <StepFormCard
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onGenerateRecommendations={handleGenerateRecommendations}
            isGenerating={false}
          >
            <CurrentStepComponent
              data={formData}
              onUpdate={handleFormUpdate}
              validationErrors={validationErrors}
              {...(currentStep === 3 && isMedical
                ? { collegeTypeOptions: ["Government", "Private"] }
                : {})}
            />
          </StepFormCard>
        </div>
      </div>

      <LoginDialog
        open={loginOpen}
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open && isLoggedIn) {
            handleLoginSuccess();
          }
        }}
      />

      <PreferencesConfirmationDialog
        isOpen={showPreferencesConfirmation}
        onClose={() => setShowPreferencesConfirmation(false)}
        onConfirm={handleConfirmPreferences}
        formData={formData}
      />
    </div>
  );
};

export default RecommendationSteps;
