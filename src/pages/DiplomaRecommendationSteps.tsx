import { useState, useEffect } from 'react';
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DiplomaFormData {
  diplomaPercentage?: number;
  reservationCategory?: string;
  selectedBranches?: string[];
  selectedCities?: string[];
}

const DiplomaRecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiplomaFormData>({
    reservationCategory: "GOPEN",
    selectedBranches: [],
    selectedCities: []
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isLoggedIn } = useAuth();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();

  const totalSteps = 3;

  // Load saved form data on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('diploma_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    localStorage.setItem('diploma_form_data', JSON.stringify(formData));
  }, [formData]);

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.diplomaPercentage || formData.diplomaPercentage <= 0) {
        errors.push('Last Year Diploma Percentage');
      }
      if (!formData.reservationCategory) {
        errors.push('Reservation Category');
      }
    } else if (currentStep === 2) {
      if (!formData.selectedBranches || formData.selectedBranches.length === 0) {
        errors.push('Engineering Branches');
      }
    }
    // Step 3 (cities) is optional, no validation needed
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.diplomaPercentage || formData.diplomaPercentage <= 0) {
      errors.push('Last Year Diploma Percentage');
    }
    if (!formData.reservationCategory) {
      errors.push('Reservation Category');
    }
    if (!formData.selectedBranches || formData.selectedBranches.length === 0) {
      errors.push('Engineering Branches');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleFormUpdate = (stepData: any) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toastHook({
        title: "Missing Information", 
        description: "Please fill in all required fields to continue",
        variant: "destructive"
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
        description: "Please fill in all required fields to generate recommendations",
        variant: "destructive"
      });
      return;
    }

    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Save form data to sessionStorage for results page
      sessionStorage.setItem('diplomaRecommendationFormData', JSON.stringify(formData));
      // Clear any existing cached recommendations to force new generation
      sessionStorage.removeItem('cachedDiplomaRecommendations');
      // Navigate to diploma results page
      navigate('/diploma-recommendations/results');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    // Save form data and clear cache before navigating
    sessionStorage.setItem('diplomaRecommendationFormData', JSON.stringify(formData));
    sessionStorage.removeItem('cachedDiplomaRecommendations');
    navigate('/diploma-recommendations/results');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <DiplomaRecommendationProgress currentStep={currentStep} totalSteps={totalSteps} />
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