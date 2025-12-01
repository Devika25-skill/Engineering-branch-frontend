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
import { MedicalRecommendationResults as ResultsComponent } from "@/components/recommendations/MedicalRecommendationResults";
import { apiService } from "@/services/api";

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
  const [activeRound, setActiveRound] = useState<string>(() => {
    // Check which round was set during auto-redirect
    const sessionRound = sessionStorage.getItem('activeRound');
    if (sessionRound) {
      return sessionRound;
    }
    const savedRound = localStorage.getItem('activeRoundTab');
    return savedRound || 'round1';
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load recommendations based on active round
  useEffect(() => {
    const loadRecommendationsForRound = async (round: number) => {
      try {
        setIsLoading(true);
        
        // Determine which storage key to use based on round
        const storageKey = round === 1 ? 'cachedMedicalRecommendations' : 'cachedMedicalRound2Recommendations';
        
        // First check sessionStorage for cached data
        const cachedData = sessionStorage.getItem(storageKey);
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            
            // For Round 2, data is already in array format from MedicalRound2Tab
            // For Round 1, data is in categorized format
            if (round === 2 && Array.isArray(parsedData)) {
              // Convert array format to categorized format for Round 1 display
              const categorized = {
                Dream: parsedData.filter((r: any) => r.category === 'Dream'),
                Reach: parsedData.filter((r: any) => r.category === 'Reach'),
                Match: parsedData.filter((r: any) => r.category === 'Match'),
                Safety: parsedData.filter((r: any) => r.category === 'Safety'),
              };
              setRecommendations(categorized);
            } else {
              setRecommendations(parsedData);
            }
            
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing cached data:', error);
          }
        }

        // If no cached data, fetch from API
        if (user?.accessToken) {
          const response = await apiService.getMedicalRecommendationsByRound(round, user.accessToken);
          
          if (response.success && response.data) {
            const { Dream, Reach, Match, Safety, is_payment, accept_payment } = response.data;
            
            // Check if we have valid recommendation data
            const hasData = [Dream, Reach, Match, Safety].some(arr => arr && arr.length > 0);
            
            if (hasData) {
              const recommendationsData = { Dream: Dream || [], Reach: Reach || [], Match: Match || [], Safety: Safety || [] };
              setRecommendations(recommendationsData);
              setPaymentData({
                is_payment: is_payment || false,
                accept_payment: accept_payment !== false
              });
              
              // Cache the data
              sessionStorage.setItem(storageKey, JSON.stringify(recommendationsData));
              if (is_payment !== undefined || accept_payment !== undefined) {
                sessionStorage.setItem('medicalRecommendationPaymentData', JSON.stringify({ is_payment, accept_payment }));
              }
            } else {
              // No data for this round, redirect back
              navigate('/recommendations');
            }
          } else {
            navigate('/recommendations');
          }
        } else {
          navigate('/recommendations');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error(`Error loading Round ${round} recommendations:`, error);
        setIsLoading(false);
        navigate('/recommendations');
      }
    };

    const loadInitialData = async () => {
      try {
        // Load form data
        const savedFormData = recommendationStorage.getFormData();
        if (savedFormData) {
          setFormData(savedFormData);
        }
        
        // Load payment data
        const savedPaymentData = recommendationStorage.getMedicalPaymentData();
        setPaymentData(savedPaymentData);
        
        // Load recommendations for the active round
        const roundNumber = activeRound === 'round2' ? 2 : 1;
        await loadRecommendationsForRound(roundNumber);
        
      } catch (error) {
        console.error('Error loading initial data:', error);
        navigate('/recommendations');
      }
    };

    loadInitialData();
  }, [activeRound, user?.accessToken, navigate, isLoggedIn]);

  // Handle tab change
  const handleRoundChange = (newRound: string) => {
    setActiveRound(newRound);
    localStorage.setItem('activeRoundTab', newRound);
    sessionStorage.setItem('activeRound', newRound);
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
    // Clear cached recommendations for all rounds
    sessionStorage.removeItem('cachedMedicalRecommendations');
    sessionStorage.removeItem('cachedMedicalRound2Recommendations');
    sessionStorage.removeItem('activeRound');
    recommendationStorage.clearMedicalRecommendations();
    // Navigate to recommendations page
    navigate('/recommendations');
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
