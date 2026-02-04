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
    reservationCategory: isMedical ? undefined : "GOPENS",
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
          // Check for existing recommendations and redirect if found (unless coming from results page)
          if (!isMedical && !location.state?.fromResults) {
            try {
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
            } catch (checkError) {
              console.error(
                "Error checking existing recommendations:",
                checkError,
              );
              // Continue to load form data if check fails
            }
          }

          // Call appropriate API based on program type
          const selectedState = localStorage.getItem("selected_state") || "";
          const response = isMedical
            ? await apiService.fetchMedicalStudentDetails(
                user.accessToken,
                selectedState,
              )
            : await apiService.fetchAICapDetails(user.accessToken);

          if (response.success && response.data?.academic_credentials) {
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
      if (!isMedical && !formData.district) errors.push("District");
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
        if (!formData.cetPercentile || formData.cetPercentile <= 0)
          errors.push("CET Percentile");
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

      if (location.state?.activeRound) {
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
    } catch (error) {
      console.error("Error generating recommendations:", error);
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
