import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { AcademicInfoForm } from "@/components/recommendations/AcademicInfoForm";
import { PreferencesForm } from "@/components/recommendations/PreferencesForm";
import { PrioritiesForm } from "@/components/recommendations/PrioritiesForm";
import { RecommendationHistory } from "@/components/recommendations/RecommendationHistory";
import { useRecommendation } from "@/hooks/useRecommendation";
import LoginDialog from "@/components/auth/LoginDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RecommendationHeader } from "@/components/recommendations/RecommendationHeader";
import RecommendationProgress from "@/components/recommendations/RecommendationProgress";
import ValidationErrors from "@/components/recommendations/ValidationErrors";
import StepFormCard from "@/components/recommendations/StepFormCard";
import { recommendationStorage } from "@/services/recommendationStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, X } from 'lucide-react';
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';

interface FormData {
  tenthMarks?: number;
  educationType?: string;
  reservationCategory?: string;
  twelfthMarks?: number;
  grouping?: string;
  groupingMarks?: number;
  preferredStreams?: string[];
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
}

const RecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    reservationCategory: "GOPENS",
    grouping: "PCM (Physics, Chemistry, Mathematics)"
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { generateRecommendation, isLoggedIn } = useRecommendation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  // Load saved form data on mount
  useEffect(() => {
    const savedFormData = recommendationStorage.getFormData();
    if (savedFormData) {
      setFormData(prev => ({ ...prev, ...savedFormData }));
    
    }
  }, []);

  // Save form data whenever it changes
  useEffect(() => {
    recommendationStorage.saveFormData(formData);
  }, [formData]);

  const steps = [
    {
      number: 1,
      component: AcademicInfoForm,
    },
    {
      number: 2,
      component: PreferencesForm,
    },
    {
      number: 3,
      component: PrioritiesForm,
    }
  ];

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    if (currentStep === 1) {
      if (!formData.tenthMarks || formData.tenthMarks <= 0) errors.push('10th Grade Marks');
      if (!formData.reservationCategory) errors.push('Reservation Category');
      if (!formData.twelfthMarks || formData.twelfthMarks <= 0) errors.push('12th Grade Marks');
      if (!formData.grouping) errors.push('12th Grade Grouping');
      if (!formData.groupingMarks || formData.groupingMarks <= 0) errors.push('Grouping Marks');
      if (!formData.cetPercentile || formData.cetPercentile <= 0) errors.push('CET Percentile');
    }
    
    if (currentStep === 2) {
      if (!formData.preferredStreams || formData.preferredStreams.length === 0) {
        errors.push('Engineering Branches');
      }
    }
    
    if (currentStep === 3) {
      if (!formData.maxBudget || formData.maxBudget <= 0) errors.push('Annual Budget');
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
      toast({
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

  const handleLoadFormData = (loadedFormData: any) => {
    setFormData(loadedFormData);
    setShowHistory(false);
    toast({
      title: "Form Data Loaded",
      description: "Previous form data has been loaded successfully.",
    });
  };

  const handleGenerateRecommendations = async () => {
    if (!validateCurrentStep()) {
      toast({
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
    sessionStorage.removeItem('cachedRecommendations');
    navigate('/recommendations/results');
    
    // Start generation in background
    try {
      window.scrollTo(0, 0);
      setIsLoading(true);
      
      // const result = await generateRecommendation(formData);
      // if (result && result.success) {
      //   navigate('/recommendations/results');
      // } else {
      //   console.error('❌ Failed to generate recommendations');
      // }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // If there's an error, we could navigate back or handle it on the results page
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    
    // Navigate immediately to results page after login
    navigate('/recommendations/results');
    
    // Start generation in background
    try {
      // await generateRecommendation(formData);
    } catch (error) {
      console.error('Error generating recommendations after login:', error);
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

export default RecommendationSteps;
