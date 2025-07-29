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
import { Search, Building2, MapPin, Globe, Check, BookOpen, X, Plus, GripVertical, ChevronDown, ChevronUp, Sparkles, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Round2Disclaimer } from './Round2Disclaimer';
import { RecommendationCard } from './RecommendationCard';
import { CategoryFilter } from './CategoryFilter';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { PremiumGate } from './PremiumGate';

interface SelectedCollege {
  college: CollegeSearchResult;
  selectedDepartment: CollegeDepartment;
}

export const Round2Tab = () => {
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

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];
    
    ['Dream', 'Reach', 'Match', 'Safety'].forEach(category => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              id: item.college.College_Code || item.college.SJ_Institute_Code,
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

  // Load from localStorage and API on mount
  useEffect(() => {
    const loadExistingData = async () => {
      // First check for cached Round 2 recommendations in session storage
      const cachedRound2Recommendations = sessionStorage.getItem('cachedRound2Recommendations');
      if (cachedRound2Recommendations) {
        try {
          const parsedRecs = JSON.parse(cachedRound2Recommendations);
          console.log('Loaded cached Round 2 recommendations from session storage:', parsedRecs);
          setRound2Recommendations(parsedRecs);
          setHasGeneratedRecommendations(true);
        } catch (error) {
          console.error('Error loading cached Round 2 recommendations:', error);
          sessionStorage.removeItem('cachedRound2Recommendations');
        }
      }

      // Check for existing Round 2 recommendations in localStorage if no session cache
      if (!cachedRound2Recommendations) {
        const storedRecommendations = localStorage.getItem('round2Recommendations');
        if (storedRecommendations) {
          try {
            const parsedRecs = JSON.parse(storedRecommendations);
            if (parsedRecs && Object.keys(parsedRecs).length > 0) {
              const convertedRecs = convertApiResponseToRecommendations(parsedRecs);
              console.log('Loaded stored Round 2 recommendations from localStorage:', convertedRecs);
              setRound2Recommendations(convertedRecs);
              setHasGeneratedRecommendations(true);
              
              // Check if these recommendations were paid and should unlock
              if (parsedRecs.is_payment === true) {
                localStorage.setItem('recommendationUnlocked', 'true');
                setIsUnlocked(true);
              }
              
              // Cache in session storage for faster future access
              sessionStorage.setItem('cachedRound2Recommendations', JSON.stringify(convertedRecs));
            }
          } catch (error) {
            console.error('Error loading stored recommendations:', error);
            // Clear corrupted data
            localStorage.removeItem('round2Recommendations');
          }
        }
      }

      // Load Round 2 selection data
      const stored = localStorage.getItem('round2Selection');
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setSelectedCollege(parsedData.selectedCollege);
          setIsConfirmed(parsedData.isConfirmed);
          if (parsedData.isConfirmed) {
            setShowPreferences(true);
            await loadPreferencesFromFormData();
          }
        } catch (error) {
          console.error('Error loading stored selection data:', error);
        }
      }


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
            localStorage.setItem('round2Selection', JSON.stringify(storageData));
            
            // Load preferences after confirming college
            await loadPreferencesFromFormData();
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

  const handleConfirmEdit = () => {
    // Clear localStorage and reset state
    localStorage.removeItem('round2Selection');
    localStorage.removeItem('round2Preferences');
    setSelectedCollege(null);
    setIsConfirmed(false);
    setShowPreferences(false);
    setEditingPreferences(false);
    setSelectedBranches([]);
    setSelectedCities([]);
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
      localStorage.setItem('round2Selection', JSON.stringify(storageData));

      // Get form data from session storage for category and CET percentile
      const formData = recommendationStorage.getFormData();
      const category = formData?.reservationCategory || "";
      const cetPercentile = formData?.cetPercentile || formData?.cet_percentile || 0;

      // Prepare API payload
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
        toast({
          title: "College Details Confirmed",
          description: "Your Round 1 college details have been confirmed and saved. Now please review and update your preferences for Round 2.",
        });
      } else {
        // If API fails, still keep local storage but show warning
        setIsConfirmed(true);
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
    // First try to get preferences from localStorage
    const storedPreferences = localStorage.getItem('round2Preferences');
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        setShowPreferences(true); // Show preferences when loaded from storage
        return;
      } catch (error) {
        console.log('Error parsing stored preferences, continuing...');
      }
    }

    // Then try to get preferences from API
    if (user?.accessToken) {
      try {
        const response = await apiService.getUserRoundPreferences(2, user.accessToken);
        if (response.success && response.data && (response.data.branches?.length > 0 || response.data.cities?.length > 0)) {
          const branches = response.data.branches || [];
          const cities = response.data.cities || [];
          
          setSelectedBranches(branches);
          setSelectedCities(cities);
          setShowPreferences(true); // Show preferences when loaded from API
          
          // Store in localStorage for future use
          localStorage.setItem('round2Preferences', JSON.stringify({
            branches,
            cities,
            timestamp: Date.now()
          }));
          return;
        }
      } catch (error) {
        console.log('No existing preferences found in API, falling back to form data');
      }
    }

    // Fall back to form data from session storage if API returns empty or fails
    const formData = recommendationStorage.getFormData();
    if (formData) {
      const branches = formData.preferredStreams || [];
      const cities = formData.preferredCities || [];
      
      setSelectedBranches(branches);
      setSelectedCities(cities);
      setShowPreferences(true); // Show preferences when loaded from form data
      
      // Store in localStorage for consistency
      localStorage.setItem('round2Preferences', JSON.stringify({
        branches,
        cities,
        timestamp: Date.now()
      }));
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
      // First, call the getUserRoundPreferences API to fetch latest preferences
      const preferencesResponse = await apiService.getUserRoundPreferences(2, user.accessToken);
      
      const payload = {
        round: 2,
        branches: selectedBranches,
        cities: selectedCities
      };

      const response = await apiService.updateRoundPreferences(payload, user.accessToken);
      
      if (response.success) {
        setEditingPreferences(false);
        
        // Update localStorage with new preferences
        localStorage.setItem('round2Preferences', JSON.stringify({
          branches: selectedBranches,
          cities: selectedCities,
          timestamp: Date.now()
        }));
        
        toast({
          title: "Preferences Updated",
          description: "Your Round 2 preferences have been successfully updated.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update preferences. Please try again.",
          variant: "destructive"
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

  // Helper functions for PreferencesForm layout
  const addBranch = (branch: string) => {
    if (!selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const removeBranch = (branch: string) => {
    setSelectedBranches(selectedBranches.filter(b => b !== branch));
  };

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleBranchDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedBranches);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedBranches(items);
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

    if (selectedBranches.length === 0) {
      toast({
        title: "Missing Preferences",
        description: "Please select at least one engineering branch to generate recommendations",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCollege?.selectedDepartment?.choice_code) {
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
        round: 2,
        branches: selectedBranches,
        cities: selectedCities
      };

      await apiService.updateRoundPreferences(preferencesPayload, user.accessToken);
      
      // Update localStorage with latest preferences
      localStorage.setItem('round2Preferences', JSON.stringify({
        branches: selectedBranches,
        cities: selectedCities,
        timestamp: Date.now()
      }));

      // Get form data for category and CET percentile
      const formData = recommendationStorage.getFormData();
      const category = formData?.reservationCategory || "GOPENS";
      const cetPercentile = formData?.cetPercentile || formData?.cet_percentile || 0;

      // Generate Round 2 recommendations
      const generateRoundListPayload = {
        category: category,
        cet_percentile: cetPercentile,
        cet_course: selectedBranches,
        location: selectedCities,
        round: 2,
        last_round_college_choice_code: selectedCollege.selectedDepartment.choice_code
      };

      const response = await apiService.generateRoundList(generateRoundListPayload, user.accessToken);
      
      if (response.success) {
        // Store the raw API response in localStorage
        localStorage.setItem('round2Recommendations', JSON.stringify(response.data));
        
        // Convert and set recommendations for display
        const convertedRecs = convertApiResponseToRecommendations(response.data);
        setRound2Recommendations(convertedRecs);
        setHasGeneratedRecommendations(true);
        
        // Cache the converted recommendations in session storage for faster access
        sessionStorage.setItem('cachedRound2Recommendations', JSON.stringify(convertedRecs));
        
        // Check if payment is included and unlock recommendations automatically
        if (response.data.is_payment === true) {
          localStorage.setItem('recommendationUnlocked', 'true');
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


  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownload();
  const [activeCategory, setActiveCategory] = useState<string>('All');

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

      return (b.cutoff_percentile || 0) - (a.cutoff_percentile || 0);
    });
  };

  const getCategorizedRecommendations = () => {
    if (!round2Recommendations || round2Recommendations.length === 0) {
      return [];
    }

    let filtered = round2Recommendations;

    if (activeCategory !== 'All') {
      filtered = round2Recommendations.filter(rec => rec.category === activeCategory);
    }

    return sortRecommendationsByCategory(filtered);
  };

  const categoryStats = {
    Dream: round2Recommendations?.filter(r => r.category === 'Dream').length || 0,
    Reach: round2Recommendations?.filter(r => r.category === 'Reach').length || 0,
    Match: round2Recommendations?.filter(r => r.category === 'Match').length || 0,
    Safety: round2Recommendations?.filter(r => r.category === 'Safety').length || 0,
  };

  const categorizedRecommendations = getCategorizedRecommendations();

  const availableBranches = [
    "ALL",
    "Agricultural",
    "Artificial Intelligence",
    "Automobile",
    "Bio Technology",
    "Biomedical",
    "Chemical",
    "Civil",
    "Computer",
    "Cyber Security",
    "Data Science",
    "Electrical",
    "Electronics",
    "Food Technology",
    "Information Technology",
    "Instrumentation",
    "Internet of Things",
    "Manufacturing",
    "Mechanical",
    "Mechatronics",
    "Metallurgy and Material Technology",
    "Mining",
    "Pharmaceutical Technology",
    "Polymer",
    "Production",
    "Robotics and Automation",
    "Surface Coating Technology",
    "Textile Technology"
  ];

  const availableCities = [
    "ALL",
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Chh. Sambhaji Nagar (Aurangabad)",
    "Chikhli",
    "Dharashiv (Osmanabad)",
    "Dhule",
    "Ichalkaranji",
    "Jalgaon",
    "Jalna",
    "Kalyan",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Palghar",
    "Pandharpur",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Ulhasnagar",
    "Wardha",
    "Washim",
    "Yavatmal"
  ];

  const renderDepartments = (college: CollegeSearchResult) => {
    const departments = Array.isArray(college.department) ? college.department : [college.department];
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Select Department:</h4>
        <div className="grid gap-2">
          {departments.map((dept, index) => (
            <div 
              key={`${dept.choice_code}-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{dept.course_name}</p>
                <p className="text-xs text-muted-foreground">Choice Code: {dept.choice_code}</p>
                {dept.course_code && (
                  <p className="text-xs text-muted-foreground">Course Code: {dept.course_code}</p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleDepartmentSelect(college, dept)}
                variant={selectedCollege?.selectedDepartment.choice_code === dept.choice_code ? "default" : "outline"}
                className="ml-2"
              >
                {selectedCollege?.selectedDepartment.choice_code === dept.choice_code ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Selected
                  </>
                ) : (
                  'Select'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
                  <span className="text-sm text-green-700 sm:text-right">{selectedCollege.college.College_Name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-green-700">{selectedCollege.college.City}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">Department:</span>
                  <Badge variant="secondary" className="w-fit">{selectedCollege.selectedDepartment.course_name}</Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">Choice Code:</span>
                  <code className="px-2 py-1 bg-green-100 rounded text-sm w-fit">
                    {selectedCollege.selectedDepartment.choice_code}
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
                          Engineering Branches
                          <span className="text-red-500">*</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <SearchableSelect
                          options={availableBranches
                            .filter(branch => !selectedBranches.includes(branch))
                            .map(branch => ({ value: branch, label: branch }))}
                          value=""
                          onValueChange={addBranch}
                          placeholder="Add your favorite engineering branches"
                          searchPlaceholder="Search branches..."
                          className="w-full"
                        />

                        {selectedBranches.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              🎯 Your Preferences (drag to reorder by priority):
                            </p>
                            <div className={`border-2 rounded-xl p-3 bg-white ${selectedBranches.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                              <DragDropContext onDragEnd={handleBranchDragEnd}>
                                <Droppable droppableId="branches">
                                  {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                      {selectedBranches.map((branch, index) => (
                                        <Draggable key={branch} draggableId={branch} index={index}>
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
                                              <span className="flex-1 text-sm font-medium text-slate-700">{branch}</span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeBranch(branch)}
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
                            <p>Select your dream engineering branches!</p>
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
                    <Label className="text-sm font-medium text-blue-800">Selected Engineering Branches:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBranches.length > 0 ? (
                        selectedBranches.map((branch) => (
                          <Badge key={branch} variant="secondary" className="text-xs">
                            {branch}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-blue-600 italic">No branches selected</span>
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
      {showPreferences && !editingPreferences && selectedBranches.length > 0 && !hasGeneratedRecommendations && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGeneratingRecommendations}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl transition-all duration-200 text-white font-bold text-lg rounded-xl"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isGeneratingRecommendations ? 'Generating...' : 'Generate Round 2 Recommendations'}
          </Button>
        </div>
      )}

      {/* Round 2 Recommendations Display */}
      {hasGeneratedRecommendations && round2Recommendations.length > 0 && (
        <div className="space-y-6">
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
                {activeCategory !== 'All' && ` in ${activeCategory} category`}
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
                console.log('Round 2 Recommendation:', recommendation);
                if (!recommendation || !recommendation.college || !recommendation.college.name) {
                  console.error('Invalid recommendation data:', recommendation);
                  return null;
                }
                
                return (
                  <RecommendationCard
                    key={`${recommendation.college?.College_Code || recommendation.college?.id}-${recommendation.course_name}-${index}`}
                    recommendation={recommendation}
                    index={index + 1}
                  />
                );
              })}
            </div>
          ) : (
            <div className="relative">
              {/* Blurred preview cards */}
              <div className="space-y-4 opacity-30 blur-sm pointer-events-none">
                {categorizedRecommendations.slice(0, 3).map((recommendation, index) => {
                  if (!recommendation || !recommendation.college || !recommendation.college.name) {
                    return null;
                  }
                  
                  return (
                    <RecommendationCard
                      key={`preview-${recommendation.college?.College_Code || recommendation.college?.id}-${index}`}
                      recommendation={recommendation}
                      index={index + 1}
                    />
                  );
                })}
              </div>
              
              {/* Unlock section overlay - directing to Round 1 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border-2 border-blue-200 max-w-md mx-4">
                  <Lock className="mx-auto mb-3 text-blue-600" size={32} />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🔒 Round 2 Recommendations
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete payment in Round 1 to unlock all rounds including Round 2 recommendations.
                  </p>
                  <Button 
                    onClick={() => {
                      // Find the Round 1 tab and click it
                      const round1Tab = document.querySelector('[data-value="round1"]') as HTMLElement;
                      if (round1Tab) {
                        round1Tab.click();
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Go to Round 1 for Payment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Generate New Recommendations Button */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={() => {
                setHasGeneratedRecommendations(false);
                setRound2Recommendations([]);
                localStorage.removeItem('round2Recommendations');
                sessionStorage.removeItem('cachedRound2Recommendations');
              }}
              variant="outline"
              className="px-6 py-2"
            >
              Generate New Recommendations
            </Button>
          </div>
        </div>
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
      {!isConfirmed && (
        <>
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
                    {searchType === 'choice_code' ? 'Choice Code' : 
                     searchType === 'college_name' ? 'College Name' : 'College Code'}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-value"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={
                        searchType === 'choice_code' ? 'Enter choice code (e.g., 211626310)' :
                        searchType === 'college_name' ? 'Enter college name' :
                        'Enter college code (e.g., 1146)'
                      }
                      type={searchType === 'college_name' ? 'text' : 'number'}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                <Card key={`${college.College_code}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* College Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground">{college.College_Name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {college.City}
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                Code: {college.College_code}
                              </div>
                              {college.College_Website && (
                                <a 
                                  href={college.College_Website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                >
                                  <Globe className="w-4 h-4" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Departments */}
                      {renderDepartments(college)}
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
                  <li><strong>Choice Code:</strong> Use the exact choice code from your Round 1 allotment</li>
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
                  <span className="text-sm text-muted-foreground">{selectedCollege.college.College_Name}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-muted-foreground">{selectedCollege.college.City}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">Department:</span>
                  <Badge variant="secondary" className="w-fit">{selectedCollege.selectedDepartment.course_name}</Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">Choice Code:</span>
                  <code className="px-2 py-1 bg-muted rounded text-sm w-fit">
                    {selectedCollege.selectedDepartment.choice_code}
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

    </div>
  );
};
export default Round2Tab;