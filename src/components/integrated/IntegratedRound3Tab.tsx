import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, MapPin, ChevronDown, ChevronUp, Sparkles, Clock, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { IntegratedBranchesForm } from './IntegratedBranchesForm';
import { IntegratedCitiesForm } from './IntegratedCitiesForm';
import { IntegratedCollegeSelectionCard } from './IntegratedCollegeSelectionCard';
import { integratedRecommendationApi, RoundPreferencesResponse } from '@/services/integratedRecommendationApi';
import { IntegratedRecommendationCard } from './IntegratedRecommendationCard';
import { PremiumGate } from '@/components/recommendations/PremiumGate';
import { NoResultsState } from '@/components/recommendations/NoResultsState';
import { usePdfDownload } from '@/hooks/usePdfDownloadIntegrated';
import { FeedbackSection } from '@/components/feedback/FeedbackSection';

interface IntegratedRound3TabProps {
  admissionType: IntegratedAdmissionType;
}

export const IntegratedRound3Tab = ({ admissionType }: IntegratedRound3TabProps) => {
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
  const [round3Recommendations, setRound3Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showRegenerateMessage, setShowRegenerateMessage] = useState(false);
  const [formDataHash, setFormDataHash] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);
  const [showAddCollegeConfirmation, setShowAddCollegeConfirmation] = useState(false);

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

  // Check for form data changes to show regenerate message
  useEffect(() => {
    const checkFormDataChanges = () => {
      const currentFormData = localStorage.getItem(`integrated_form_${admissionType}`);
      const storedHash = localStorage.getItem(`integrated_form_hash_${admissionType}`);
      
      if (currentFormData && hasGeneratedRecommendations) {
        const currentHash = btoa(currentFormData);
        
        if (storedHash && currentHash !== storedHash && !showRegenerateMessage) {
          setShowRegenerateMessage(true);
        }
      }
    };
    
    checkFormDataChanges();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `integrated_form_${admissionType}`) {
        checkFormDataChanges();
      }
    };

    const handleClearRegenerateMessage = () => {
      setShowRegenerateMessage(false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('clearRegenerateMessage', handleClearRegenerateMessage);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('clearRegenerateMessage', handleClearRegenerateMessage);
    };
  }, [admissionType, hasGeneratedRecommendations, showRegenerateMessage]);

  // Listen for regeneration events from parent component
  useEffect(() => {
    const handleRegenerateEvent = () => {
      if (hasSubmittedPreferences && selectedBranches.length > 0 && selectedCities.length > 0) {
        handleSubmitPreferences();
      }
    };
    
    window.addEventListener('regenerateRecommendations', handleRegenerateEvent);
    return () => window.removeEventListener('regenerateRecommendations', handleRegenerateEvent);
  }, [hasSubmittedPreferences, selectedBranches.length, selectedCities.length]);

  // Load existing preferences and recommendations on mount
  useEffect(() => {
    const loadExistingData = async () => {
      setIsInitialLoading(true);
      try {
        // Check for existing college preference first
        const collegeResponse = await integratedRecommendationApi.getRoundCollegePreferences(3, admissionType);
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
        const response = await integratedRecommendationApi.getRoundPreferences(3, admissionType);
        
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
            setRound3Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check payment status
            if (apiData.is_payment === true) {
              localStorage.setItem(`integratedRecommendationUnlocked_${admissionType}`, 'true');
              setIsUnlocked(true);
            }
            
            // Store API data in localStorage for offline access
            localStorage.setItem(`integrated_round3_${admissionType}`, JSON.stringify({
              branches: response.data.preferences.branches,
              cities: response.data.preferences.locations,
              submittedAt: response.data.preferences.timestamp
            }));
            localStorage.setItem(`integrated_round3_recommendations_${admissionType}`, JSON.stringify(apiData));
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
      const savedData = localStorage.getItem(`integrated_round3_${admissionType}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        setHasSubmittedPreferences(true);
        setIsPreferencesCardCollapsed(true);
        setShowCollegeSelection(false);
      }

      // Load recommendations
      const savedRecommendations = localStorage.getItem(`integrated_round3_recommendations_${admissionType}`);
      if (savedRecommendations) {
        try {
          const parsedRecs = JSON.parse(savedRecommendations);
          if (parsedRecs && Object.keys(parsedRecs).length > 0) {
            const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
            setRound3Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check if these recommendations were paid and should unlock
            if (parsedRecs.is_payment === true) {
              localStorage.setItem(`integratedRecommendationUnlocked_${admissionType}`, 'true');
              setIsUnlocked(true);
            }
            
            // Check if form data has changed since these recommendations were generated
            const currentFormData = localStorage.getItem(`integrated_form_${admissionType}`);
            const storedHash = localStorage.getItem(`integrated_form_hash_${admissionType}`);
            
            if (currentFormData && storedHash) {
              const currentHash = btoa(currentFormData);
              if (currentHash !== storedHash) {
                setShowRegenerateMessage(true);
              }
            }
          }
        } catch (error) {
          console.error('Error loading stored recommendations:', error);
          localStorage.removeItem(`integrated_round3_recommendations_${admissionType}`);
        }
      }
    };
    
    loadExistingData();
  }, [admissionType]);

  // Check unlock status - single payment for all rounds
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

  const handleChangeCollege = () => {
    setSelectedCollege(null);
    setShowCollegeSelection(true);
    setShowChangeConfirmation(false);
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
      const round3Data = {
        branches: selectedBranches,
        cities: selectedCities,
        submittedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`integrated_round3_${admissionType}`, JSON.stringify(round3Data));
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
        round_no: 3,
        category: configData.category,
        score: configData.score,
        ...(selectedCollege && { last_college_round_choice_code: selectedCollege.courseCode })
      };
      localStorage.removeItem(`integrated_round3_recommendations_${admissionType}`);

      // Call API to generate recommendations
      const response = await integratedRecommendationApi.generateRecommendations(apiPayload);
      
      if (response.success && response.data) {
        // Store the raw API response
        localStorage.setItem(`integrated_round3_recommendations_${admissionType}`, JSON.stringify(response.data));
        
        // Convert and set recommendations
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound3Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Check payment status - single payment for all rounds
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
          // Clear regenerate message across all rounds
          window.dispatchEvent(new CustomEvent('clearRegenerateMessage'));
          localStorage.setItem('integrated_recommendations_updated', 'true');
        }
        
        toast({
          title: "Success", 
          description: selectedCollege 
            ? "Round 3 recommendations generated based on your previous choice!" 
            : "Fresh Round 3 recommendations generated successfully!",
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

  const handleAddCollegeSelection = () => {
    setShowCollegeSelection(true);
    setShowAddCollegeConfirmation(false);
  };

  const handleDownloadPdf = async () => {
    if (round3Recommendations.length === 0) return;
    
    try {
      const formData = {
        cetPercentile: 85, // Default or get from stored data
        reservationCategory: 'GOPENS'
      };
      await generatePDF(round3Recommendations, formData);
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
          roundNo={3}
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
              <AlertDialog open={showChangeConfirmation} onOpenChange={setShowChangeConfirmation}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Change College Selection</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to change your college selection? This will remove your current choice and you'll need to select a college again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleChangeCollege}>
                      Yes, Change
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                Round 3 - Branch & City Preferences
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : hasSubmittedPreferences ? 'Update & Generate' : 'Save & Generate'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Form Update Warning */}
      {showRegenerateMessage && hasGeneratedRecommendations && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="text-orange-600 text-lg">⚠️</div>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-800 text-sm mb-1">
                  Form Data Updated
                </h4>
                <p className="text-xs text-orange-700 leading-relaxed mb-3">
                  Your academic details (CET score, category, or percentages) have been updated. 
                  Please regenerate recommendations to get updated results based on your new information.
                </p>
                <Button 
                  size="sm"
                  onClick={handleSubmitPreferences}
                  disabled={isGeneratingRecommendations}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isGeneratingRecommendations ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Recommendations'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {hasGeneratedRecommendations && round3Recommendations.length > 0 ? (
        <Card className="mt-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Round 3 Recommendations ({round3Recommendations.length})
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              {!selectedCollege && hasGeneratedRecommendations && (
                <AlertDialog open={showAddCollegeConfirmation} onOpenChange={setShowAddCollegeConfirmation}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Add College Selection
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add College Selection</AlertDialogTitle>
                      <AlertDialogDescription>
                        Do you want to add a college selection from your previous round? This will help generate more targeted recommendations for this round.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAddCollegeSelection}>
                        Yes, Add College
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadPdf}
                disabled={!isUnlocked}
                className="w-full sm:w-auto"
              >
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Show loading skeleton during recommendation generation */}
            {isGeneratingRecommendations ? (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 text-lg">⚠️</div>
                    <div>
                      <div className="h-4 bg-yellow-200 animate-pulse rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-yellow-200 animate-pulse rounded w-full mb-1"></div>
                      <div className="h-3 bg-yellow-200 animate-pulse rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="h-6 bg-muted animate-pulse rounded w-1/4"></div>
                            <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
                          </div>
                          <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
                          <div className="flex gap-4">
                            <div className="h-4 bg-muted animate-pulse rounded w-1/5"></div>
                            <div className="h-4 bg-muted animate-pulse rounded w-1/5"></div>
                            <div className="h-4 bg-muted animate-pulse rounded w-1/5"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-600 text-lg">⚠️</div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 text-sm mb-1">Important Disclaimer</h4>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        These recommendations are based on previous year cutoff data and trends. 
                        Actual admission depends on various factors including seat availability, competition, 
                        category-wise cutoffs, and official announcements. Please verify with official sources 
                        and consider multiple options before making final decisions.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">  
                  {round3Recommendations.length === 0 ? (
                    <NoResultsState />
                  ) : (
                    <div className="grid gap-4">
                      {/* Show first 3 recommendations */}
                      {round3Recommendations.slice(0, 3).map((recommendation, index) => (
                        <IntegratedRecommendationCard
                          key={`${recommendation.college.id}-${index}`}
                          recommendation={recommendation}
                          index={index + 1}
                        />
                      ))}
                      
                      {/* Show remaining recommendations with blur if not unlocked */}
                      {round3Recommendations.length > 3 && (
                        <>
                          {!isUnlocked ? (
                            <div className="relative">
                              {/* Blurred recommendations */}
                              <div className="filter blur-sm pointer-events-none space-y-4">
                                {round3Recommendations.slice(3, 6).map((recommendation, index) => (
                                  <IntegratedRecommendationCard
                                    key={`blurred-${recommendation.college.id}-${index}`}
                                    recommendation={recommendation}
                                    index={index + 4}
                                  />
                                ))}
                              </div>
                              
                              {/* Unlock overlay */}
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                                <div className="text-center p-6 bg-white rounded-lg shadow-lg border-2 border-blue-200 max-w-sm mx-4">
                                  <div className="text-3xl mb-3">🔒</div>
                                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Unlock All Recommendations
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Get access to {round3Recommendations.length - 3} more personalized recommendations
                                  </p>
                                  <PremiumGate 
                                    onUnlock={() => setIsUnlocked(true)}
                                    storageKey={`integratedRecommendationUnlocked_${admissionType}`}
                                    productType={`future-bridge-admissionType-${admissionType}`}
                                    title={`Unlock Round 3 Recommendations`}
                                    description="Get access to your personalized integrated admission recommendations"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Show all remaining recommendations if unlocked */
                            round3Recommendations.slice(3).map((recommendation, index) => (
                              <IntegratedRecommendationCard
                                key={`${recommendation.college.id}-${index + 3}`}
                                recommendation={recommendation}
                                index={index + 4}
                              />
                            ))
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (hasGeneratedRecommendations &&
        <NoResultsState />
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
                  Generate Round 3 Recommendations
                </h3>
                <p className="text-yellow-700 text-sm max-w-md mx-auto">
                  Save your branch and city preferences above to generate personalized Round 3 recommendations 
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

      {/* Feedback Section */}
      {hasGeneratedRecommendations && round3Recommendations.length > 0 && (
        <div className="mt-12 mb-8">
          <FeedbackSection />
        </div>
      )}
    </div>
  );
};