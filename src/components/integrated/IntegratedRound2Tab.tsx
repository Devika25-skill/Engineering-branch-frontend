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
import { IntegratedCollegeSelectionCard } from './IntegratedCollegeSelectionCard';
import { integratedRecommendationApi, RoundPreferencesResponse } from '@/services/integratedRecommendationApi';
import { IntegratedRecommendationCard } from './IntegratedRecommendationCard';
import { CategoryFilter } from '@/components/recommendations/CategoryFilter';
import { PremiumGate } from '@/components/recommendations/PremiumGate';
import { NoResultsState } from '@/components/recommendations/NoResultsState';
import { usePdfDownload } from '@/hooks/usePdfDownloadIntegrated';
import { FeedbackSection } from '@/components/feedback/FeedbackSection';

interface IntegratedRound2TabProps {
  admissionType: IntegratedAdmissionType;
}

export const IntegratedRound2Tab = ({ admissionType }: IntegratedRound2TabProps) => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<{
    collegeCode: number;
    collegeName: string;
    courseCode: string;
    courseName: string;
  } | null>(null);
  const [showCollegeSelection, setShowCollegeSelection] = useState(true);
  const [isStoring, setIsStoring] = useState(false);
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] = useState(false);
  const [hasSubmittedPreferences, setHasSubmittedPreferences] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [round2Recommendations, setRound2Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [filteredCategory, setFilteredCategory] = useState<string>('All');
  const [showRegenerateMessage, setShowRegenerateMessage] = useState(false);
  const [formDataHash, setFormDataHash] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    const loadExistingData = async () => {
      setIsInitialLoading(true);
      try {
        // Check for existing college preference first
        const collegeResponse = await integratedRecommendationApi.getRoundCollegePreferences(2, admissionType);
        if (collegeResponse.success && collegeResponse.data) {
          setSelectedCollege({
            collegeCode: parseInt(collegeResponse.data.college_code),
            collegeName: collegeResponse.data.college_name,
            courseCode: collegeResponse.data.course_code,
            courseName: collegeResponse.data.course_name
          });
          setShowCollegeSelection(false);
        }

        // Try to fetch from API
        const response = await integratedRecommendationApi.getRoundPreferences(2, admissionType);
        
        if (response.success && response.data.preferences) {
          // Load preferences from API
          setSelectedBranches(response.data.preferences.branches);
          setSelectedCities(response.data.preferences.locations);
          setHasSubmittedPreferences(true);
          setIsPreferencesCardCollapsed(true);
          setShowCollegeSelection(false);
          
          // Load recommendations if available
          if (response.data.recommendations && response.data.recommendations.length > 0) {
            const apiData = response.data.recommendations[0];
            const convertedRecs = convertApiResponseToRecommendations(apiData);
            setRound2Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check payment status
            if (apiData.is_payment === true) {
              localStorage.setItem(`integratedRecommendationUnlocked_${admissionType}`, 'true');
              setIsUnlocked(true);
            }
            
            // Store API data in localStorage for offline access
            localStorage.setItem(`integrated_round2_${admissionType}`, JSON.stringify({
              branches: response.data.preferences.branches,
              cities: response.data.preferences.locations,
              submittedAt: response.data.preferences.timestamp
            }));
            localStorage.setItem(`integrated_round2_recommendations_${admissionType}`, JSON.stringify(apiData));
          }
        } else {
          // Fallback to localStorage if API doesn't have data
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error fetching from API, falling back to localStorage:', error);
        loadFromLocalStorage();
      } finally {
        setIsInitialLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      // Load preferences
      const savedData = localStorage.getItem(`integrated_round2_${admissionType}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        setHasSubmittedPreferences(true);
        setIsPreferencesCardCollapsed(true);
        setShowCollegeSelection(false);
      }

      // Load recommendations
      const savedRecommendations = localStorage.getItem(`integrated_round2_recommendations_${admissionType}`);
      if (savedRecommendations) {
        try {
          const parsedRecs = JSON.parse(savedRecommendations);
          if (parsedRecs && Object.keys(parsedRecs).length > 0) {
            const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
            setRound2Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check if these recommendations were paid and should unlock
            if (parsedRecs.is_payment === true) {
              localStorage.setItem(`integratedRecommendationUnlocked_${admissionType}`, 'true');
              setIsUnlocked(true);
            }
          }
        } catch (error) {
          console.error('Error loading stored recommendations:', error);
          localStorage.removeItem(`integrated_round2_recommendations_${admissionType}`);
        }
      }
    };
    
    loadExistingData();
  }, [admissionType]);

  // Check unlock status
  useEffect(() => {
    const checkUnlockStatus = () => {
      const isUnlocked = localStorage.getItem(`integratedRecommendationUnlocked_${admissionType}`) === 'true';
      setIsUnlocked(isUnlocked);
    };
    
    checkUnlockStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUnlockStatus);
    return () => window.removeEventListener('storage', checkUnlockStatus);
  }, []);

  const handleCollegeSelect = (college: {
    collegeCode: number;
    collegeName: string;
    courseCode: string;
    courseName: string;
  }) => {
    setSelectedCollege(college);
    setShowCollegeSelection(false);
  };

  const handleSkipSelection = () => {
    setSelectedCollege(null);
    setShowCollegeSelection(false);
  };

  const handleSubmitPreferences = async () => {
    setShowRegenerateMessage(false);

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
      const round2Data = {
        branches: selectedBranches,
        cities: selectedCities,
        submittedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`integrated_round2_${admissionType}`, JSON.stringify(round2Data));
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
      
      // Prepare API payload using the saved form data
      const apiPayload = {
        exam_type: admissionType,
        branches: selectedBranches,
        gender: configData.gender,
        district: configData.district,
        locations: selectedCities,
        round_no: 2,
        category: configData.category,
        score: configData.score,
        ...(selectedCollege && { last_college_round_choice_code: selectedCollege.courseCode })
      };
      localStorage.removeItem(`integrated_round2_recommendations_${admissionType}`);

      // Call API to generate recommendations
      const response = await integratedRecommendationApi.generateRecommendations(apiPayload);
      
      if (response.success && response.data) {
        // Store the raw API response
        localStorage.setItem(`integrated_round2_recommendations_${admissionType}`, JSON.stringify(response.data));
        
        // Convert and set recommendations
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound2Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Check payment status
        if (response.data.is_payment === true) {
          localStorage.setItem(`integratedRecommendationUnlocked_${admissionType}`, 'true');
          setIsUnlocked(true);
        }
        
        // Store hash of current form data to detect future changes
        const currentFormData = localStorage.getItem(`integrated_form_${admissionType}`);
        if (currentFormData) {
          const currentHash = btoa(currentFormData);
          localStorage.setItem(`integrated_form_hash_${admissionType}`, currentHash);
          setShowRegenerateMessage(false);
          localStorage.setItem('integrated_recommendations_updated', 'true');
        }
        
        toast({
          title: "Success", 
          description: selectedCollege 
            ? "Round 2 recommendations generated based on your previous choice!" 
            : "Fresh Round 2 recommendations generated successfully!",
        });
      } else {
        setHasGeneratedRecommendations(true);
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
    if (round2Recommendations.length === 0) return;
    
    try {
      const formData = {
        cetPercentile: 85, // Default or get from stored data
        reservationCategory: 'GOPENS'
      };
      await generatePDF(round2Recommendations, formData);
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
    ? round2Recommendations 
    : round2Recommendations.filter(rec => rec.category === filteredCategory);

  const categoryStats = round2Recommendations.reduce((acc, rec) => {
    acc[rec.category as keyof typeof acc] = (acc[rec.category as keyof typeof acc] || 0) + 1;
    return acc;
  }, { Dream: 0, Reach: 0, Match: 0, Safety: 0 });

  // Show loading skeleton while initial data is loading
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted animate-pulse rounded w-1/3"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-8"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="h-12 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                <div className="h-12 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="h-10 bg-muted animate-pulse rounded w-32"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show college selection if needed
  if (showCollegeSelection) {
    return (
      <div className="space-y-6">
        <IntegratedCollegeSelectionCard
          admissionType={admissionType}
          roundNo={2}
          onCollegeSelect={handleCollegeSelect}
          onSkipSelection={handleSkipSelection}
          selectedCollege={selectedCollege}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected College Display */}
      {selectedCollege && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-2">Previous Round College Selected</h4>
                <div className="space-y-2">
                  <p className="font-medium text-green-700">{selectedCollege.collegeName}</p>
                  <div className="text-sm text-green-600 space-y-1">
                    <p><span className="font-medium">Course:</span> {selectedCollege.courseName}</p>
                    <p><span className="font-medium">Course Code:</span> {selectedCollege.courseCode}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowCollegeSelection(true)}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                Round 2 - Branch & City Preferences
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
                admissionType={admissionType}
                onSelectionChange={setSelectedCities}
                initialSelection={selectedCities}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button 
                onClick={handleSubmitPreferences}
                disabled={isGeneratingRecommendations || selectedBranches.length === 0 || selectedCities.length === 0}
                className="bg-blue-600 hover:bg-blue-700 min-w-[160px] w-full sm:w-auto"
              >
                {isGeneratingRecommendations ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  selectedCollege ? 'Generate Round 2 Recommendations' : 'Generate Fresh Recommendations'
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations */}
      {hasGeneratedRecommendations && round2Recommendations.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Round 2 Recommendations</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedCollege 
                  ? `Based on your previous choice: ${selectedCollege.collegeName}`
                  : 'Fresh recommendations for Round 2'
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {hasSubmittedPreferences && !isGeneratingRecommendations && (
                <Button 
                  variant="outline" 
                  onClick={handleEditPreferences}
                  className="w-full sm:w-auto"
                >
                  Edit Preferences
                </Button>
              )}
              
              {isUnlocked && round2Recommendations.length > 0 && (
                <Button 
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? 'Downloading...' : 'Download PDF'}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {['All', 'Dream', 'Reach', 'Match', 'Safety'].map((category) => (
                <Button
                  key={category}
                  variant={filteredCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilteredCategory(category)}
                >
                  {category} {category !== 'All' && `(${categoryStats[category as keyof typeof categoryStats] || 0})`}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map((recommendation, index) => (
                <IntegratedRecommendationCard
                  key={`${recommendation.college.id}-${recommendation.choice_code}-${index}`}
                  recommendation={recommendation}
                  index={index + 1}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recommendations found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or preferences</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <FeedbackSection />
          </div>
        </>
      )}

      {hasSubmittedPreferences && !hasGeneratedRecommendations && !isGeneratingRecommendations && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No recommendations yet</p>
          <p className="text-sm text-muted-foreground">Click 'Generate Recommendations' to see your college options</p>
        </div>
      )}
    </div>
  );
};