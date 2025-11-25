import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { recommendationStorage } from '@/services/recommendationStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/hooks/use-toast';
import { Lock, RefreshCw, ChevronDown, ChevronUp, MapPin, Users, TrendingUp, Loader2, Download, Sparkles, BookOpen, X, GripVertical } from 'lucide-react';
import { Round2Disclaimer } from './Round2Disclaimer';
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { NoResultsState } from './NoResultsState';
import { MedicalCollegeRecommendation } from "@/types/medical";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const MedicalRound2Tab = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownloadMedical();
  
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [round2Recommendations, setRound2Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] = useState(true);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];
    
    ['Dream', 'Reach', 'Match', 'Safety'].forEach(category => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          if (item?.college) {
            recommendations.push({
              category: category,
              college: {
                college_name: item.college.college_name || 'Unknown College',
                college_code: item.college.college_code || '',
                city: item.college.city || 'Unknown',
                college_type: item.college.college_type || '',
                course_type: item.college.course_type || '',
              },
              program: item.program || 'N/A',
              closing_rank: item.closing_rank || 0,
              neet_rank: item.neet_rank || 0,
              admission_probability: item.admission_probability || 0,
              probability_message: item.probability_message || '',
            });
          }
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

      // Load form data and preferences
      const savedFormData = recommendationStorage.getFormData();
      if (savedFormData) {
        setFormData(savedFormData);
        setSelectedPrograms(savedFormData.preferredMedicalPrograms || []);
        setSelectedCities(savedFormData.preferredCities || []);
        setShowPreferences(true);
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
    setEditingPreferences(false);
    toast({
      title: "Recommendations Reset",
      description: "You can now generate new Round 2 recommendations.",
    });
  };

  const loadPreferencesFromFormData = () => {
    const savedFormData = recommendationStorage.getFormData();
    if (savedFormData) {
      setSelectedPrograms(savedFormData.preferredMedicalPrograms || []);
      setSelectedCities(savedFormData.preferredCities || []);
    }
  };

  const handleUpdatePreferences = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Authentication Required",
        description: "Please login to update preferences",
        variant: "destructive"
      });
      return;
    }

    if (selectedPrograms.length === 0) {
      toast({
        title: "Missing Preferences",
        description: "Please select at least one medical program",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPreferences(true);

    try {
      // Update form data in storage
      const formData = recommendationStorage.getFormData();
      if (formData) {
        formData.preferredMedicalPrograms = selectedPrograms;
        formData.preferredCities = selectedCities;
        recommendationStorage.saveFormData(formData);
        setFormData(formData);
      }

      // Clear existing Round 2 recommendations so new ones will be generated
      if (hasGeneratedRecommendations) {
        setRound2Recommendations([]);
        localStorage.removeItem('medicalRound2Recommendations');
        sessionStorage.removeItem('cachedMedicalRound2Recommendations');
        setHasGeneratedRecommendations(false);
      }

      setEditingPreferences(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast({
        title: "Preferences Updated",
        description: "Your Round 2 preferences have been updated. Please generate new recommendations.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  const addProgram = (program: string) => {
    if (!selectedPrograms.includes(program)) {
      setSelectedPrograms([...selectedPrograms, program]);
    }
  };

  const removeProgram = (program: string) => {
    setSelectedPrograms(selectedPrograms.filter(p => p !== program));
  };

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleProgramDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedPrograms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedPrograms(items);
  };

  const handleCityDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedCities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedCities(items);
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

  const availablePrograms = [
    "ALL", "MBBS", "BDS", "BAMS", "BHMS", "BUMS", "BNYS", "BPTH", "BOTH", "BASLP", "BP&O"
  ];

  const availableCities = [
    "ALL", "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana",
    "Chandrapur", "Chh. Sambhaji Nagar (Aurangabad)", "Chikhli",
    "Dharashiv (Osmanabad)", "Dhule", "Ichalkaranji", "Jalgaon", "Jalna",
    "Kalyan", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Palghar", "Pandharpur", "Parbhani", "Pune",
    "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur",
    "Thane", "Ulhasnagar", "Wardha", "Washim", "Yavatmal"
  ];

  return (
    <div className="space-y-6">
      <Round2Disclaimer />

      {/* Round 2 Preferences */}
      {showPreferences && (
        <Card 
          className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 cursor-pointer"
          onClick={() => setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)}
        >
          <CardHeader>
            <CardTitle className="text-lg text-blue-800 flex items-center justify-between">
              <span>Round 2 Preferences</span>
              <div className="flex items-center gap-2">
                {!editingPreferences && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPreferences(true);
                      if (isPreferencesCardCollapsed) {
                        setIsPreferencesCardCollapsed(false);
                      }
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Edit Preferences
                  </Button>
                )}
                {isPreferencesCardCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {!isPreferencesCardCollapsed && (
            <CardContent className="space-y-4">
              {editingPreferences ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <BookOpen className="text-white" size={20} />
                          </div>
                          Medical Programs
                          <span className="text-red-500">*</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <SearchableSelect
                          options={availablePrograms
                            .filter(program => !selectedPrograms.includes(program))
                            .map(program => ({ value: program, label: program }))}
                          value=""
                          onValueChange={addProgram}
                          placeholder="Add your preferred medical programs"
                          searchPlaceholder="Search programs..."
                          className="w-full"
                        />

                        {selectedPrograms.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              🎯 Your Preferences (drag to reorder by priority):
                            </p>
                            <div className={`border-2 rounded-xl p-3 bg-white ${selectedPrograms.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                              <DragDropContext onDragEnd={handleProgramDragEnd}>
                                <Droppable droppableId="programs">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                      {selectedPrograms.map((program, index) => (
                                        <Draggable key={program} draggableId={program} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                            >
                                              <div {...provided.dragHandleProps}>
                                                <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                              </div>
                                              <span className="text-sm font-bold text-purple-700 bg-white px-2 py-1 rounded-full">
                                                #{index + 1}
                                              </span>
                                              <span className="flex-1 text-sm font-medium text-slate-700">{program}</span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeProgram(program)}
                                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                              >
                                                <X size={14} />
                                              </Button>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Select your preferred medical programs!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <MapPin className="text-white" size={20} />
                          </div>
                          Preferred Cities
                          <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <SearchableSelect
                          options={availableCities
                            .filter(city => !selectedCities.includes(city))
                            .map(city => ({ value: city, label: city }))}
                          value=""
                          onValueChange={addCity}
                          placeholder="Add cities you'd love to study in"
                          searchPlaceholder="Search cities..."
                          className="w-full"
                        />

                        {selectedCities.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              🗺️ Your Preferences (drag to reorder by priority):
                            </p>
                            <div className={`border-2 rounded-xl p-3 bg-white ${selectedCities.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                              <DragDropContext onDragEnd={handleCityDragEnd}>
                                <Droppable droppableId="cities">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                      {selectedCities.map((city, index) => (
                                        <Draggable key={city} draggableId={city} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                            >
                                              <div {...provided.dragHandleProps}>
                                                <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                              </div>
                                              <span className="text-sm font-bold text-green-700 bg-white px-2 py-1 rounded-full">
                                                #{index + 1}
                                              </span>
                                              <span className="flex-1 text-sm font-medium text-slate-700">{city}</span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeCity(city)}
                                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                              >
                                                <X size={14} />
                                              </Button>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Pick your favorite cities!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Action Buttons for editing */}
                  <div className="flex gap-2 pt-4 border-t border-blue-200">
                    <Button 
                      onClick={handleUpdatePreferences}
                      disabled={isUpdatingPreferences}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUpdatingPreferences ? 'Updating...' : 'Update Preferences'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingPreferences(false);
                        loadPreferencesFromFormData(); // Reset to original values
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Selected Medical Programs:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPrograms.length > 0 ? (
                        selectedPrograms.map((program) => (
                          <Badge key={program} variant="secondary" className="text-xs">
                            {program}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-blue-600 italic">No programs selected</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-blue-800">Preferred Cities:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCities.length > 0 ? (
                        selectedCities.map((city) => (
                          <Badge key={city} variant="secondary" className="text-xs">
                            {city}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-blue-600 italic">No cities selected</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Generate Round 2 Recommendations Button - Only show if no recommendations generated */}
      {showPreferences && !editingPreferences && selectedPrograms.length > 0 && (!hasGeneratedRecommendations || round2Recommendations.length === 0) && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGeneratingRecommendations}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl transition-all duration-200 text-white font-bold text-base rounded-xl min-w-[200px]"
            size="default"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGeneratingRecommendations ? 'Generating...' : 'Generate Round 2 Recommendations'}
          </Button>
        </div>
      )}

      {!hasGeneratedRecommendations && !showPreferences && (
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
      )}

      {/* Round 2 Recommendations Display */}
      {hasGeneratedRecommendations && round2Recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Generate New Recommendations Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleResetRecommendations();
              }}
              variant="outline"
              className="px-6 py-2"
            >
              Generate New Recommendations
            </Button>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">Round 2 College Recommendations</h3>
            <p className="text-muted-foreground">
              Based on your Round 1 selection and preferences, here are your Round 2 options
            </p>
          </div>

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
                              {rec.college?.college_name?.charAt(0) || 'C'}
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
        </div>
      )}
    </div>
  );
};
