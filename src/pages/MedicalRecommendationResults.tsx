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

const MedicalRecommendationResults = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { isGenerating } = useMedicalRecommendation();
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const savedFormData = recommendationStorage.getFormData();
        const savedActiveRound = sessionStorage.getItem('medicalActiveRound');
        const roundToLoad = savedActiveRound === '2' ? 'round2' : savedActiveRound === '3' ? 'round3' : 'round1';

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
            
            if (!isInvalidated && user?.accessToken) {
              // Only fetch from API if not invalidated
              const response = await apiService.getMedicalRecommendationsByRound(roundNumber, user.accessToken);
              
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
        
        if (!isInvalidated && user?.accessToken) {
          // Only fetch from API if not invalidated
          const response = await apiService.getMedicalRecommendationsByRound(roundNumber, user.accessToken);
          
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
        />
        
        <div className="mt-12 mb-8">
          <FeedbackSection />
        </div>
      </div>
    </div>
  );
};

export default MedicalRecommendationResults;
