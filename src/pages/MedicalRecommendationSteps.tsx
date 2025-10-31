import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { MedicalAcademicInfoForm } from "@/components/recommendations/medical/MedicalAcademicInfoForm";
import { MedicalPreferencesForm } from "@/components/recommendations/medical/MedicalPreferencesForm";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import RecommendationProgress from "@/components/recommendations/RecommendationProgress";
import ValidationErrors from "@/components/recommendations/ValidationErrors";
import StepFormCard from "@/components/recommendations/StepFormCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles } from 'lucide-react';
import { MedicalFormData } from '@/types/medical';

const MedicalRecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<MedicalFormData>({
    reservationCategory: 'GOPENS',
    grouping: 'PCB (Physics, Chemistry, Biology)'
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { isLoggedIn } = useAuth();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();

  const totalSteps = 2;

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('medicalFormData', JSON.stringify(formData));
  }, [formData]);

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('medicalFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  const steps = [
    {
      number: 1,
      component: MedicalAcademicInfoForm,
    },
    {
      number: 2,
      component: MedicalPreferencesForm,
    }
  ];

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.tenthMarks || formData.tenthMarks <= 0) errors.push('10th Grade Marks');
      if (!formData.reservationCategory) errors.push('Reservation Category');
      if (!formData.twelfthMarks || formData.twelfthMarks <= 0) errors.push('12th Grade Marks');
      if (!formData.grouping) errors.push('12th Grade Grouping');
      if (!formData.groupingMarks || formData.groupingMarks <= 0) errors.push('Grouping (PCB) Marks');
      if (!formData.ugNeetPercentile || formData.ugNeetPercentile <= 0) errors.push('UG-NEET Percentile');
      if (!formData.allIndiaRank || formData.allIndiaRank <= 0) errors.push('All India Rank');
      if (!formData.neetRollNumber || formData.neetRollNumber.trim() === '') errors.push('NEET Roll Number');
    }
    
    if (currentStep === 2) {
      if (!formData.preferredPrograms || formData.preferredPrograms.length === 0) {
        errors.push('Medical Programs');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        variant: "destructive"
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
    setFormData(prev => {
      const updated = { ...prev, ...stepData };
      return updated;
    });
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleGenerateRecommendations = async () => {
    if (!validateCurrentStep()) {
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

    // For now, just show a success message since API is not ready
    toast.success("Form submitted successfully! Recommendations will be generated once the API is ready.");
    console.log('Medical Form Data:', formData);
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    toast.success("Login successful! You can now generate recommendations.");
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 relative">
      <Navigation />

      <div className="container mx-auto px-3 py-4 sm:py-6 max-w-5xl relative z-[1]">
        {/* Header */}
        <div className="relative z-[5] text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4">
            <Heart className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
            First Year Medical Admission
          </h1>
          <p className="text-gray-600 text-lg">
            Get personalized CET recommendations for medical programs
          </p>
        </div>
        
        <div className="relative z-[5]">
          <RecommendationProgress currentStep={currentStep} totalSteps={totalSteps} />
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
    </div>
  );
};

export default MedicalRecommendationSteps;
