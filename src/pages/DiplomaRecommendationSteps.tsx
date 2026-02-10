import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { DiplomaAcademicInfoForm } from "@/components/recommendations/diploma/DiplomaAcademicInfoForm";
import { DiplomaBranchesForm } from "@/components/recommendations/diploma/DiplomaBranchesForm";
import { DiplomaCitiesForm } from "@/components/recommendations/diploma/DiplomaCitiesForm";
import { DiplomaRecommendationHeader } from "@/components/recommendations/diploma/DiplomaRecommendationHeader";
import DiplomaRecommendationProgress from "@/components/recommendations/diploma/DiplomaRecommendationProgress";
import StepFormCard from "@/components/recommendations/StepFormCard";
import ValidationErrors from "@/components/recommendations/ValidationErrors";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface DiplomaFormData {
  diplomaPercentage?: number;
  reservationCategory?: string;
  selectedBranches?: string[];
  selectedCities?: string[];
  gender?: string;
}

const DiplomaRecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiplomaFormData>({
    reservationCategory: "GOPEN",
    gender: "male",
    selectedBranches: [],
    selectedCities: [],
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isLoggedIn } = useAuth();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();

  const totalSteps = 3;

  const [searchParams] = useSearchParams();
  const activeRound = searchParams.get("round");
  const storageKey = activeRound
    ? `diploma_form_data_round_${activeRound}`
    : "diploma_form_data";

  // Load saved form data on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem(storageKey);
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // Ensure numeric fields are correctly parsed
        if (parsed.diplomaPercentage) {
          parsed.diplomaPercentage = parseFloat(parsed.diplomaPercentage);
        }
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, [storageKey]);

  // Save form data whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  const validateCurrentStep = () => {
    const errors: string[] = [];

    if (currentStep === 1) {
      if (!formData.diplomaPercentage || formData.diplomaPercentage <= 0) {
        errors.push("Last Year Diploma Percentage");
      }
      if (!formData.reservationCategory) {
        errors.push("Reservation Category");
      }
      if (!formData.gender) {
        errors.push("Gender");
      }
    } else if (currentStep === 2) {
      if (
        !formData.selectedBranches ||
        formData.selectedBranches.length === 0
      ) {
        errors.push("Engineering Branches");
      }
    }
    // Step 3 (cities) is optional, no validation needed

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.diplomaPercentage || formData.diplomaPercentage <= 0) {
      errors.push("Last Year Diploma Percentage");
    }
    if (!formData.reservationCategory) {
      errors.push("Reservation Category");
    }
    if (!formData.gender) {
      errors.push("Gender");
    }
    if (!formData.selectedBranches || formData.selectedBranches.length === 0) {
      errors.push("Engineering Branches");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFormUpdate = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toastHook({
        title: "Missing Information",
        description: "Please fill in all required fields to continue",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setValidationErrors([]);
      scrollToTop();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setValidationErrors([]);
      scrollToTop();
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!validateForm()) {
      toastHook({
        title: "Missing Information",
        description:
          "Please fill in all required fields to generate recommendations",
        variant: "destructive",
      });
      return;
    }

    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Determine active round
      const roundNumber = activeRound ? parseInt(activeRound) : 1;

      // Get last round college choice code if round 2
      let lastRoundChoiceCode = 0;
      if (roundNumber === 2) {
        // 1. Check diplomaRound2Selection
        const storedSelection = localStorage.getItem("diplomaRound2Selection");
        if (storedSelection) {
          try {
            const parsed = JSON.parse(storedSelection);
            if (parsed?.selectedCollege?.selectedDepartment?.choice_code) {
              lastRoundChoiceCode =
                parsed.selectedCollege.selectedDepartment.choice_code;
            }
          } catch (e) {
            console.error("Error reading Round 2 selection:", e);
          }
        }

        // 2. If not found, check diploma_form_data_round_2
        if (!lastRoundChoiceCode) {
          const storedFormData = localStorage.getItem(
            "diploma_form_data_round_2",
          );
          if (storedFormData) {
            try {
              const parsed = JSON.parse(storedFormData);
              if (parsed.last_round_college_choice_code) {
                lastRoundChoiceCode = parsed.last_round_college_choice_code;
              }
            } catch (e) {
              console.error("Error reading Round 2 form data:", e);
            }
          }
        }
      }

      // Prepare payload
      const payload = {
        category: formData.reservationCategory || "GOPEN",
        cet_percentile: formData.diplomaPercentage || 0,
        cet_course: formData.selectedBranches || [],
        location: formData.selectedCities || [],
        gender: formData.gender || "male",
        round: roundNumber,
        last_round_college_choice_code: lastRoundChoiceCode,
      };

      // Save form data to sessionStorage for results page consistency
      sessionStorage.setItem(
        "diplomaRecommendationFormData",
        JSON.stringify(formData),
      );

      // Navigate immediately to Results page
      // Pass flag to start generation and the payload
      navigate(`/diploma-recommendations/results?round=${roundNumber}`, {
        state: {
          startGeneration: true,
          payload: payload,
          activeRound: `round${roundNumber}`,
        },
      });
    } catch (error: any) {
      console.error("Error preparing recommendations:", error);
      toastHook({
        title: "Error",
        description: error.message || "Failed to prepare recommendations",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    // Save form data and clear cache before navigating
    sessionStorage.setItem(
      "diplomaRecommendationFormData",
      JSON.stringify(formData),
    );
    sessionStorage.removeItem("cachedDiplomaRecommendations_v3");
    navigate("/diploma-recommendations/results");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative">
      <Navigation />

      <div className="container mx-auto px-3 py-4 sm:py-6 max-w-5xl relative z-[1]">
        <div className="relative z-[5]">
          <DiplomaRecommendationHeader formData={formData} />
        </div>

        <div className="relative z-[5]">
          <DiplomaRecommendationProgress
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
            isGenerating={isGenerating}
          >
            {currentStep === 1 && (
              <DiplomaAcademicInfoForm
                data={formData}
                onUpdate={handleFormUpdate}
                validationErrors={validationErrors}
              />
            )}

            {currentStep === 2 && (
              <DiplomaBranchesForm
                data={formData}
                onUpdate={handleFormUpdate}
                validationErrors={validationErrors}
              />
            )}

            {currentStep === 3 && (
              <DiplomaCitiesForm
                data={formData}
                onUpdate={handleFormUpdate}
                validationErrors={validationErrors}
              />
            )}
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
    </div>
  );
};

export default DiplomaRecommendationSteps;
