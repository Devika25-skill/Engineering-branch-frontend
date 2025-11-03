import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import { AcademicInfoForm } from "@/components/recommendations/AcademicInfoForm";
import { MedicalAcademicInfoForm } from "@/components/recommendations/MedicalAcademicInfoForm";
import { PreferencesForm } from "@/components/recommendations/PreferencesForm";
import { PrioritiesForm } from "@/components/recommendations/PrioritiesForm";
import { RecommendationHistory } from "@/components/recommendations/RecommendationHistory";
import { useRecommendation } from "@/hooks/useRecommendation";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import LoginDialog from "@/components/auth/LoginDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RecommendationHeader } from "@/components/recommendations/RecommendationHeader";
import { toast } from "sonner";
import RecommendationProgress from "@/components/recommendations/RecommendationProgress";
import ValidationErrors from "@/components/recommendations/ValidationErrors";
import StepFormCard from "@/components/recommendations/StepFormCard";
import { recommendationStorage } from "@/services/recommendationStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, X } from 'lucide-react';
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';
import PreferencesConfirmationDialog from '@/components/recommendations/PreferencesConfirmationDialog';

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
  // Medical-specific fields
  neetPercentile?: number;
  neetAllIndiaRank?: number;
  neetRollNumber?: string;
}

const RecommendationSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const recommendationType = localStorage.getItem('recommendation_type');
  const isMedical = recommendationType === 'First_Year_Medical';
  
  const [formData, setFormData] = useState<FormData>({
    reservationCategory: "GOPENS",
    grouping: isMedical ? "PCB (Physics, Chemistry, Biology)" : "PCM (Physics, Chemistry, Mathematics)"
  });
  const [loginOpen, setLoginOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPreferencesConfirmation, setShowPreferencesConfirmation] = useState(false);
  const { generateRecommendation } = useRecommendation();
  const { isLoggedIn, user } = useAuth();
  const { toast: toastHook } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  // Map API response to form data structure
  const mapApiResponseToFormData = (apiData: any) => {
    // Extract other exam details if available
    const otherExam = apiData.examPercentiles?.otherEntranceExam?.[0];
    
    return {
      // Academic Info
      reservationCategory: apiData.reservationCategory || 'GOPENS',
      grouping: apiData.educationBackground?.stream || 'PCM (Physics, Chemistry, Mathematics)',
      tenthMarks: apiData.academicMarks?._10thGradeMarksPercent || undefined,
      twelfthMarks: apiData.academicMarks?._12thGradeMarksPercent || undefined,
      groupingMarks: apiData.academicMarks?.groupingMarksPercent || undefined,
      cetPercentile: apiData.examPercentiles?.CET || undefined,
      jeePercentile: apiData.examPercentiles?.JEE || undefined,
      otherExamName: otherExam?.examName || undefined,
      otherExamPercentile: otherExam?.percentileOrScore || undefined,
      sportsAchievements: apiData.achievementsExperience?.sportsAchievements || undefined,
      certifications: apiData.achievementsExperience?.certifications || undefined,
      internships: apiData.achievementsExperience?.internshipsWorkExperience || undefined,
      otherAchievements: apiData.achievementsExperience?.otherAchievements || undefined,
      
      // Preferences
      preferredStreams: apiData.preferences?.engineeringBranches || [],
      preferredCities: apiData.preferences?.preferredCities || [],
      
      // Priorities
      hostelPreference: apiData.campusFacilitiesEnvironment?.hostelFacility || undefined,
      campusSetting: apiData.campusFacilitiesEnvironment?.campusSetting || undefined,
      transportFacility: apiData.campusFacilitiesEnvironment?.transportFacility || undefined,
      wifiTechInfrastructure: apiData.campusFacilitiesEnvironment?.wifiTechInfrastructure || undefined,
      coCurricularActivities: apiData.campusFacilitiesEnvironment?.coCurricularActivities || undefined,
      maxBudget: apiData.annualBudget || undefined,
      collegeTypes: apiData.collegeTypePreferences || [],
      priorities: apiData.priorityFactors || [],
    };
  };

  // Load saved form data on mount and fetch existing details if user is logged in
  useEffect(() => {
    const loadFormData = async () => {
      const savedFormData = recommendationStorage.getFormData();
      if (savedFormData) {
        setFormData(prev => ({ ...prev, ...savedFormData }));
      }

      // Fetch existing user details if logged in
      if (isLoggedIn && user?.accessToken) {
        try {
          const response = await apiService.fetchAICapDetails(user.accessToken);
          if (response.success && response.data?.academic_credentials) {
            const mappedData = mapApiResponseToFormData(response.data.academic_credentials);
            setFormData(prev => ({ ...prev, ...mappedData }));
            toast.success("Loaded your previous details");
          }
        } catch (error) {
          console.error('No existing data found or error fetching data:', error);
        }
      }
    };

    loadFormData();
  }, [isLoggedIn, user]);

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
      
      // Different validation for medical vs engineering
      if (isMedical) {
        if (!formData.neetPercentile || formData.neetPercentile <= 0) errors.push('NEET Percentile');
        if (!formData.neetAllIndiaRank || formData.neetAllIndiaRank <= 0) errors.push('All India Rank');
        if (!formData.neetRollNumber || formData.neetRollNumber.trim() === '') errors.push('NEET Roll Number');
      } else {
        if (!formData.cetPercentile || formData.cetPercentile <= 0) errors.push('CET Percentile');
      }
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

  const handleLoadFormData = (loadedFormData: any) => {
    setFormData(loadedFormData);
    setShowHistory(false);
    toastHook({
      title: "Form Data Loaded",
      description: "Previous form data has been loaded successfully.",
    });
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

    // Directly navigate to results without confirmation
    sessionStorage.removeItem('cachedRecommendations');
    navigate('/recommendations/results');
  };

  const handleConfirmPreferences = async () => {
    setShowPreferencesConfirmation(false);
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
