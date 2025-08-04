import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, CollegeSearchResult, CollegeDepartment } from '@/services/api';
import { recommendationStorage } from '@/services/recommendationStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Building2, MapPin, Globe, Check, BookOpen, X, Plus, GripVertical, ChevronDown, ChevronUp, Sparkles, Lock, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Round2Disclaimer } from '../Round2Disclaimer';
import { DiplomaRecommendationCard } from './DiplomaRecommendationCard';
import { DiplomaCategoryFilter } from './DiplomaCategoryFilter';
import { usePdfDownloadDSY } from '@/hooks/usePdfDownloadDSY';
import { PremiumGate } from '../PremiumGate';
import ScrollToTop from '../../ScrollToTop';
import { NoResultsState } from '../NoResultsState';

interface SelectedCollege {
  college: CollegeSearchResult;
  selectedDepartment: CollegeDepartment;
}

export const DiplomaRound2Tab = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [searchType, setSearchType] = useState<'choice_code' | 'college_name' | 'college_code'>('choice_code');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CollegeSearchResult[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
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
          recommendations.push({
            category: category,
            college: {
              id: item.college.SJ_Institute_Code,
              name: item.college.College_Name,
              city: item.college.City,
              logo: item.college.College_Logo,
              website: item.college.College_Website,
              type: item.college.College_Type,
              nirf_rank: item.college.NIRF_Rank_Min,
              fees: item.college["Annual_Fees_(INR)"],
              placement_percentage: item.college.Overall_College_Placement_Percentage,
              top_recruiters: item.college.Top_Recruiters || []
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            reservation_category: item.category
          });
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
      const cachedRound2Recommendations = sessionStorage.getItem('cachedDiplomaRound2Recommendations');
      if (cachedRound2Recommendations) {
        try {
          const parsedRecs = JSON.parse(cachedRound2Recommendations);
          console.log('Loaded cached Diploma Round 2 recommendations from session storage:', parsedRecs);
          setRound2Recommendations(parsedRecs);
          setHasGeneratedRecommendations(true);
        } catch (error) {
          console.error('Error loading cached Diploma Round 2 recommendations:', error);
          sessionStorage.removeItem('cachedDiplomaRound2Recommendations');
        }
      }

      // Check for existing Round 2 recommendations in localStorage if no session cache
      if (!cachedRound2Recommendations) {
        const storedRecommendations = localStorage.getItem('diplomaRound2Recommendations');
        if (storedRecommendations) {
          try {
            const parsedRecs = JSON.parse(storedRecommendations);
            if (parsedRecs && Object.keys(parsedRecs).length > 0) {
              const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
              console.log('Loaded stored Diploma Round 2 recommendations from localStorage:', convertedRecs);
              setRound2Recommendations(convertedRecs);
              setHasGeneratedRecommendations(true);
              
              // Check if these recommendations were paid and should unlock
              if (parsedRecs.is_payment === true) {
                localStorage.setItem('recommendationUnlocked', 'true');
                setIsUnlocked(true);
              }
              
              // Cache in session storage for faster future access
              sessionStorage.setItem('cachedDiplomaRound2Recommendations', JSON.stringify(convertedRecs));
            }
          } catch (error) {
            console.error('Error loading stored recommendations:', error);
            // Clear corrupted data
            localStorage.removeItem('diplomaRound2Recommendations');
          }
        }
      }

      // Load Round 2 selection data
      const stored = localStorage.getItem('diplomaRound2Selection');
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setSelectedCollege(parsedData.selectedCollege);
          setIsConfirmed(parsedData.isConfirmed);
          if (parsedData.isConfirmed) {
            setShowPreferences(true);
          }
        } catch (error) {
          console.error('Error loading stored selection data:', error);
        }
      }

      // Always load preferences immediately for faster access
      await loadPreferencesFromFormData();

      // If no localStorage data and user is logged in, try API
      if (user?.accessToken) {
        try {
          const response = await apiService.getUserRoundDetails(2, user.accessToken);
          if (response.success && response.data && Object.keys(response.data).length > 0) {
            const apiData = response.data;
            // Convert API response to selectedCollege format
            const selectedCollege: SelectedCollege = {
              college: {
                College_Name: apiData.College_Name,
                College_code: apiData.College_code,
                City: apiData.City,
                College_Website: "", // Default empty values for missing fields
                department: [] // Default empty array
              } as CollegeSearchResult,
              selectedDepartment: {
                course_name: apiData.Course_Name,
                course_code: apiData.Course_Code,
                choice_code: apiData.Choice_Code
              } as CollegeDepartment
            };
            setSelectedCollege(selectedCollege);
            setIsConfirmed(true);
            setShowPreferences(true);
            
            // Also save to localStorage for future use
            const storageData = { selectedCollege, isConfirmed: true };
            localStorage.setItem('diplomaRound2Selection', JSON.stringify(storageData));
          } else {
            // API returned empty object or no data - user needs to select college
            console.log('No existing Round 2 selection found, user needs to select college');
          }
        } catch (error) {
          console.error('Error loading user round details:', error);
        }
      }
    };

    loadExistingData();
  }, [user?.accessToken]);

  // Check unlock status using same key as Round 1
  useEffect(() => {
    const checkUnlockStatus = () => {
      const isUnlocked = localStorage.getItem('recommendationUnlocked') === 'true';
      setIsUnlocked(isUnlocked);
    };
    
    checkUnlockStatus();
    
    // Listen for storage changes
    window.addEventListener('storage', checkUnlockStatus);
    return () => window.removeEventListener('storage', checkUnlockStatus);
  }, []);

  const searchTypeOptions = [
    { value: 'choice_code', label: 'Choice Code' },
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
      
      switch (searchType) {
        case 'choice_code':
          const choiceCode = parseInt(searchValue);
          if (isNaN(choiceCode)) {
            toast({
              title: "Invalid Choice Code",
              description: "Choice code must be a number",
              variant: "destructive"
            });
            return;
          }
          response = await apiService.searchCollegeByChoiceCode({ choice_code: choiceCode }, user.accessToken);
          break;
          
        case 'college_name':
          response = await apiService.searchCollegeByName({ college_name: searchValue }, user.accessToken);
          break;
          
        case 'college_code':
          const collegeCode = parseInt(searchValue);
          if (isNaN(collegeCode)) {
            toast({
              title: "Invalid College Code",
              description: "College code must be a number",
              variant: "destructive"
            });
            return;
          }
          response = await apiService.searchCollegeByCode({ college_code: collegeCode }, user.accessToken);
          break;
      }

      if (response.success && response.data) {
        // Handle different response structures
        if (Array.isArray(response.data)) {
          setSearchResults(response.data);
        } else {
          setSearchResults([response.data]);
        }
      } else {
        setSearchResults([]);
        const errorMessage = searchType === 'choice_code' 
          ? "No college found for this choice code"
          : searchType === 'college_name'
          ? "No colleges found matching this name"
          : "No college found for this college code";
        
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
  }

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
    localStorage.removeItem('diplomaRound2Recommendations');
    sessionStorage.removeItem('cachedDiplomaRound2Recommendations');
    localStorage.removeItem('diplomaRound2Selection');
    setHasGeneratedRecommendations(false);
    toast({
      title: "Selection Reset",
      description: "You can now make a new selection for Round 2 recommendations.",
    });
  };

  const handleConfirmEdit = () => {
    // Clear localStorage and reset state
    setRound2Recommendations([]);
    localStorage.removeItem('diplomaRound2Recommendations');
    sessionStorage.removeItem('cachedDiplomaRound2Recommendations');
    localStorage.removeItem('diplomaRound2Selection');
    setHasGeneratedRecommendations(false);
    setSelectedCollege(null);
    setIsConfirmed(false);
    setShowPreferences(false);
    setEditingPreferences(false);
    setSelectedBranches([]);
    setSelectedCities([]);
    setSkipRound1Selection(false);
    setShowEditConfirmation(false);
    toast({
      title: "Selection Reset",
      description: "You can now make a new selection for Round 2 recommendations.",
    });
  };

  const handleDepartmentSelect = (college: CollegeSearchResult, department: CollegeDepartment) => {
    setSelectedCollege({ college, selectedDepartment: department });
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
      const storageData = {
        selectedCollege,
        isConfirmed: true
      };
      localStorage.setItem('diplomaRound2Selection', JSON.stringify(storageData));

      // Get form data from session storage for category and CET percentile
      const formData = recommendationStorage.getFormData();
      const category = formData?.reservationCategory || "";
      const cetPercentile = formData?.diplomaPercentage || 0;

      // Prepare API payload (for diploma it might use different fields)
      const apiPayload = {
        username: user.email,
        college_name: selectedCollege.college.College_Name,
        college_code: selectedCollege.college.College_code,
        course_name: selectedCollege.selectedDepartment.course_name,
        course_code: selectedCollege.selectedDepartment.course_code || 0,
        choice_code: selectedCollege.selectedDepartment.choice_code,
        round: 2,
        location: selectedCollege.college.City,
        category: category,
        cet_percentile: cetPercentile
      };

      // Store to backend
      const response = await apiService.storeCollegeDetails(apiPayload, user.accessToken);
      
      if (response.success) {
        setIsConfirmed(true);
        setShowPreferences(true);
        await loadPreferencesFromFormData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
          title: "College Details Confirmed",
          description: "Your Round 1 college details have been confirmed and saved. Now please review and update your preferences for Round 2.",
        });
      } else {
        // If API fails, still keep local storage but show warning
        setIsConfirmed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
          title: "Details Saved Locally",
          description: "Your college details were saved locally. We'll sync them when connection is available.",
          variant: "destructive"
        });
      }
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
      const formData = recommendationStorage.getFormData();
      if (formData) {
        const branches = formData.selectedBranches || [];
        const cities = formData.selectedCities || [];
        
        setSelectedBranches(branches);
        setSelectedCities(cities);
        
        console.log('Loaded preferences from form data:', { branches, cities });
      }
    } catch (error) {
      console.error('Error loading preferences from form data:', error);
    }
  };

  const availableBranches = [
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Production Engineering',
    'Textile Engineering',
    'Instrumentation Engineering',
    'Automobile Engineering',
    'Biotechnology Engineering',
    'Agricultural Engineering',
    'Mining Engineering',
    'Metallurgical Engineering',
    'Printing & Packaging Technology',
    'Polymer Engineering',
    'Food Technology',
    'Fashion Technology',
    'Interior Design'
  ];

  const availableCities = [
    'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 
    'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalgaon', 'Nanded',
    'Satara', 'Beed', 'Yavatmal', 'Buldhana', 'Washim', 'Hingoli', 'Gadchiroli', 'Wardha',
    'Ratnagiri', 'Sindhudurg', 'Osmanabad', 'Jalna', 'Sangli', 'Gondia', 'Bhandara'
  ];

  const handleUpdatePreferences = async () => {
    if (selectedBranches.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one branch",
        variant: "destructive"
      });
      return;
    }

    if (selectedCities.length === 0) {
      toast({
        title: "Selection Required", 
        description: "Please select at least one city",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPreferences(true);

    try {
      const formData = recommendationStorage.getFormData();
      
      if (formData) {
        const updatedFormData = {
          ...formData,
          selectedBranches,
          selectedCities
        };
        
        recommendationStorage.saveFormData(updatedFormData);
        
        setEditingPreferences(false);
        
        toast({
          title: "Preferences Updated",
          description: "Your Round 2 preferences have been saved successfully.",
        });
      }
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

  const handleGenerateRecommendations = async () => {
    if (!skipRound1Selection && (!selectedCollege || !isConfirmed)) {
      toast({
        title: "College Selection Required",
        description: "Please select and confirm your Round 1 college first.",
        variant: "destructive"
      });
      return;
    }

    if (selectedBranches.length === 0 || selectedCities.length === 0) {
      toast({
        title: "Preferences Required",
        description: "Please select your branches and cities preferences.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.accessToken) {
      toast({
        title: "Login Required",
        description: "Please login to generate recommendations.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingRecommendations(true);

    try {
      const formData = recommendationStorage.getFormData();
      
      const payload = {
        category: formData?.reservationCategory || "",
        cet_percentile: formData?.diplomaPercentage || 0,
        cet_course: selectedBranches,
        location: selectedCities,
        round: 2,
        last_round_college_choice_code: skipRound1Selection ? 0 : (selectedCollege?.selectedDepartment.choice_code || 0)
      };

      console.log('Generating Diploma Round 2 recommendations with payload:', payload);

      const response = await apiService.generateDiplomaRound2List(payload);

      if (response.success && response.data) {
        console.log('Diploma Round 2 recommendations response:', response.data);
        
        // Store in localStorage
        localStorage.setItem('diplomaRound2Recommendations', JSON.stringify(response.data));
        
        // Convert and set recommendations
        const convertedRecommendations = convertApiResponseToRecommendations(response.data);
        setRound2Recommendations(convertedRecommendations);
        setHasGeneratedRecommendations(true);
        
        // Cache in session storage
        sessionStorage.setItem('cachedDiplomaRound2Recommendations', JSON.stringify(convertedRecommendations));
        
        // Check payment status
        if (response.data.is_payment === true) {
          localStorage.setItem('recommendationUnlocked', 'true');
          setIsUnlocked(true);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        toast({
          title: "Recommendations Generated",
          description: "Your Round 2 recommendations are ready!",
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

  const handleReorder = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(round2Recommendations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setRound2Recommendations(items);
    
    // Update localStorage with new order
    const storedRecommendations = localStorage.getItem('diplomaRound2Recommendations');
    if (storedRecommendations) {
      try {
        const parsed = JSON.parse(storedRecommendations);
        // Rebuild the categorized structure with new order
        const categorizedRecommendations = {
          Dream: items.filter(item => item.category === 'Dream').map(item => ({
            college: {
              SJ_Institute_Code: item.college.id,
              College_Name: item.college.name,
              City: item.college.city,
              College_Logo: item.college.logo,
              College_Website: item.college.website,
              College_Type: item.college.type,
              NIRF_Rank_Min: item.college.nirf_rank,
              "Annual_Fees_(INR)": item.college.fees,
              Overall_College_Placement_Percentage: item.college.placement_percentage,
              Top_Recruiters: item.college.top_recruiters
            },
            course: item.course_name,
            cutoff: item.cutoff_percentile,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            category: item.reservation_category
          })),
          Reach: items.filter(item => item.category === 'Reach').map(item => ({
            college: {
              SJ_Institute_Code: item.college.id,
              College_Name: item.college.name,
              City: item.college.city,
              College_Logo: item.college.logo,
              College_Website: item.college.website,
              College_Type: item.college.type,
              NIRF_Rank_Min: item.college.nirf_rank,
              "Annual_Fees_(INR)": item.college.fees,
              Overall_College_Placement_Percentage: item.college.placement_percentage,
              Top_Recruiters: item.college.top_recruiters
            },
            course: item.course_name,
            cutoff: item.cutoff_percentile,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            category: item.reservation_category
          })),
          Match: items.filter(item => item.category === 'Match').map(item => ({
            college: {
              SJ_Institute_Code: item.college.id,
              College_Name: item.college.name,
              City: item.college.city,
              College_Logo: item.college.logo,
              College_Website: item.college.website,
              College_Type: item.college.type,
              NIRF_Rank_Min: item.college.nirf_rank,
              "Annual_Fees_(INR)": item.college.fees,
              Overall_College_Placement_Percentage: item.college.placement_percentage,
              Top_Recruiters: item.college.top_recruiters
            },
            course: item.course_name,
            cutoff: item.cutoff_percentile,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            category: item.reservation_category
          })),
          Safety: items.filter(item => item.category === 'Safety').map(item => ({
            college: {
              SJ_Institute_Code: item.college.id,
              College_Name: item.college.name,
              City: item.college.city,
              College_Logo: item.college.logo,
              College_Website: item.college.website,
              College_Type: item.college.type,
              NIRF_Rank_Min: item.college.nirf_rank,
              "Annual_Fees_(INR)": item.college.fees,
              Overall_College_Placement_Percentage: item.college.placement_percentage,
              Top_Recruiters: item.college.top_recruiters
            },
            course: item.course_name,
            cutoff: item.cutoff_percentile,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile,
            category: item.reservation_category
          })),
          is_payment: parsed.is_payment,
          accept_payment: parsed.accept_payment
        };
        
        localStorage.setItem('diplomaRound2Recommendations', JSON.stringify(categorizedRecommendations));
        sessionStorage.setItem('cachedDiplomaRound2Recommendations', JSON.stringify(items));
      } catch (error) {
        console.error('Error updating recommendation order:', error);
      }
    }
  };

  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownloadDSY();

  // Show existing recommendations if they exist
  if (hasGeneratedRecommendations && round2Recommendations.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
        <ScrollToTop />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Round 2 Direct Second Year Recommendations</h1>
                  <p className="text-gray-600">Your personalized college recommendations for Round 2</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRestRecommendation}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Generate New List
                </Button>
                
                {isUnlocked && (
                  <Button 
                    onClick={() => {
                      const formData = recommendationStorage.getFormData();
                      generatePDF(round2Recommendations, formData);
                    }}
                    disabled={isPdfGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPdfGenerating ? 'Generating...' : 'Download PDF'}
                  </Button>
                )}
              </div>
            </div>
            
            <Round2Disclaimer />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <DiplomaCategoryFilter 
              activeCategory="All"
              onCategoryChange={(category) => {
                if (category === 'All') {
                  // Show all recommendations
                  const storedRecommendations = localStorage.getItem('diplomaRound2Recommendations');
                  if (storedRecommendations) {
                    const parsedRecs = JSON.parse(storedRecommendations);
                    const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
                    setRound2Recommendations(convertedRecs);
                  }
                } else {
                  // Filter by category
                  const storedRecommendations = localStorage.getItem('diplomaRound2Recommendations');
                  if (storedRecommendations) {
                    const parsedRecs = JSON.parse(storedRecommendations);
                    const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
                    const filtered = convertedRecs.filter(rec => rec.category === category);
                    setRound2Recommendations(filtered);
                  }
                }
              }}
              stats={{
                Dream: round2Recommendations.filter(r => r.category === 'Dream').length,
                Reach: round2Recommendations.filter(r => r.category === 'Reach').length,
                Match: round2Recommendations.filter(r => r.category === 'Match').length,
                Safety: round2Recommendations.filter(r => r.category === 'Safety').length,
              }}
            />
          </div>

          {/* Recommendations List */}
          {round2Recommendations.length > 0 ? (
            <DragDropContext onDragEnd={handleReorder}>
              <Droppable droppableId="recommendations">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {round2Recommendations.map((recommendation, index) => (
                      <Draggable 
                        key={`${recommendation.college.id}-${recommendation.course_name}-${index}`} 
                        draggableId={`${recommendation.college.id}-${recommendation.course_name}-${index}`} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-all duration-200 ${
                              snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : ''
                            }`}
                          >
                            <DiplomaRecommendationCard
                              recommendation={recommendation}
                              index={index + 1}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Found</h3>
              <p className="text-gray-600">We couldn't find any colleges matching your criteria for Round 2. Try adjusting your preferences.</p>
            </div>
          )}

          {!isUnlocked && round2Recommendations.length > 0 && (
            <PremiumGate 
              onUnlock={() => {
                localStorage.setItem('recommendationUnlocked', 'true');
                setIsUnlocked(true);
                toast({
                  title: "Recommendations Unlocked!",
                  description: "You now have full access to all recommendation features.",
                });
              }}
            />
          )}
        </div>

        {/* Edit Confirmation Dialog */}
        <AlertDialog open={showEditConfirmationRecommendation} onOpenChange={setShowEditConfirmationRecommendation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate New Round 2 List?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear your current Round 2 recommendations and allow you to create a new list. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRecommendationConfirmEdit}
                className="bg-red-600 hover:bg-red-700"
              >
                Generate New List
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Main interface - show college selection or preferences
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
      <ScrollToTop />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Round 2 Direct Second Year Counselling</h1>
              <p className="text-gray-600">Generate your Round 2 recommendations based on your Round 1 selection</p>
            </div>
          </div>
          
          <Round2Disclaimer />
        </div>

        {/* Show preferences form if confirmed or creating new list */}
        {(isConfirmed || skipRound1Selection) && showPreferences ? (
          <div className="space-y-6">
            {/* College Selection Summary */}
            {isConfirmed && selectedCollege && !skipRound1Selection && (
              <Card>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setIsCollegeCardCollapsed(!isCollegeCardCollapsed)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      Round 1 College Selection Confirmed
                    </CardTitle>
                    {isCollegeCardCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                
                {!isCollegeCardCollapsed && (
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-green-900">{selectedCollege.college.College_Name}</h3>
                          <p className="text-green-700 font-medium">{selectedCollege.selectedDepartment.course_name}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedCollege.college.City}
                            </span>
                            <span>Choice Code: {selectedCollege.selectedDepartment.choice_code}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleEditSelection}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Change Selection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Preferences Card */}
            <Card>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Round 2 Preferences</CardTitle>
                  <div className="flex items-center gap-2">
                    {!editingPreferences && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPreferences(true);
                        }}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Edit Preferences
                      </Button>
                    )}
                    {isPreferencesCardCollapsed ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {!isPreferencesCardCollapsed && (
                <CardContent className="space-y-4">
                  {editingPreferences ? (
                    <>
                      {/* Branch Selection */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">Preferred Branches</Label>
                        <Select value="" onValueChange={(value) => {
                          if (value && !selectedBranches.includes(value)) {
                            setSelectedBranches(prev => [...prev, value]);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branches..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBranches.map(branch => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedBranches.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedBranches.map((branch, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {branch}
                                <X 
                                  className="w-3 h-3 ml-2 cursor-pointer" 
                                  onClick={() => setSelectedBranches(prev => prev.filter(b => b !== branch))}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* City Selection */}
                      <div>
                        <Label className="text-base font-medium mb-3 block">Preferred Cities</Label>
                        <Select value="" onValueChange={(value) => {
                          if (value && !selectedCities.includes(value)) {
                            setSelectedCities(prev => [...prev, value]);
                          }
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cities..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedCities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCities.map((city, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {city}
                                <X 
                                  className="w-3 h-3 ml-2 cursor-pointer" 
                                  onClick={() => setSelectedCities(prev => prev.filter(c => c !== city))}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={handleUpdatePreferences}
                          disabled={isUpdatingPreferences || selectedBranches.length === 0 || selectedCities.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isUpdatingPreferences ? 'Updating...' : 'Update Preferences'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingPreferences(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Selected Branches</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedBranches.length > 0 ? (
                            selectedBranches.map((branch, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {branch}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No branches selected</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Selected Cities</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCities.length > 0 ? (
                            selectedCities.map((city, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {city}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm">No cities selected</p>
                          )}
                        </div>
                      </div>

                      {/* Generate Button */}
                      <div className="pt-4">
                        <Button 
                          onClick={handleGenerateRecommendations}
                          disabled={isGeneratingRecommendations || selectedBranches.length === 0 || selectedCities.length === 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3"
                        >
                          {isGeneratingRecommendations ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating Recommendations...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5" />
                              Generate Round 2 Recommendations
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        ) : (
          /* College Selection Interface */
          <div className="space-y-6">
            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Create New List - First Option */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="p-6" onClick={handleCreateNewList}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">Create New Round 2 List</h3>
                      <p className="text-sm text-blue-700">
                        Don't have Round 1 details? Start fresh with a new Round 2 recommendation list based on your preferences.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Use Round 1 Selection */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-1">Use Round 1 College Selection</h3>
                      <p className="text-sm text-green-700">
                        Search and select your Round 1 college to generate targeted Round 2 recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* College Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Your Round 1 College
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="searchType">Search By</Label>
                    <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {searchTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="searchValue">
                      {searchType === 'choice_code' ? 'Choice Code' : 
                       searchType === 'college_name' ? 'College Name' : 'College Code'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="searchValue"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder={
                          searchType === 'choice_code' ? 'Enter choice code (e.g., 12345)' :
                          searchType === 'college_name' ? 'Enter college name' :
                          'Enter college code (e.g., 123)'
                        }
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button 
                        onClick={handleSearch} 
                        disabled={isSearching || !searchValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isSearching ? 'Searching...' : 'Search'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="font-semibold">Search Results</h3>
                    {searchResults.map((college, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{college.College_Name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {college.City}
                                </span>
                                <span>College Code: {college.College_code}</span>
                                {college.College_Website && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    <a href={college.College_Website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      Website
                                    </a>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {college.department && Array.isArray(college.department) && college.department.length > 0 ? (
                            <div>
                              <h5 className="font-medium mb-2">Available Departments:</h5>
                              <div className="space-y-2">
                                {college.department.map((dept, deptIndex) => (
                                  <div key={deptIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <p className="font-medium">{dept.course_name}</p>
                                      <p className="text-sm text-gray-600">Choice Code: {dept.choice_code}</p>
                                    </div>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleDepartmentSelect(college, dept)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      Select
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">No departments available</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Selection Confirmation Dialog */}
      <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Selection</DialogTitle>
            <DialogDescription>
              Please confirm your Round 1 college and department selection:
            </DialogDescription>
          </DialogHeader>
          
          {selectedCollege && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">{selectedCollege.college.College_Name}</h3>
              <p className="text-blue-700 font-medium">{selectedCollege.selectedDepartment.course_name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedCollege.college.City}
                </span>
                <span>Choice Code: {selectedCollege.selectedDepartment.choice_code}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection} className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog open={showFinalConfirmation} onOpenChange={setShowFinalConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Final Confirmation</DialogTitle>
            <DialogDescription>
              This will save your Round 1 college selection and proceed to set up your Round 2 preferences. 
              You can change this later if needed.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalConfirmation(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFinalConfirm} 
              disabled={isStoring}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isStoring ? 'Saving...' : 'Confirm & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog open={showEditConfirmation} onOpenChange={setShowEditConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Round 1 Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current Round 1 college selection and any generated recommendations. 
              You'll need to search and select your college again. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmEdit}
              className="bg-red-600 hover:bg-red-700"
            >
              Change Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
