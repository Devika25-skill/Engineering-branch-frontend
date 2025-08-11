import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, MapPin, ChevronDown, ChevronUp, Sparkles, Clock, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { IntegratedBranchesForm } from './IntegratedBranchesForm';
import { IntegratedCitiesForm } from './IntegratedCitiesForm';
import { integratedRecommendationApi } from '@/services/integratedRecommendationApi';
import { IntegratedRecommendationCard } from './IntegratedRecommendationCard';
import { CategoryFilter } from '@/components/recommendations/CategoryFilter';
import { PremiumGate } from '@/components/recommendations/PremiumGate';
import { NoResultsState } from '@/components/recommendations/NoResultsState';
import { usePdfDownload } from '@/hooks/usePdfDownload';

interface IntegratedRound1TabProps {
  admissionType: IntegratedAdmissionType;
}

export const IntegratedRound1Tab = ({ admissionType }: IntegratedRound1TabProps) => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isStoring, setIsStoring] = useState(false);
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] = useState(false);
  const [hasSubmittedPreferences, setHasSubmittedPreferences] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [round1Recommendations, setRound1Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [filteredCategory, setFilteredCategory] = useState<string>('All');

  const { generatePDF, isGenerating } = usePdfDownload();

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];
    
    ['Dream', 'Reach', 'Match', 'Safety'].forEach(category => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              id: item.college.College_Code,
              name: item.college.College_Name,
              city: item.college.Location,
              logo: null,
              website: '',
              type: '',
              nirf_rank: null,
              fees: null,
              placement_percentage: null,
              top_recruiters: []
            },
            course_name: item.college.Course_Name,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            reservation_category: item.category,
            choice_code: item.college.Course_Code
          });
        });
      }
    });
    
    return recommendations;
  };

  // Load existing preferences and recommendations on mount
  useEffect(() => {
    const loadExistingData = () => {
      // Load preferences
      const savedData = localStorage.getItem(`integrated_round1_${admissionType}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        setHasSubmittedPreferences(true);
        setIsPreferencesCardCollapsed(true);
      }

      // Load recommendations
      const savedRecommendations = localStorage.getItem(`integrated_round1_recommendations_${admissionType}`);
      if (savedRecommendations) {
        try {
          const parsedRecs = JSON.parse(savedRecommendations);
          if (parsedRecs && Object.keys(parsedRecs).length > 0) {
            const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
            setRound1Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check if these recommendations were paid and should unlock
            if (parsedRecs.is_payment === true) {
              localStorage.setItem('integratedRecommendationUnlocked', 'true');
              setIsUnlocked(true);
            }
          }
        } catch (error) {
          console.error('Error loading stored recommendations:', error);
          localStorage.removeItem(`integrated_round1_recommendations_${admissionType}`);
        }
      }
    };
    
    loadExistingData();
  }, [admissionType]);

  // Check unlock status
  useEffect(() => {
    const checkUnlockStatus = () => {
      const isUnlocked = localStorage.getItem('integratedRecommendationUnlocked') === 'true';
      setIsUnlocked(isUnlocked);
    };
    
    checkUnlockStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUnlockStatus);
    return () => window.removeEventListener('storage', checkUnlockStatus);
  }, []);

  const handleSubmitPreferences = async () => {
    if (selectedBranches.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one branch before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCities.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one city before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsStoring(true);
    setIsGeneratingRecommendations(true);
    
    try {
      // Save preferences first
      const round1Data = {
        branches: selectedBranches,
        cities: selectedCities,
        submittedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`integrated_round1_${admissionType}`, JSON.stringify(round1Data));
      setHasSubmittedPreferences(true);
      setIsPreferencesCardCollapsed(true);

      // Get saved configuration data that was used when user submitted the form
      const savedConfigData = localStorage.getItem(`integrated_form_${admissionType}`);
      if (!savedConfigData) {
        toast({
          title: "Error",
          description: "Form data not found. Please complete the form first.",
          variant: "destructive"
        });
        setIsStoring(false);
        setIsGeneratingRecommendations(false);
        return;
      }

      const configData = JSON.parse(savedConfigData);
      console.log('Using config data for API:', configData);
      
      // Prepare API payload using the saved form data
      const apiPayload = {
        exam_type: admissionType,
        branches: selectedBranches,
        locations: selectedCities,
        round_no: 1,
        category: configData.category,
        score: configData.score // This is the CET score (0-100)
      };

      // Call API to generate recommendations
      const response = await integratedRecommendationApi.generateRecommendations(apiPayload);
      
      if (response.success && response.data) {
        // Store the raw API response
        localStorage.setItem(`integrated_round1_recommendations_${admissionType}`, JSON.stringify(response.data));
        
        // Convert and set recommendations
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound1Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Check payment status
        if (response.data.is_payment === true) {
          localStorage.setItem('integratedRecommendationUnlocked', 'true');
          setIsUnlocked(true);
        }
        
        toast({
          title: "Success",
          description: "Round 1 recommendations generated successfully!",
        });
      } else {
        throw new Error('Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStoring(false);
      setIsGeneratingRecommendations(false);
    }
  };

  const handleEditPreferences = () => {
    setIsPreferencesCardCollapsed(false);
  };

  const handleDownloadPdf = async () => {
    if (round1Recommendations.length === 0) return;
    
    try {
      const formData = {
        cetPercentile: 85, // Default or get from stored data
        reservationCategory: 'GOPENS'
      };
      await generatePDF(round1Recommendations, formData);
      toast({
        title: "Success",
        description: "PDF downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const filteredRecommendations = filteredCategory === 'All' 
    ? round1Recommendations 
    : round1Recommendations.filter(rec => rec.category === filteredCategory);

  const categoryStats = round1Recommendations.reduce((acc, rec) => {
    acc[rec.category as keyof typeof acc] = (acc[rec.category as keyof typeof acc] || 0) + 1;
    return acc;
  }, { Dream: 0, Reach: 0, Match: 0, Safety: 0 });

  return (
    <div className="space-y-6">
      {/* Preferences Card */}
      <Card className="w-full">
        <CardHeader 
          className="cursor-pointer" 
          onClick={() => setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Round 1 - Branch & City Preferences
                {hasSubmittedPreferences && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Saved
                  </Badge>
                )}
              </CardTitle>
            </div>
            {isPreferencesCardCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        {!isPreferencesCardCollapsed && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IntegratedBranchesForm
                admissionType={admissionType}
                onSelectionChange={setSelectedBranches}
                initialSelection={selectedBranches}
              />
              
              <IntegratedCitiesForm
                onSelectionChange={setSelectedCities}
                initialSelection={selectedCities}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              {hasSubmittedPreferences && (
                <Button 
                  variant="outline" 
                  onClick={handleEditPreferences}
                >
                  Edit Preferences
                </Button>
              )}
              <Button 
                onClick={handleSubmitPreferences}
                disabled={isGeneratingRecommendations || selectedBranches.length === 0 || selectedCities.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingRecommendations ? 'Generating...' : hasSubmittedPreferences ? 'Update & Generate' : 'Save & Generate'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations Section */}
      {hasGeneratedRecommendations && round1Recommendations.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Round 1 Recommendations ({round1Recommendations.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadPdf}
                disabled={!isUnlocked}
              >
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!isUnlocked ? (
              <PremiumGate 
                onUnlock={() => setIsUnlocked(true)}
                storageKey="integratedRecommendationUnlocked"
                productType="integrated_round_1"
                title="Unlock Integrated Round 1 Recommendations"
                description="Get access to your personalized integrated admission recommendations"
              />
            ) : (
              <div className="space-y-4">
                <CategoryFilter 
                  activeCategory={filteredCategory}
                  onCategoryChange={setFilteredCategory}
                  categoryStats={categoryStats}
                />
                
                {filteredRecommendations.length === 0 ? (
                  <NoResultsState />
                ) : (
                  <div className="grid gap-4">
                    {filteredRecommendations.map((recommendation, index) => (
                      <IntegratedRecommendationCard
                        key={`${recommendation.college.id}-${index}`}
                        recommendation={recommendation}
                        index={index + 1}
                        category={recommendation.category}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Coming Soon Section - only show if no recommendations generated */}
      {!hasGeneratedRecommendations && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Generate Round 1 Recommendations
                </h3>
                <p className="text-yellow-700 text-sm max-w-md mx-auto">
                  Save your branch and city preferences above to generate personalized Round 1 recommendations 
                  for {admissionType.replace(/_/g, '/')} programs.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
                <Sparkles className="w-4 h-4" />
                <span>Get ready for an exciting journey ahead!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};