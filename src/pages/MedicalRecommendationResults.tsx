import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMedicalRecommendation } from "@/hooks/useMedicalRecommendation";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { MedicalRecommendationResults as ResultsComponent } from "@/components/recommendations/MedicalRecommendationResults";
import { useToast } from "@/hooks/use-toast";
import { State } from "@/types/state";

const MedicalRecommendationResults = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { isGenerating } = useMedicalRecommendation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>({
    Dream: [],
    Reach: [],
    Match: [],
    Safety: []
  });
  const [paymentData, setPaymentData] = useState<{ is_payment: boolean; accept_payment: boolean }>({
    is_payment: false,
    accept_payment: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeRound, setActiveRound] = useState<'round1' | 'round2' | 'round3'>('round1');
  const [isRoundInvalidated, setIsRoundInvalidated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper function to transform API student data to formData format
  const transformStudentDataToFormData = (apiData: any) => {
    const credentials = apiData.academic_credentials || {};
    return {
      reservationCategory: credentials.reservationCategory || '',
      neetAllIndiaRank: credentials.examPercentiles?.NEETAllIndiaRank || 0,
      neetPercentile: credentials.examPercentiles?.NEETPercentile || 0,
      neetRollNumber: credentials.examPercentiles?.NEETRollNumber || 0,
      tenthMarks: credentials.academicMarks?._10thGradeMarksPercent || 0,
      twelfthMarks: credentials.academicMarks?._12thGradeMarksPercent || 0,
      groupingMarks: credentials.academicMarks?.groupingMarksPercent || 0,
      gender: apiData.gender || '',
      preferredMedicalPrograms: credentials.preferences?.medicalPrograms || ['ALL'],
      preferredCities: credentials.preferences?.preferredCities || ['ALL'],
      annualBudget: credentials.annualBudget || 0,
      collegeTypePreferences: credentials.collegeTypePreferences || ['ALL'],
      priorityFactors: credentials.priorityFactors || ['ALL'],
    };
  };

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        let savedFormData = recommendationStorage.getFormData();
        const savedActiveRound = sessionStorage.getItem('medicalActiveRound');
        const roundToLoad = savedActiveRound === '2' ? 'round2' : savedActiveRound === '3' ? 'round3' : 'round1';

        // If formData is missing or incomplete, fetch from API
        const isFormDataIncomplete = !savedFormData || 
          !savedFormData.reservationCategory || 
          !savedFormData.neetAllIndiaRank;

        if (isFormDataIncomplete && user?.accessToken) {
          console.log('Form data missing/incomplete, fetching student details from API...');
          try {
            const studentDetailsResponse = await apiService.fetchMedicalStudentDetails(user.accessToken);
            if (studentDetailsResponse.success && studentDetailsResponse.data) {
              savedFormData = transformStudentDataToFormData(studentDetailsResponse.data);
              // Save to storage for future use
              recommendationStorage.saveFormData(savedFormData);
              console.log('Student details fetched and saved:', savedFormData);
            }
          } catch (fetchError) {
            console.error('Error fetching student details:', fetchError);
          }
        }

        if (savedFormData) {
          setFormData(savedFormData);
          setActiveRound(roundToLoad);

          // Load data for the specific round
          const roundNumber = roundToLoad === 'round2' ? 2 : roundToLoad === 'round3' ? 3 : 1;
          const cacheKey = `cachedMedicalRound${roundNumber}Recommendations`;
          const cachedData = sessionStorage.getItem(cacheKey);

          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setRecommendations({
              Dream: Array.isArray(parsed.Dream) ? parsed.Dream : [],
              Reach: Array.isArray(parsed.Reach) ? parsed.Reach : [],
              Match: Array.isArray(parsed.Match) ? parsed.Match : [],
              Safety: Array.isArray(parsed.Safety) ? parsed.Safety : []
            });
            setPaymentData({
              is_payment: parsed.is_payment || false,
              accept_payment: parsed.accept_payment || true
            });
          } else {
            // Check if this round was invalidated due to form update
            const invalidationKey = `round${roundNumber}Invalidated`;
            const isInvalidated = sessionStorage.getItem(invalidationKey) === 'true';
            setIsRoundInvalidated(isInvalidated);
            
            if (!isInvalidated && user?.accessToken) {
              // Only fetch from API if not invalidated
              const selectedState = localStorage.getItem('selected_state') || '';
              const response = await apiService.getMedicalRecommendationsByRound(roundNumber, user.accessToken, selectedState);
              
              if (response.success && response.data) {
                setRecommendations({
                  Dream: Array.isArray(response.data.Dream) ? response.data.Dream : [],
                  Reach: Array.isArray(response.data.Reach) ? response.data.Reach : [],
                  Match: Array.isArray(response.data.Match) ? response.data.Match : [],
                  Safety: Array.isArray(response.data.Safety) ? response.data.Safety : []
                });
                setPaymentData({
                  is_payment: response.data.is_payment || false,
                  accept_payment: response.data.accept_payment || true
                });
                
                // Cache the data
                sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
              }
            } else {
              // Round was invalidated, show empty state
              setRecommendations({
                Dream: [],
                Reach: [],
                Match: [],
                Safety: []
              });
              setPaymentData({
                is_payment: false,
                accept_payment: true
              });
            }
          }
          setIsLoading(false);
        } else if (isLoggedIn) {
          navigate('/recommendations');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        navigate('/recommendations');
      }
    };

    loadRecommendations();
  }, [isLoggedIn, navigate, user?.accessToken]);

  // Handle tab switching to load correct round data
  const handleRoundChange = async (round: 'round1' | 'round2' | 'round3') => {
    if (!user?.accessToken) return;
    
    setActiveRound(round);
    // Update sessionStorage to sync state
    const roundNumber = round === 'round2' ? '2' : round === 'round3' ? '3' : '1';
    sessionStorage.setItem('medicalActiveRound', roundNumber);
    setIsLoading(true);

    try {
      const roundNumber = round === 'round2' ? 2 : 1;
      
      // Check sessionStorage first
      const cacheKey = `cachedMedicalRound${roundNumber}Recommendations`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setRecommendations({
          Dream: Array.isArray(parsed.Dream) ? parsed.Dream : [],
          Reach: Array.isArray(parsed.Reach) ? parsed.Reach : [],
          Match: Array.isArray(parsed.Match) ? parsed.Match : [],
          Safety: Array.isArray(parsed.Safety) ? parsed.Safety : []
        });
        setPaymentData({
          is_payment: parsed.is_payment || false,
          accept_payment: parsed.accept_payment || true
        });
        
        // Clear invalidation flag since we're now viewing this round
        sessionStorage.removeItem(`round${roundNumber}Invalidated`);
      } else {
        // Check if this round was invalidated due to form update
        const invalidationKey = `round${roundNumber}Invalidated`;
        const isInvalidated = sessionStorage.getItem(invalidationKey) === 'true';
        setIsRoundInvalidated(isInvalidated);
        
        if (!isInvalidated && user?.accessToken) {
          // Only fetch from API if not invalidated
          const selectedState = localStorage.getItem('selected_state') || '';
          const response = await apiService.getMedicalRecommendationsByRound(roundNumber, user.accessToken, selectedState);
          
          if (response.success && response.data) {
            setRecommendations({
              Dream: Array.isArray(response.data.Dream) ? response.data.Dream : [],
              Reach: Array.isArray(response.data.Reach) ? response.data.Reach : [],
              Match: Array.isArray(response.data.Match) ? response.data.Match : [],
              Safety: Array.isArray(response.data.Safety) ? response.data.Safety : []
            });
            setPaymentData({
              is_payment: response.data.is_payment || false,
              accept_payment: response.data.accept_payment || true
            });
            
            // Cache the data
            sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
          }
        } else {
          // Round was invalidated, show empty state
          setRecommendations({
            Dream: [],
            Reach: [],
            Match: [],
            Safety: []
          });
          setPaymentData({
            is_payment: false,
            accept_payment: true
          });
        }
      }
    } catch (error) {
      console.error(`Error loading Round ${round === 'round2' ? '2' : '1'} data:`, error);
    } finally {
      setIsLoading(false);
    }
  };


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

  const handleBackToForm = () => {
    // Navigate to steps page - form data will be pre-filled from API
    navigate('/recommendations/steps');
  };

  const handleRegenerateRecommendations = async () => {
    if (!user?.accessToken) return;
    
    // Get state from localStorage
    const selectedState = localStorage.getItem("selected_state");
    
    if (!selectedState) {
      toast({
        title: "State Required",
        description: "Please select your state or union territory before generating recommendations.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const roundNumber = activeRound === 'round2' ? 2 : activeRound === 'round3' ? 3 : 1;
      
      // Always fetch complete student details from API
      console.log('Fetching complete student details from API...');
      const studentDetailsResponse = await apiService.fetchMedicalStudentDetails(user.accessToken);
      
      if (!studentDetailsResponse.success || !studentDetailsResponse.data) {
        console.error('Failed to fetch student details');
        return;
      }

      const apiData = studentDetailsResponse.data;
      const credentials = apiData.academic_credentials;
      
      // Build payload with proper nested structure
      const payload: any = {
        round: roundNumber,
        medical_configuration_request: {
          username: user.email || apiData.username || "",
          gender: apiData.gender || "M",
          academic_credentials: {
            educationBackground: {
              educationType: credentials.educationBackground?.educationType || "",
              stream: credentials.educationBackground?.stream || ""
            },
            academicMarks: {
              _10thGradeMarksPercent: credentials.academicMarks?._10thGradeMarksPercent || 0,
              _12thGradeMarksPercent: credentials.academicMarks?._12thGradeMarksPercent || 0,
              groupingMarksPercent: credentials.academicMarks?.groupingMarksPercent || 0
            },
            examPercentiles: {
              NEETPercentile: credentials.examPercentiles?.NEETPercentile || 0,
              NEETAllIndiaRank: credentials.examPercentiles?.NEETAllIndiaRank || 0,
              NEETRollNumber: credentials.examPercentiles?.NEETRollNumber || 0,
              otherEntranceExam: credentials.examPercentiles?.otherEntranceExam || []
            },
            reservationCategory: credentials.reservationCategory || "",
            achievementsExperience: {
              sportsAchievements: credentials.achievementsExperience?.sportsAchievements || "",
              certifications: credentials.achievementsExperience?.certifications || "",
              internshipsWorkExperience: credentials.achievementsExperience?.internshipsWorkExperience || "",
              otherAchievements: credentials.achievementsExperience?.otherAchievements || ""
            },
            preferences: {
              medicalPrograms: credentials.preferences?.medicalPrograms || ["ALL"],
              preferredCities: credentials.preferences?.preferredCities || ["ALL"],
              state: selectedState as State
            },
            campusFacilitiesEnvironment: {
              hostelFacility: credentials.campusFacilitiesEnvironment?.hostelFacility || "",
              campusSetting: credentials.campusFacilitiesEnvironment?.campusSetting || "",
              transportFacility: credentials.campusFacilitiesEnvironment?.transportFacility || ""
            },
            annualBudget: credentials.annualBudget || 0,
            collegeTypePreferences: credentials.collegeTypePreferences || ["ALL"],
            priorityFactors: credentials.priorityFactors || ["ALL"]
          }
        }
      };

      // Add college code for Round 2
      if (roundNumber === 2) {
        const savedCollege = localStorage.getItem('medicalRound2SelectedCollege');
        if (savedCollege) {
          const collegeData = JSON.parse(savedCollege);
          payload.last_round_college_choice_code = collegeData.collegeCode;
        }
      }

      // Call API to generate recommendations
      const response = await apiService.generateMedicalRecommendations(payload);
      
      if (response.success && response.data) {
        // Clear invalidation flag
        sessionStorage.removeItem(`round${roundNumber}Invalidated`);
        setIsRoundInvalidated(false);
        
        // Store new recommendations
        const cacheKey = `cachedMedicalRound${roundNumber}Recommendations`;
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        
        // Update state with new recommendations
        setRecommendations({
          Dream: Array.isArray(response.data.Dream) ? response.data.Dream : [],
          Reach: Array.isArray(response.data.Reach) ? response.data.Reach : [],
          Match: Array.isArray(response.data.Match) ? response.data.Match : [],
          Safety: Array.isArray(response.data.Safety) ? response.data.Safety : []
        });
        setPaymentData({
          is_payment: response.data.is_payment || false,
          accept_payment: response.data.accept_payment || true
        });
      }
    } catch (error) {
      console.error('Error regenerating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-1 sm:mb-1">
          <Button 
            variant="outline" 
            className="rounded-lg hover:shadow-md transition-all duration-200 w-full sm:w-auto"
            onClick={handleBackToForm}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Form
          </Button>
        </div>

        <ResultsComponent 
          recommendations={recommendations}
          formData={formData}
          paymentData={paymentData}
          activeRound={activeRound}
          onRoundChange={handleRoundChange}
          isRoundInvalidated={isRoundInvalidated}
          onRegenerateRecommendations={handleRegenerateRecommendations}
        />
        
        <div className="mt-12 mb-8">
          <FeedbackSection />
        </div>
      </div>
    </div>
  );
};

export default MedicalRecommendationResults;
