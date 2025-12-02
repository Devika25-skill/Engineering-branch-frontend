import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { recommendationStorage } from '@/services/recommendationStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Check, Plus, ChevronDown, ChevronUp, MapPin, Users, TrendingUp, Loader2, Sparkles, BookOpen, X, GripVertical, Building2, GraduationCap } from 'lucide-react';
import { Round2Disclaimer } from './Round2Disclaimer';
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { NoResultsState } from './NoResultsState';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PremiumGate } from './PremiumGate';
import ScrollToTop from '../ScrollToTop';
import type { MedicalProgram, StoreMedicalConfigRequest, Gender, CollegeTypePreference, PriorityFactor } from '@/types/medical';

interface SelectedCollege {
  college: any;
}

export const MedicalRound2Tab = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [searchType, setSearchType] = useState<'college_name' | 'college_code'>('college_name');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false);
  const [isCollegeCardCollapsed, setIsCollegeCardCollapsed] = useState(true);
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] = useState(true);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [round2Recommendations, setRound2Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [skipRound1Selection, setSkipRound1Selection] = useState(false);
  const [showEditConfirmationRecommendation, setShowEditConfirmationRecommendation] = useState(false);

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hasGeneratedRecommendations]);

  // Load from localStorage and API on mount
  useEffect(() => {
    const loadExistingData = async () => {
      // First check for cached Round 2 recommendations in session storage
      const cachedRound2Recommendations = sessionStorage.getItem('cachedMedicalRound2Recommendations');
      if (cachedRound2Recommendations) {
        try {
          const parsedRecs = JSON.parse(cachedRound2Recommendations);
          // Ensure it's an array before setting
          if (Array.isArray(parsedRecs)) {
            setRound2Recommendations(parsedRecs);
            setHasGeneratedRecommendations(true);
          } else if (parsedRecs && typeof parsedRecs === 'object') {
            // If it's the raw API response with Dream/Reach/Match/Safety structure
            const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
            setRound2Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);
            
            // Check payment status from cached API response
            if (parsedRecs.is_payment === true) {
              localStorage.setItem('medicalRecommendationUnlocked', 'true');
              setIsUnlocked(true);
            }
            
            // Update cache with converted format
            sessionStorage.setItem('cachedMedicalRound2Recommendations', JSON.stringify(convertedRecs));
          }
        } catch (error) {
          console.error('Error loading cached Round 2 recommendations:', error);
          sessionStorage.removeItem('cachedMedicalRound2Recommendations');
        }
      }

      // Check for existing Round 2 recommendations in localStorage if no session cache
      if (!cachedRound2Recommendations) {
        const storedRecommendations = localStorage.getItem('medicalRound2Recommendations');
        if (storedRecommendations) {
          try {
            const parsedRecs = JSON.parse(storedRecommendations);
            if (parsedRecs && Object.keys(parsedRecs).length > 0) {
              const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
              setRound2Recommendations(convertedRecs);
              setHasGeneratedRecommendations(true);
              
              // Check if these recommendations were paid and should unlock
              if (parsedRecs.is_payment === true) {
                localStorage.setItem('medicalRecommendationUnlocked', 'true');
                setIsUnlocked(true);
              }
              
              // Cache in session storage for faster future access
              sessionStorage.setItem('cachedMedicalRound2Recommendations', JSON.stringify(convertedRecs));
            }
          } catch (error) {
            console.error('Error loading stored recommendations:', error);
            // Clear corrupted data
            localStorage.removeItem('medicalRound2Recommendations');
          }
        }
      }

      // Try to fetch saved Round 1 college details from API
      if (user?.accessToken) {
        try {
          const response = await apiService.getMedicalUserRoundDetails(1, user.accessToken);
          // Check if response has actual data (not an empty object)
          if (response.success && response.data && response.data.collegeName) {
            // Construct college object from API response
            const collegeData = {
              college_name: response.data.collegeName,
              college_code: response.data.collegeCode,
              course_type: response.data.courseName,
              city: response.data.city,
            };
            
            setSelectedCollege({ college: collegeData });
            setIsConfirmed(true);
            setShowPreferences(true);
            
            // Also store in localStorage for offline access
            localStorage.setItem('medicalRound2SelectedCollege', JSON.stringify(collegeData));
          }
        } catch (error) {
          console.error('Error fetching saved round details from API:', error);
          // Fall back to localStorage if API fails
          const stored = localStorage.getItem('medicalRound2SelectedCollege');
          if (stored) {
            try {
              const parsedData = JSON.parse(stored);
              setSelectedCollege({ college: parsedData });
              setIsConfirmed(true);
              setShowPreferences(true);
            } catch (error) {
              console.error('Error loading stored selection data:', error);
            }
          }
        }
      } else {
        // If not logged in, just check localStorage
        const stored = localStorage.getItem('medicalRound2SelectedCollege');
        if (stored) {
          try {
            const parsedData = JSON.parse(stored);
            setSelectedCollege({ college: parsedData });
            setIsConfirmed(true);
            setShowPreferences(true);
          } catch (error) {
            console.error('Error loading stored selection data:', error);
          }
        }
      }

      // Load preferences for faster access (won't show until confirmed or create new list)
      await loadPreferencesFromFormData();
    };

    loadExistingData();
  }, [user?.accessToken]);

  // Check unlock status using same key as Round 1
  useEffect(() => {
    const checkUnlockStatus = () => {
      const isUnlocked = localStorage.getItem('medicalRecommendationUnlocked') === 'true';
      setIsUnlocked(isUnlocked);
    };
    
    checkUnlockStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUnlockStatus);
    return () => window.removeEventListener('storage', checkUnlockStatus);
  }, []);

  const searchTypeOptions = [
    { value: 'college_name', label: 'College Name' },
    { value: 'college_code', label: 'College Code' }
  ];

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search value",
        variant: "destructive"
      });
      return;
    }

    if (!isLoggedIn || !user?.accessToken) {
      toast({
        title: "Login Required",
        description: "Please login to search colleges",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedCollege(null);

    try {
      let response;
      
      if (searchType === 'college_name') {
        response = await apiService.searchMedicalCollegeByName(searchValue, user.accessToken);
      } else {
        const collegeCode = parseInt(searchValue);
        if (isNaN(collegeCode)) {
          toast({
            title: "Invalid College Code",
            description: "College code must be a 4-digit number",
            variant: "destructive"
          });
          return;
        }
        response = await apiService.searchMedicalCollegeByCode(collegeCode, user.accessToken);
      }

      if (response.success && response.data) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          // Check if array is empty
          if (response.data.length === 0) {
            setSearchResults([]);
            toast({
              title: "No Results",
              description: "No matching colleges found. Please try a different search term.",
              variant: "destructive"
            });
            return;
          }
          setSearchResults(response.data);
        } else if (response.data && Object.keys(response.data).length > 0) {
          // Check if object is not empty
          setSearchResults([response.data]);
        } else {
          // Empty object or null
          setSearchResults([]);
          toast({
            title: "No Results",
            description: "No matching colleges found. Please try a different search term.",
            variant: "destructive"
          });
        }
      } else {
        setSearchResults([]);
        const errorMessage = searchType === 'college_name'
          ? "No matching colleges found. Please try a different search term."
          : "No matching colleges found. Please try a different search term.";
        
        toast({
          title: "No Results",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search colleges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleEditSelection = () => {
    setShowEditConfirmation(true);
  };

  const handleRestRecommendation = () => {
    setShowEditConfirmationRecommendation(true);
  };

  const handleCreateNewList = () => {
    setSkipRound1Selection(true);
    setShowPreferences(true);
    loadPreferencesFromFormData();
    toast({
      title: "Creating New List",
      description: "Set your preferences below to generate Round 2 recommendations without Round 1 selection.",
    });
  };

  const handleRecommendationConfirmEdit = () => {
    // Clear localStorage and reset state
    setRound2Recommendations([]);
    localStorage.removeItem('medicalRound2Recommendations');
    sessionStorage.removeItem('cachedMedicalRound2Recommendations');
    localStorage.removeItem('medicalRound2SelectedCollege');
    setHasGeneratedRecommendations(false);
    toast({
      title: "Selection Reset",
      description: "You can now make a new selection for Round 2 recommendations.",
    });
  };

  const handleConfirmEdit = () => {
    // Clear localStorage and reset state
    setRound2Recommendations([]);
    localStorage.removeItem('medicalRound2Recommendations');
    sessionStorage.removeItem('cachedMedicalRound2Recommendations');
    localStorage.removeItem('medicalRound2SelectedCollege');
    setHasGeneratedRecommendations(false);
    setSelectedCollege(null);
    setIsConfirmed(false);
    setShowPreferences(false);
    setEditingPreferences(false);
    setSelectedPrograms([]);
    setSelectedCities([]);
    setSkipRound1Selection(false);
    setShowEditConfirmation(false);
    toast({
      title: "Selection Reset",
      description: "You can now make a new selection for Round 2 recommendations.",
    });
  };

  const handleCollegeSelect = (college: any) => {
    setSelectedCollege({ college });
    setShowSelectionDialog(true);
  };

  const handleConfirmSelection = () => {
    setShowSelectionDialog(false);
    setShowFinalConfirmation(true);
  };

  const handleFinalConfirm = async () => {
    if (!selectedCollege || !user?.accessToken || !user?.email) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsStoring(true);
    setShowFinalConfirmation(false);

    try {
      // Store to localStorage first
      const storageData = selectedCollege.college;
      localStorage.setItem('medicalRound2SelectedCollege', JSON.stringify(storageData));

      // Get form data for additional fields
      const formData = recommendationStorage.getFormData();
      
      // Call API to store medical college details
      try {
        const apiPayload = {
          collegeName: selectedCollege.college.college_name,
          collegeCode: selectedCollege.college.college_code,
          courseName: selectedCollege.college.course_type || 'MBBS',
          round: 1,
          city: selectedCollege.college.city,
          category: formData?.reservationCategory || 'OPEN',
          NEETAllIndiaRank: formData?.neetAllIndiaRank || 0
        };

        await apiService.storeMedicalCollegeDetails(apiPayload, user.accessToken);
      } catch (apiError) {
        console.error('Error calling store API:', apiError);
        // Continue even if API fails, as we have localStorage backup
      }

      setIsConfirmed(true);
      setShowPreferences(true);
      await loadPreferencesFromFormData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: "College Details Confirmed",
        description: "Your Round 1 college details have been confirmed and saved. Now please review and update your preferences for Round 2.",
      });
    } catch (error) {
      console.error('Error storing college details:', error);
      // Still set as confirmed if localStorage succeeded
      setIsConfirmed(true);
      setShowPreferences(true);
      await loadPreferencesFromFormData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast({
        title: "Details Saved Locally",
        description: "Your college details were saved locally. Please review your preferences below.",
        variant: "destructive"
      });
    } finally {
      setIsStoring(false);
    }
  };

  const loadPreferencesFromFormData = async () => {
    try {
      // First try API to get latest student details if logged in
      if (user?.accessToken) {
        try {
          const profileResponse = await apiService.fetchMedicalStudentDetails(user.accessToken);
          if (profileResponse.success && profileResponse.data) {
            const preferences = profileResponse.data.academic_credentials?.preferences;
            if (preferences) {
              const programs = preferences.medicalPrograms || [];
              const cities = preferences.preferredCities || [];
              
              setSelectedPrograms(programs);
              setSelectedCities(cities);
              
              // Update localStorage with latest data from API
              localStorage.setItem('medicalRound2Preferences', JSON.stringify({
                programs,
                cities,
                timestamp: Date.now()
              }));
              return;
            }
          }
        } catch (apiError) {
          console.log('API call failed, falling back to local storage:', apiError);
        }
      }

      // Fall back to form data from storage
      const formData = recommendationStorage.getFormData();
      if (formData && (formData.preferredMedicalPrograms || formData.preferredCities)) {
        const programs = formData.preferredMedicalPrograms || [];
        const cities = formData.preferredCities || [];
        
        setSelectedPrograms(programs);
        setSelectedCities(cities);
        
        // Update localStorage with latest data
        localStorage.setItem('medicalRound2Preferences', JSON.stringify({
          programs,
          cities,
          timestamp: Date.now()
        }));
        return;
      }

      // Final fallback to localStorage only if form data is not available
      const storedPreferences = localStorage.getItem('medicalRound2Preferences');
      if (storedPreferences) {
        try {
          const parsed = JSON.parse(storedPreferences);
          setSelectedPrograms(parsed.programs || []);
          setSelectedCities(parsed.cities || []);
        } catch (error) {
          console.error('Error parsing stored preferences:', error);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
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

    setIsUpdatingPreferences(true);

    try {
      // Update form data in storage
      let formData = recommendationStorage.getFormData();
      
      // If form data is missing or incomplete, fetch from backend
      if (!formData || 
          !formData.tenthMarks || formData.tenthMarks === 0 ||
          !formData.twelfthMarks || formData.twelfthMarks === 0 ||
          !formData.neetPercentile || formData.neetPercentile === 0 ||
          !formData.neetAllIndiaRank || formData.neetAllIndiaRank === 0) {
        
        console.log('Form data is missing or incomplete, fetching from backend...');
        
        try {
          const studentDetailsResponse = await apiService.fetchMedicalStudentDetails(user.accessToken);
          
          if (studentDetailsResponse.success && studentDetailsResponse.data) {
            const credentials = studentDetailsResponse.data.academic_credentials;
            
            // Transform backend data to formData structure
            formData = {
              gender: studentDetailsResponse.data.gender,
              tenthMarks: credentials.academicMarks.tenthGradeMarksPercent,
              twelfthMarks: credentials.academicMarks.twelfthGradeMarksPercent,
              grouping: credentials.educationBackground.stream,
              groupingMarks: credentials.academicMarks.groupingMarksPercent,
              neetPercentile: credentials.examPercentiles.NEETPercentile,
              neetAllIndiaRank: credentials.examPercentiles.NEETAllIndiaRank,
              neetRollNumber: credentials.examPercentiles.NEETRollNumber,
              reservationCategory: credentials.reservationCategory,
              sportsAchievements: credentials.achievementsExperience?.sportsAchievements,
              certifications: credentials.achievementsExperience?.certifications,
              internships: credentials.achievementsExperience?.internshipsWorkExperience,
              otherAchievements: credentials.achievementsExperience?.otherAchievements,
              hostelPreference: credentials.campusFacilitiesEnvironment?.hostelFacility,
              campusSetting: credentials.campusFacilitiesEnvironment?.campusSetting,
              transportFacility: credentials.campusFacilitiesEnvironment?.transportFacility,
              maxBudget: credentials.annualBudget,
              collegeTypes: credentials.collegeTypePreferences,
              priorities: credentials.priorityFactors,
              otherExamName: credentials.examPercentiles.otherEntranceExam?.[0]?.examName,
              otherExamPercentile: credentials.examPercentiles.otherEntranceExam?.[0]?.percentileOrScore
            };
            
            // Save the fetched and transformed data to storage
            recommendationStorage.saveFormData(formData);
            console.log('Successfully fetched, transformed, and saved form data from backend');
          } else {
            throw new Error('Failed to fetch student details from backend');
          }
        } catch (fetchError) {
          console.error('Error fetching student details:', fetchError);
          toast({
            title: "Error Loading Data",
            description: "Unable to load your profile data. Please try again or go back to the form.",
            variant: "destructive"
          });
          setIsUpdatingPreferences(false);
          return;
        }
      }

      // Update preferences with default "ALL" for empty cities
      const updatedPreferences = {
        preferredMedicalPrograms: selectedPrograms as MedicalProgram[],
        preferredCities: selectedCities.length > 0 ? selectedCities : ["ALL"]
      };

      formData.preferredMedicalPrograms = updatedPreferences.preferredMedicalPrograms;
      formData.preferredCities = updatedPreferences.preferredCities;
      recommendationStorage.saveFormData(formData);

      // Call API to update student configuration
      const configPayload: StoreMedicalConfigRequest = {
        username: user.email,
        gender: (formData.gender || 'M') as Gender,
        academic_credentials: {
          educationBackground: {
            educationType: '12th',
            stream: formData.grouping
          },
          academicMarks: {
            _10thGradeMarksPercent: formData.tenthMarks ? Number(formData.tenthMarks.toFixed(2)) : 0,
            _12thGradeMarksPercent: formData.twelfthMarks ? Number(formData.twelfthMarks.toFixed(2)) : 0,
            groupingMarksPercent: formData.groupingMarks ? Number(formData.groupingMarks.toFixed(2)) : 0
          },
          examPercentiles: {
            NEETPercentile: Number(formData.neetPercentile?.toFixed(2) || 0),
            NEETAllIndiaRank: formData.neetAllIndiaRank,
            NEETRollNumber: formData.neetRollNumber,
            otherEntranceExam: formData.otherExamName && formData.otherExamPercentile ? [{
              examName: formData.otherExamName,
              percentileOrScore: Number(formData.otherExamPercentile)
            }] : []
          },
          reservationCategory: formData.reservationCategory,
          achievementsExperience: {
            sportsAchievements: formData.sportsAchievements,
            certifications: formData.certifications,
            internshipsWorkExperience: formData.internships,
            otherAchievements: formData.otherAchievements
          },
          preferences: {
            medicalPrograms: updatedPreferences.preferredMedicalPrograms,
            preferredCities: updatedPreferences.preferredCities
          },
          campusFacilitiesEnvironment: {
            hostelFacility: formData.hostelPreference,
            campusSetting: formData.campusSetting,
            transportFacility: formData.transportFacility
          },
          annualBudget: formData.maxBudget || 0,
          collegeTypePreferences: (formData.collegeTypes || ["ALL"]) as CollegeTypePreference[],
          priorityFactors: (formData.priorities || ["ALL"]) as PriorityFactor[]
        }
      };

      // Update configuration via API
      await apiService.storeMedicalConfiguration(configPayload);

      // Update localStorage with new preferences
      localStorage.setItem('medicalRound2Preferences', JSON.stringify({
        programs: selectedPrograms,
        cities: selectedCities,
        timestamp: Date.now()
      }));

      setEditingPreferences(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      toast({
        title: "Preferences Updated",
        description: "Your Round 2 preferences have been successfully updated.",
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

  // Helper functions for PreferencesForm layout
  const addProgram = (program: string) => {
    if (program === "ALL") {
      // If ALL is selected, clear other selections and set only ALL
      setSelectedPrograms(["ALL"]);
    } else {
      // If adding a non-ALL program
      if (selectedPrograms.includes("ALL")) {
        // If ALL is already selected, remove it and add the new program
        setSelectedPrograms([program]);
      } else if (selectedPrograms.length < 3 && !selectedPrograms.includes(program)) {
        // Normal add logic
        setSelectedPrograms([...selectedPrograms, program]);
      }
    }
  };

  const removeProgram = (program: string) => {
    setSelectedPrograms(selectedPrograms.filter(p => p !== program));
  };

  const addCity = (city: string) => {
    if (city === "ALL") {
      // If ALL is selected, clear other selections and set only ALL
      setSelectedCities(["ALL"]);
    } else {
      // If adding a non-ALL city
      if (selectedCities.includes("ALL")) {
        // If ALL is already selected, remove it and add the new city
        setSelectedCities([city]);
      } else if (selectedCities.length < 3 && !selectedCities.includes(city)) {
        // Normal add logic
        setSelectedCities([...selectedCities, city]);
      }
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

  const handleGenerateRecommendations = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Authentication Required",
        description: "Please login to generate recommendations",
        variant: "destructive"
      });
      return;
    }

    if (selectedPrograms.length === 0) {
      toast({
        title: "Missing Preferences",
        description: "Please select at least one medical program to generate recommendations",
        variant: "destructive"
      });
      return;
    }

    if (!skipRound1Selection && !selectedCollege?.college?.college_code) {
      toast({
        title: "Missing College Selection",
        description: "Please select your Round 1 college before generating recommendations",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecommendations(true);

    try {
      // Update preferences first
      const preferencesPayload = {
        programs: selectedPrograms,
        cities: selectedCities
      };

      // Update localStorage with latest preferences
      localStorage.setItem('medicalRound2Preferences', JSON.stringify({
        programs: selectedPrograms,
        cities: selectedCities,
        timestamp: Date.now()
      }));

      // Get form data for building payload
      let formData = recommendationStorage.getFormData();
      
      // Validate that form data exists and has required fields with non-zero values
      if (!formData || 
          !formData.tenthMarks || formData.tenthMarks === 0 ||
          !formData.twelfthMarks || formData.twelfthMarks === 0 ||
          !formData.neetPercentile || formData.neetPercentile === 0 ||
          !formData.neetAllIndiaRank || formData.neetAllIndiaRank === 0) {
        
        console.log('Form data is missing or incomplete, fetching from backend...');
        
        try {
          // Fetch student details from backend
          const token = localStorage.getItem('accessToken');
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          const studentDetailsResponse = await apiService.fetchMedicalStudentDetails(token);
          
          if (studentDetailsResponse.success && studentDetailsResponse.data) {
            const credentials = studentDetailsResponse.data.academic_credentials;
            
            // Transform backend data to formData structure
            formData = {
              gender: studentDetailsResponse.data.gender,
              tenthMarks: credentials.academicMarks.tenthGradeMarksPercent,
              twelfthMarks: credentials.academicMarks.twelfthGradeMarksPercent,
              grouping: credentials.educationBackground.stream,
              groupingMarks: credentials.academicMarks.groupingMarksPercent,
              neetPercentile: credentials.examPercentiles.NEETPercentile,
              neetAllIndiaRank: credentials.examPercentiles.NEETAllIndiaRank,
              neetRollNumber: credentials.examPercentiles.NEETRollNumber,
              reservationCategory: credentials.reservationCategory,
              sportsAchievements: credentials.achievementsExperience?.sportsAchievements,
              certifications: credentials.achievementsExperience?.certifications,
              internships: credentials.achievementsExperience?.internshipsWorkExperience,
              otherAchievements: credentials.achievementsExperience?.otherAchievements,
              hostelPreference: credentials.campusFacilitiesEnvironment?.hostelFacility,
              campusSetting: credentials.campusFacilitiesEnvironment?.campusSetting,
              transportFacility: credentials.campusFacilitiesEnvironment?.transportFacility,
              maxBudget: credentials.annualBudget,
              collegeTypes: credentials.collegeTypePreferences,
              priorities: credentials.priorityFactors,
              otherExamName: credentials.examPercentiles.otherEntranceExam?.[0]?.examName,
              otherExamPercentile: credentials.examPercentiles.otherEntranceExam?.[0]?.percentileOrScore
            };
            
            // Save the fetched and transformed data to storage
            recommendationStorage.saveFormData(formData);
            console.log('Successfully fetched, transformed, and saved form data from backend');
          } else {
            throw new Error('Failed to fetch student details from backend');
          }
        } catch (fetchError) {
          console.error('Error fetching student details:', fetchError);
          toast({
            title: "Error Loading Data",
            description: "Unable to load your profile data. Please try again or go back to the form.",
            variant: "destructive"
          });
          setIsGeneratingRecommendations(false);
          return;
        }
      }

      // Transform form data to API format
      const payload: any = {
        round: 2 as 2,
        medical_configuration_request: {
          username: user.email,
          gender: formData.gender || 'M',
          academic_credentials: {
            educationBackground: {
              educationType: '12th',
              stream: formData.grouping
            },
            academicMarks: {
              _10thGradeMarksPercent: formData.tenthMarks ? Number(formData.tenthMarks.toFixed(2)) : 0,
              _12thGradeMarksPercent: formData.twelfthMarks ? Number(formData.twelfthMarks.toFixed(2)) : 0,
              groupingMarksPercent: formData.groupingMarks ? Number(formData.groupingMarks.toFixed(2)) : 0
            },
            examPercentiles: {
              NEETPercentile: Number(formData.neetPercentile?.toFixed(2) || 0),
              NEETAllIndiaRank: formData.neetAllIndiaRank,
              NEETRollNumber: formData.neetRollNumber,
              otherEntranceExam: formData.otherExamName && formData.otherExamPercentile ? [{
                examName: formData.otherExamName,
                percentileOrScore: Number(formData.otherExamPercentile)
              }] : []
            },
            reservationCategory: formData.reservationCategory,
            achievementsExperience: {
              sportsAchievements: formData.sportsAchievements,
              certifications: formData.certifications,
              internshipsWorkExperience: formData.internships,
              otherAchievements: formData.otherAchievements
            },
            preferences: {
              medicalPrograms: selectedPrograms,
              preferredCities: selectedCities.length > 0 ? selectedCities : ["ALL"]
            },
            campusFacilitiesEnvironment: {
              hostelFacility: formData.hostelPreference,
              campusSetting: formData.campusSetting,
              transportFacility: formData.transportFacility
            },
            annualBudget: formData.maxBudget || 0,
            collegeTypePreferences: formData.collegeTypes || ["ALL"],
            priorityFactors: formData.priorities || ["ALL"]
          }
        }
      };

      // Add college choice code only if a college is selected
      if (!skipRound1Selection && selectedCollege?.college?.college_code) {
        payload.last_round_college_choice_code = selectedCollege.college.college_code;
      }

      const response = await apiService.generateMedicalRecommendations(payload);
      
      if (response.success) {
        // Clear old cached data for Round 2 before storing new data
        sessionStorage.removeItem('cachedMedicalRound2Recommendations');
        localStorage.removeItem('medicalRound2Recommendations');
        
        // Store the raw API response in localStorage
        localStorage.setItem('medicalRound2Recommendations', JSON.stringify(response.data));
        
        // Convert and set recommendations for display
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound2Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Cache the FULL API response (not converted) in session storage to preserve payment data
        sessionStorage.setItem('cachedMedicalRound2Recommendations', JSON.stringify(response.data));
        
        // Check if payment is included and unlock recommendations automatically
        if (response.data.is_payment === true) {
          localStorage.setItem('medicalRecommendationUnlocked', 'true');
          setIsUnlocked(true);
          toast({
            title: "Recommendations Unlocked!",
            description: "Your Round 2 recommendations have been automatically unlocked.",
          });
        }
        
        toast({
          title: "Round 2 Recommendations Generated",
          description: "Your Round 2 recommendation list has been generated successfully based on your preferences.",
        });
      } else {
        throw new Error(response.message || 'Failed to generate recommendations');
      }
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownloadMedical();

  const handleDownloadPDF = () => {
    if (!isUnlocked) {
      toast({
        title: "Download Locked",
        description: "Please unlock recommendations to download the Round 2 PDF report. Your Round 1 unlock also works for Round 2.",
        variant: "destructive"
      });
      return;
    }
    
    const formData = recommendationStorage.getFormData();
    generatePDF(round2Recommendations, formData);
  };

  const sortRecommendationsByCategory = (recs: any[]) => {
    return recs.sort((a, b) => {
      const categoryOrder = { 'Dream': 0, 'Reach': 1, 'Match': 2, 'Safety': 3 };
      const categoryA = categoryOrder[a.category as keyof typeof categoryOrder] ?? 4;
      const categoryB = categoryOrder[b.category as keyof typeof categoryOrder] ?? 4;

      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      return (b.admission_probability || 0) - (a.admission_probability || 0);
    });
  };

  const categorizedRecommendations = sortRecommendationsByCategory(round2Recommendations);

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
      {/* Round 2 Disclaimer */}
      {showPreferences && <Round2Disclaimer />}
      
      {/* Confirmed Selection Display - Collapsible */}
      {isConfirmed && selectedCollege && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader 
            className="cursor-pointer hover:bg-green-100/50 transition-colors"
            onClick={() => setIsCollegeCardCollapsed(!isCollegeCardCollapsed)}
          >
            <CardTitle className="text-lg text-green-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Round 1 College Selected
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSelection();
                  }}
                  disabled={hasGeneratedRecommendations && round2Recommendations.length > 0}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  Edit Selection
                </Button>
                {isCollegeCardCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-green-600" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-green-600" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
          {!isCollegeCardCollapsed && (
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">College:</span>
                  <span className="text-sm text-green-700 sm:text-right">{selectedCollege.college.college_name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-green-700">{selectedCollege.college.city}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">Course:</span>
                  <Badge variant="secondary" className="w-fit">{selectedCollege.college.course_type}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">College Code:</span>
                  <code className="px-2 py-1 bg-green-100 rounded text-sm w-fit">
                    {selectedCollege.college.college_code}
                  </code>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Preferences Section - Collapsible */}
      {showPreferences && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader 
            className="cursor-pointer hover:bg-blue-100/50 transition-colors"
            onClick={() => setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)}
          >
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
                    disabled={hasGeneratedRecommendations && round2Recommendations.length > 0}
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
                          placeholder={selectedPrograms.includes("ALL") ? "ALL programs selected" : selectedPrograms.length >= 3 ? "Maximum 3 programs selected" : "Add your preferred medical programs"}
                          searchPlaceholder="Search programs..."
                          className="w-full"
                          disabled={selectedPrograms.length >= 3 || selectedPrograms.includes("ALL")}
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
                          placeholder={selectedCities.includes("ALL") ? "ALL cities selected" : selectedCities.length >= 3 ? "Maximum 3 cities selected" : "Add cities you'd love to study in"}
                          searchPlaceholder="Search cities..."
                          className="w-full"
                          disabled={selectedCities.length >= 3 || selectedCities.includes("ALL")}
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

      {/* Round 2 Recommendations Display */}
      {hasGeneratedRecommendations && round2Recommendations.length > 0 && (
        <div className="space-y-6">
          {/* Generate New Recommendations Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleRestRecommendation();
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

          {/* Results Summary and Download */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                Found <span className="font-semibold text-blue-600">{categorizedRecommendations.length}</span> college recommendations
              </p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={!isUnlocked || isPdfGenerating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg min-h-[44px] touch-manipulation"
            >
              <span className="text-sm font-medium">
                {isPdfGenerating ? 'Generating...' : isUnlocked ? 'Download PDF' : 'Unlock to Download'}
              </span>
            </Button>
          </div>

          {/* Recommendations List */}
          {isUnlocked ? (
            <div className="space-y-4">
              {categorizedRecommendations.map((recommendation, index) => {
                // Add debugging and safety checks
                if (!recommendation || !recommendation.college || !recommendation.college.college_name) {
                  console.error('Invalid recommendation data:', recommendation);
                  return null;
                }
                
                return (
                  <Card key={`${recommendation.college?.college_code}-${index}`} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                            <span className="text-gray-600 text-xs font-bold">
                              {recommendation.college?.college_name?.charAt(0) || 'C'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                {truncateText(recommendation.college.college_name, 40)}
                              </h3>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span className="truncate">{recommendation.college.city}</span>
                              </div>
                            </div>
                            <Badge className={`${getCategoryColor(recommendation.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
                              {recommendation.category}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 leading-snug">
                              {truncateText(recommendation.program, 60)}
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
                                {recommendation.closing_rank ? recommendation.closing_rank.toLocaleString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-start gap-1">
                            <Users size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-600 leading-tight">Admission Chance</p>
                              <p className={`text-sm font-bold truncate ${getProbabilityColor(recommendation.admission_probability)}`}>
                                {recommendation.admission_probability}%
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
                                {recommendation.neet_rank ? recommendation.neet_rank.toLocaleString() : 'N/A'}
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
                                {recommendation.college.college_type || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-1 text-xs text-blue-700">
                          <Badge variant="outline" className="text-xs">
                            {recommendation.college.course_type}
                          </Badge>
                          <span className="text-gray-400">•</span>
                          <span className="font-medium">Code: {recommendation.college.college_code}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="relative">
              {/* Blurred preview cards */}
              <div className="space-y-4 opacity-30 blur-sm pointer-events-none">
                {categorizedRecommendations.slice(0, 3).map((recommendation, index) => {
                  if (!recommendation || !recommendation.college || !recommendation.college.college_name) {
                    return null;
                  }
                  
                  return (
                    <Card key={`preview-${recommendation.college?.college_code}-${index}`} className="border border-gray-200 bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                              <span className="text-gray-600 text-xs font-bold">
                                {recommendation.college?.college_name?.charAt(0) || 'C'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                  {truncateText(recommendation.college.college_name, 40)}
                                </h3>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                  <MapPin size={12} className="flex-shrink-0" />
                                  <span className="truncate">{recommendation.college.city}</span>
                                </div>
                              </div>
                              <Badge className={`${getCategoryColor(recommendation.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
                                {recommendation.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
              
              {/* Premium Gate for Round 2 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <PremiumGate
                  onUnlock={() => setIsUnlocked(true)}
                  storageKey="medicalRecommendationUnlocked"
                  productType="medical-recommendations"
                  title="Medical Recommendations Unlock"
                  description="Unlock complete medical college recommendations"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Round 2 Recommendations Display */}
      {hasGeneratedRecommendations && round2Recommendations.length <= 0 && (
        <>
          <NoResultsState />
        </>
      )}

      {/* Header - Only show if not confirmed */}
      {!isConfirmed && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Round 2 College Selection</h2>
          <p className="text-muted-foreground">
            Search and select the college you received in Round 1 for Round 2 counselling
          </p>
        </div>
      )}

      {/* Search Section - Only show if not confirmed */}
      {!isConfirmed && !skipRound1Selection && (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">Create New Round 2 List</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Don't have Round 1 details? Start fresh with a new Round 2 recommendation list based on your preferences.
                  </p>
                </div>
                <Button onClick={handleCreateNewList} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New List
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* OR Create New List Option */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground bg-background px-3">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Your Round 1 College</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search-type">Search Type</Label>
                  <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="search-value">
                    {searchType === 'college_name' ? 'College Name' : 'College Code (4 digits)'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-value"
                      value={searchValue}
                      onChange={(e) => {
                        if (searchType === 'college_code') {
                          // Only allow numeric input and limit to 4 digits
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value.length <= 4) {
                            setSearchValue(value);
                          }
                        } else {
                          setSearchValue(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (searchType === 'college_code') {
                          // Prevent -, +, e, E and other non-numeric keys
                          if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                            e.preventDefault();
                          }
                        }
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      onPaste={(e) => {
                        if (searchType === 'college_code') {
                          // Handle paste event for college code
                          e.preventDefault();
                          const pastedText = e.clipboardData.getData('text');
                          const numericValue = pastedText.replace(/[^0-9]/g, '');
                          if (numericValue.length <= 4) {
                            setSearchValue(numericValue);
                          }
                        }
                      }}
                      placeholder={
                        searchType === 'college_name' ? 'Enter college name' : 'Enter 4-digit college code'
                      }
                      type={searchType === 'college_name' ? 'text' : 'text'}
                      maxLength={searchType === 'college_code' ? 4 : undefined}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              {searchResults.map((college, index) => (
                <Card key={`${college.college_code}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* College Info */}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground">{college.college_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {college.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {college.college_code}
                          </div>
                          {college.course_type && (
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {college.course_type}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Select College Button */}
                      <Button
                        onClick={() => handleCollegeSelect(college)}
                        variant="outline"
                        className="shrink-0 bg-white hover:bg-accent"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Help Text */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">💡 Tips for searching:</p>
                <ul className="space-y-1 list-disc list-inside text-blue-700">
                  <li><strong>College Name:</strong> You can search with partial names</li>
                  <li><strong>College Code:</strong> Use the official college code from your documents</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Selection Dialog */}
      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Selection</DialogTitle>
            <DialogDescription>
              Please review your Round 1 college selection details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCollege && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">College:</span>
                  <span className="text-sm text-muted-foreground">{selectedCollege.college.college_name}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-muted-foreground">{selectedCollege.college.city}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">Course:</span>
                  <Badge variant="secondary" className="w-fit">{selectedCollege.college.course_type}</Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">College Code:</span>
                  <code className="px-2 py-1 bg-muted rounded text-sm w-fit">
                    {selectedCollege.college.college_code}
                  </code>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection}>
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Round 1 College Details?</AlertDialogTitle>
            <AlertDialogDescription>
              Based on this selection, your Round 2 recommendation list will be generated when you complete the preference settings.
              This will help you find the best available options for your next round of counselling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalConfirm}>
              Confirm Details
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditConfirmation} onOpenChange={setShowEditConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit your college selection? This will reset your current selection and any generated Round 2 recommendation list will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEdit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Edit Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditConfirmationRecommendation} onOpenChange={setShowEditConfirmationRecommendation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit your Round 2 Recommendation? This will reset your current Round 2 Recommendation list and any generated Round 2 Recommendation list will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRecommendationConfirmEdit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Edit Round 2 Recommendation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollToTop />
    </div>
  );
};
