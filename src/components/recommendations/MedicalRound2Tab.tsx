import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { recommendationStorage } from '@/services/recommendationStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Lock, RefreshCw, ChevronDown, ChevronUp, MapPin, Users, TrendingUp, Loader2, Download } from 'lucide-react';
import { Round2Disclaimer } from './Round2Disclaimer';
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { NoResultsState } from './NoResultsState';
import { MedicalCollegeRecommendation } from "@/types/medical";

export const MedicalRound2Tab = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownloadMedical();
  
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [round2Recommendations, setRound2Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPreferencesCollapsed, setIsPreferencesCollapsed] = useState(true);
  const [formData, setFormData] = useState<any>(null);

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];
    
    ['Dream', 'Reach', 'Match', 'Safety'].forEach(category => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              college_name: item.college.College_Name,
              college_code: item.college.College_Code,
              city: item.college.City,
              college_type: item.college.College_Type,
              course_type: item.college.Course_Type,
            },
            program: item.college.Program,
            closing_rank: item.college.Closing_Rank,
            neet_rank: item.college.NEET_Rank,
            admission_probability: item.college.Admission_Probability,
          });
        });
      }
    });
    
    return recommendations;
  };

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      // Load cached Round 2 recommendations
      const cachedRound2 = sessionStorage.getItem('cachedMedicalRound2Recommendations');
      if (cachedRound2) {
        try {
          const parsedRecs = JSON.parse(cachedRound2);
          setRound2Recommendations(parsedRecs);
          setHasGeneratedRecommendations(true);
        } catch (error) {
          console.error('Error loading cached Round 2 recommendations:', error);
          sessionStorage.removeItem('cachedMedicalRound2Recommendations');
        }
      }

      // If no cache, check localStorage
      if (!cachedRound2) {
        const storedRecommendations = localStorage.getItem('medicalRound2Recommendations');
        if (storedRecommendations) {
          try {
            const parsedRecs = JSON.parse(storedRecommendations);
            if (parsedRecs && Object.keys(parsedRecs).length > 0) {
              const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
              setRound2Recommendations(convertedRecs);
              setHasGeneratedRecommendations(true);
              
              // Check if payment was done
              if (parsedRecs.is_payment === true) {
                localStorage.setItem('medicalRecommendationUnlocked', 'true');
                setIsUnlocked(true);
              }
              
              sessionStorage.setItem('cachedMedicalRound2Recommendations', JSON.stringify(convertedRecs));
            }
          } catch (error) {
            console.error('Error loading stored recommendations:', error);
            localStorage.removeItem('medicalRound2Recommendations');
          }
        }
      }

      // Load form data
      const savedFormData = recommendationStorage.getFormData();
      if (savedFormData) {
        setFormData(savedFormData);
      }
    };

    loadExistingData();
  }, []);

  // Check unlock status
  useEffect(() => {
    const checkUnlockStatus = () => {
      const unlocked = localStorage.getItem('medicalRecommendationUnlocked') === 'true';
      setIsUnlocked(unlocked);
    };
    
    checkUnlockStatus();
    window.addEventListener('storage', checkUnlockStatus);
    return () => window.removeEventListener('storage', checkUnlockStatus);
  }, []);

  const handleGenerateRecommendations = async () => {
    if (!isLoggedIn || !user?.accessToken) {
      toast({
        title: "Login Required",
        description: "Please login to generate Round 2 recommendations",
        variant: "destructive"
      });
      return;
    }

    const savedFormData = recommendationStorage.getFormData();
    if (!savedFormData) {
      toast({
        title: "Form Data Required",
        description: "Please complete Round 1 form first",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecommendations(true);

    try {
      // Transform form data to API format (same as Round 1)
      const payload = {
        round: 2 as 2,
        medical_configuration_request: {
          username: user.email,
          gender: savedFormData.gender || 'M',
          academic_credentials: {
            educationBackground: {
              educationType: '12th',
              stream: savedFormData.grouping
            },
            academicMarks: {
              _10thGradeMarksPercent: Number(savedFormData.tenthMarks?.toFixed(2) || 0),
              _12thGradeMarksPercent: Number(savedFormData.twelfthMarks?.toFixed(2) || 0),
              groupingMarksPercent: Number(savedFormData.groupingMarks?.toFixed(2) || 0)
            },
            examPercentiles: {
              NEETPercentile: Number(savedFormData.neetPercentile?.toFixed(2) || 0),
              NEETAllIndiaRank: savedFormData.neetAllIndiaRank,
              NEETRollNumber: savedFormData.neetRollNumber,
              otherEntranceExam: savedFormData.otherExamName && savedFormData.otherExamPercentile ? [{
                examName: savedFormData.otherExamName,
                percentileOrScore: Number(savedFormData.otherExamPercentile)
              }] : []
            },
            reservationCategory: savedFormData.reservationCategory,
            achievementsExperience: {
              sportsAchievements: savedFormData.sportsAchievements,
              certifications: savedFormData.certifications,
              internshipsWorkExperience: savedFormData.internships,
              otherAchievements: savedFormData.otherAchievements
            },
            preferences: {
              medicalPrograms: savedFormData.preferredMedicalPrograms || [],
              preferredCities: savedFormData.preferredCities || []
            },
            campusFacilitiesEnvironment: {
              hostelFacility: savedFormData.hostelPreference,
              campusSetting: savedFormData.campusSetting,
              transportFacility: savedFormData.transportFacility
            },
            annualBudget: savedFormData.maxBudget || 0,
            collegeTypePreferences: savedFormData.collegeTypes || ["ALL"],
            priorityFactors: savedFormData.priorities || ["ALL"]
          }
        }
      };

      const response = await apiService.generateMedicalRecommendations(payload);

      if (response.success && response.data) {
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound2Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Store in localStorage and sessionStorage
        localStorage.setItem('medicalRound2Recommendations', JSON.stringify(response.data));
        sessionStorage.setItem('cachedMedicalRound2Recommendations', JSON.stringify(convertedRecs));
        
        // Check payment status
        if (response.data.is_payment === true) {
          localStorage.setItem('medicalRecommendationUnlocked', 'true');
          setIsUnlocked(true);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
          title: "Recommendations Generated",
          description: `Generated ${convertedRecs.length} Round 2 recommendations based on your profile.`,
        });
      } else {
        throw new Error('Failed to generate recommendations');
      }
    } catch (error: any) {
      console.error('Error generating Round 2 recommendations:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate Round 2 recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleResetRecommendations = () => {
    setRound2Recommendations([]);
    localStorage.removeItem('medicalRound2Recommendations');
    sessionStorage.removeItem('cachedMedicalRound2Recommendations');
    setHasGeneratedRecommendations(false);
    toast({
      title: "Recommendations Reset",
      description: "You can now generate new Round 2 recommendations.",
    });
  };

  const handleDownloadPdf = () => {
    if (!isUnlocked) {
      toast({
        title: "Download Locked",
        description: "Please unlock recommendations to download the PDF report.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your Round 2 recommendations report...",
    });

    generatePDF(round2Recommendations as any, formData);
  };

  const sortRecommendationsByCategory = (recs: any[]) => {
    const categoryOrder = { Dream: 1, Reach: 2, Match: 3, Safety: 4 };
    return [...recs].sort((a, b) => {
      const categoryDiff = categoryOrder[a.category as keyof typeof categoryOrder] - 
                          categoryOrder[b.category as keyof typeof categoryOrder];
      if (categoryDiff !== 0) return categoryDiff;
      return (a.closing_rank || 0) - (b.closing_rank || 0);
    });
  };

  const filteredRecommendations = sortRecommendationsByCategory(round2Recommendations);
  const shouldBlurResults = !isUnlocked && hasGeneratedRecommendations;
  const visibleRecommendations = shouldBlurResults 
    ? filteredRecommendations.slice(0, 5)
    : filteredRecommendations;
  const hiddenCount = shouldBlurResults ? filteredRecommendations.length - visibleRecommendations.length : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Dream": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Reach": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Match": return "bg-green-100 text-green-800 border-green-200";
      case "Safety": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="space-y-6">
      <Round2Disclaimer />

      {!hasGeneratedRecommendations ? (
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Generate Round 2 Recommendations
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get personalized medical college recommendations for Round 2 based on your Round 1 profile and updated cutoff trends.
                </p>
              </div>

              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGeneratingRecommendations}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isGeneratingRecommendations ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Generate Round 2 List
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredRecommendations.length}</span> Round 2 recommendations
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleDownloadPdf}
                disabled={!isUnlocked || isPdfGenerating}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white"
              >
                {isPdfGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-sm">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    <span className="text-sm">Download PDF</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleResetRecommendations}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="text-sm">Regenerate</span>
              </Button>
            </div>
          </div>

          {filteredRecommendations.length === 0 ? (
            <NoResultsState />
          ) : (
            <>
              <div className="space-y-4">
                {visibleRecommendations.map((rec, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                            <span className="text-gray-600 text-xs font-bold">
                              {rec.college.college_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                {truncateText(rec.college.college_name, 40)}
                              </h3>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span className="truncate">{rec.college.city}</span>
                              </div>
                            </div>
                            <Badge className={`${getCategoryColor(rec.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
                              {rec.category}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 leading-snug">
                              {truncateText(rec.program, 60)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2 pb-3">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-start gap-1">
                            <TrendingUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600 leading-tight">Closing Rank</p>
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {rec.closing_rank ? rec.closing_rank.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-start gap-1">
                            <Users size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600 leading-tight">Admission Chance</p>
                              <p className={`text-sm font-bold truncate ${getProbabilityColor(rec.admission_probability)}`}>
                                {rec.admission_probability}%
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-start gap-1">
                            <Users size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600 leading-tight">Your Rank</p>
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {rec.neet_rank ? rec.neet_rank.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-start gap-1">
                            <Users size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600 leading-tight">College Type</p>
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {rec.college.college_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1 text-xs text-blue-700">
                          <Badge variant="outline" className="text-xs">
                            {rec.college.course_type}
                          </Badge>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">Code: {rec.college.college_code}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {hiddenCount > 0 && (
                <Card className="mt-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {hiddenCount} More Recommendations Locked
                        </h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          Unlock all {filteredRecommendations.length} Round 2 medical college recommendations to maximize your admission chances!
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4 mt-6">
                        <Button 
                          size="lg"
                          onClick={() => {
                            toast({
                              title: "Unlock Required",
                              description: "Please unlock Round 1 recommendations first to access Round 2.",
                              variant: "destructive"
                            });
                          }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Lock className="mr-2 h-5 w-5" />
                          Unlock All Recommendations
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
