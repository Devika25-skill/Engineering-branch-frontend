import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  apiService,
  CollegeSearchResult,
  CollegeDepartment,
} from "@/services/api";
import { recommendationStorage } from "@/services/recommendationStorage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Building2,
  MapPin,
  Globe,
  Check,
  BookOpen,
  X,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Round2Disclaimer } from "./Round2Disclaimer";
import { RecommendationCard } from "./RecommendationCard";
import { CategoryFilter } from "./CategoryFilter";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { PremiumGate } from "./PremiumGate";
import ScrollToTop from "../ScrollToTop";
import { NoResultsState } from "./NoResultsState";

interface SelectedCollege {
  college: CollegeSearchResult;
  selectedDepartment: CollegeDepartment;
}

export const Round2Tab = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [searchType, setSearchType] = useState<
    "choice_code" | "college_name" | "college_code"
  >("choice_code");
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CollegeSearchResult[]>([]);
  const [selectedCollege, setSelectedCollege] =
    useState<SelectedCollege | null>(() => {
      try {
        const saved = sessionStorage.getItem("round2SelectedCollege");
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error("Failed to restore selected college", e);
        return null;
      }
    });
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
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] =
    useState(true);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);
  const [round2Recommendations, setRound2Recommendations] = useState<any[]>([]);
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] =
    useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [skipRound1Selection, setSkipRound1Selection] = useState(false);
  const [
    showEditConfirmationRecommendation,
    setShowEditConfirmationRecommendation,
  ] = useState(false);

  // Convert API response to recommendation format
  const convertApiResponseToRecommendations = (apiData: any) => {
    const recommendations: any[] = [];

    ["Dream", "Reach", "Match", "Safety"].forEach((category) => {
      if (apiData[category] && Array.isArray(apiData[category])) {
        apiData[category].forEach((item: any) => {
          recommendations.push({
            category: category,
            college: {
              id: item.college.SJ_Institute_Code,
              name: item.college.College_Name || item.college.college_name,
              city: item.college.City || item.college.city,
              logo: item.college.College_Logo || item.college.college_logo,
              college_code:
                item.college.College_Code ||
                item.college.College_code ||
                item.college.college_code ||
                item.college.dte_code ||
                item.college.institute_code,
              website:
                item.college.College_Website || item.college.college_website,
              type: item.college.College_Type || item.college.college_type,
              nirf_rank: item.college.NIRF_Rank_Min,
              fees:
                item.college["Annual_Fees_(INR)"] || item.college.annual_fees,
              placement:
                item.college.Overall_College_Placement_Percentage ||
                item.college.overall_college_placement_percentage ||
                null,
              Student_Intake:
                item.college.Student_Intake ||
                item.college.student_intake ||
                null,
              top_recruiters:
                item.college.Top_Recruiters ||
                item.college.top_recruiters ||
                [],
              rating:
                item.college.College_Reviews_out_of_5 ||
                item.college.college_reviews_out_of_5 ||
                null,
            },
            course_name: item.course,
            cutoff_percentile: item.cutoff,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cet_percentile: item.cet_percentile || item.cet_rank,
            reservation_category: item.category,
            choice_code: item.choice_code || null,
          });
        });
      }
    });

    return recommendations;
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hasGeneratedRecommendations]);

  // Sync selectedCollege with sessionStorage
  useEffect(() => {
    if (selectedCollege) {
      sessionStorage.setItem(
        "round2SelectedCollege",
        JSON.stringify(selectedCollege),
      );
    } else {
      sessionStorage.removeItem("round2SelectedCollege");
    }
  }, [selectedCollege]);

  // Load from localStorage and API on mount
  useEffect(() => {
    const loadExistingData = async () => {
      // First check for cached Round 2 recommendations in session storage
      const cachedRound2Recommendations = sessionStorage.getItem(
        "cachedRound2Recommendations_v3",
      );
      if (cachedRound2Recommendations) {
        try {
          const parsedRecs = JSON.parse(cachedRound2Recommendations);
          setRound2Recommendations(parsedRecs);
          setHasGeneratedRecommendations(true);
        } catch (error) {
          console.error("Error loading cached Round 2 recommendations:", error);
          sessionStorage.removeItem("cachedRound2Recommendations_v3");
        }
      }

      // Check for existing Round 2 recommendations in localStorage if no session cache
      // If not in storage, try fetching from API (fallback)
      if (!cachedRound2Recommendations) {
        const storedRecommendations = localStorage.getItem(
          "round2Recommendations",
        );

        let apiData = null;
        if (storedRecommendations) {
          apiData = JSON.parse(storedRecommendations);
        } else if (user?.accessToken) {
          // Fetch from API if not in local storage
          try {
            const response = await apiService.getRoundRecommendations(
              2,
              user.accessToken,
            );
            if (
              response.success &&
              response.data &&
              Object.keys(response.data).length > 0
            ) {
              apiData = response.data;
              // Store it so we don't fetch again
              localStorage.setItem(
                "round2Recommendations",
                JSON.stringify(apiData),
              );
            }
          } catch (error) {
            console.error("Error fetching Round 2 recommendations:", error);
          }
        }

        if (apiData && Object.keys(apiData).length > 0) {
          try {
            const convertedRecs = convertApiResponseToRecommendations(apiData);
            setRound2Recommendations(convertedRecs);
            setHasGeneratedRecommendations(true);

            // Check if these recommendations were paid and should unlock
            if (apiData.is_payment === true) {
              localStorage.setItem("recommendationUnlocked", "true");
              setIsUnlocked(true);
            }

            // Cache in session storage for faster future access
            sessionStorage.setItem(
              "cachedRound2Recommendations_v3",
              JSON.stringify(convertedRecs),
            );
          } catch (error) {
            console.error("Error processing loaded recommendations:", error);
          }
        }
      }

      // Load Round 2 selection data
      const stored = localStorage.getItem("round2Selection");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setSelectedCollege(parsedData.selectedCollege);
          setIsConfirmed(parsedData.isConfirmed);
          if (parsedData.isConfirmed) {
            setShowPreferences(true);
          }
        } catch (error) {
          console.error("Error loading stored selection data:", error);
        }
      }

      // Always load preferences immediately for faster access
      await loadPreferencesFromFormData();

      // If no localStorage data and user is logged in, try API
      if (user?.accessToken) {
        try {
          const isKarnataka =
            localStorage.getItem("selected_state") === "Karnataka";

          if (isKarnataka) {
            const response =
              await apiService.getKarnatakaEngineeringRoundDetails(
                1, // Karnataka Round 2 uses round=1 query param
                user.accessToken,
              );

            if (response.success && response.data) {
              const apiData = response.data;
              // Convert API response to selectedCollege format
              const selectedCollege: SelectedCollege = {
                college: {
                  College_Name: apiData.college_name,
                  College_code: apiData.college_code.toString(),
                  City: apiData.city,
                  College_Website: "", // Default empty values for missing fields
                  department: [], // Default empty array
                } as CollegeSearchResult,
                selectedDepartment: {
                  course_name: apiData.course_name,
                  course_code: 0,
                  choice_code: 0, // Placeholder
                } as unknown as CollegeDepartment,
              };
              setSelectedCollege(selectedCollege);
              setIsConfirmed(true);
              setShowPreferences(true);

              // Also save to localStorage for future use
              const storageData = { selectedCollege, isConfirmed: true };
              localStorage.setItem(
                "round2Selection",
                JSON.stringify(storageData),
              );
            }
          } else {
            const response = await apiService.getUserRoundDetails(
              2,
              user.accessToken,
            );
            if (
              response.success &&
              response.data &&
              Object.keys(response.data).length > 0
            ) {
              const apiData = response.data;
              // Convert API response to selectedCollege format
              const selectedCollege: SelectedCollege = {
                college: {
                  College_Name: apiData.College_Name,
                  College_code: apiData.College_code,
                  City: apiData.City,
                  College_Website: "", // Default empty values for missing fields
                  department: [], // Default empty array
                } as CollegeSearchResult,
                selectedDepartment: {
                  course_name: apiData.Course_Name,
                  course_code: apiData.Course_Code,
                  choice_code: apiData.Choice_Code,
                } as CollegeDepartment,
              };
              setSelectedCollege(selectedCollege);
              setIsConfirmed(true);
              setShowPreferences(true);

              // Also save to localStorage for future use
              const storageData = { selectedCollege, isConfirmed: true };
              localStorage.setItem(
                "round2Selection",
                JSON.stringify(storageData),
              );
            }
          }
        } catch (error) {
          console.error("Error loading user round details:", error);
        }
      }
    };

    loadExistingData();
  }, [user?.accessToken]);

  // Check unlock status using same key as Round 1
  useEffect(() => {
    const checkUnlockStatus = () => {
      const isUnlocked =
        localStorage.getItem("recommendationUnlocked") === "true";
      setIsUnlocked(isUnlocked);
    };

    checkUnlockStatus();

    // Listen for storage changes
    window.addEventListener("storage", checkUnlockStatus);
    return () => window.removeEventListener("storage", checkUnlockStatus);
  }, []);

  // Set default search type for Karnataka
  useEffect(() => {
    const isKarnataka = localStorage.getItem("selected_state") === "Karnataka";
    if (isKarnataka && searchType === "choice_code") {
      setSearchType("college_code");
    }
  }, []);

  const searchTypeOptions = [
    { value: "college_code", label: "College Code" },
    { value: "college_name", label: "College Name" },
    { value: "choice_code", label: "Choice Code" },
  ].filter((option) =>
    localStorage.getItem("selected_state") === "Karnataka"
      ? option.value !== "choice_code"
      : true,
  );

  const handleGenerateRecommendations = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Authentication Required",
        description: "Please login to generate recommendations",
        variant: "destructive",
      });
      return;
    }

    if (selectedBranches.length === 0) {
      toast({
        title: "Missing Preferences",
        description:
          "Please select at least one engineering branch to generate recommendations",
        variant: "destructive",
      });
      return;
    }

    // Check local storage for Karnataka state
    const isKarnataka = localStorage.getItem("selected_state") === "Karnataka";

    if (
      !skipRound1Selection &&
      !selectedCollege?.selectedDepartment?.choice_code &&
      !isKarnataka // Skip choice_code check for Karnataka
    ) {
      toast({
        title: "Missing College Selection",
        description:
          "Please select your Round 1 college before generating recommendations",
        variant: "destructive",
      });
      return;
    }

    // For Karnataka, ensure college is selected (even if choice_code is missing)
    if (
      isKarnataka &&
      !skipRound1Selection &&
      (!selectedCollege?.college?.College_code ||
        !selectedCollege?.selectedDepartment?.course_name)
    ) {
      toast({
        title: "Missing College Selection",
        description:
          "Please select your Round 1 college before generating recommendations",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingRecommendations(true);

    try {
      // Update preferences first
      const preferencesPayload = {
        round: 2,
        branches: selectedBranches,
        cities: selectedCities.length > 0 ? selectedCities : ["ALL"],
      };

      if (isKarnataka) {
        // Get form data
        const formData = recommendationStorage.getFormData();
        const category = formData?.reservationCategory || "GM";
        const cetRank = formData?.cetRank || formData?.cet_rank || 0;
        const gender = formData?.gender || "male";

        const payload = {
          category: category,
          cet_rank: cetRank,
          cet_course: selectedBranches,
          cities: selectedCities,
          gender: gender,
          round: 2,
          last_round_choice_college_code:
            selectedCollege?.college?.College_code?.toString() || "",
          last_round_choice_course_name:
            selectedCollege?.selectedDepartment?.course_name || "",
        };

        const response = await apiService.karnatakaEngineeringRecommendation(
          payload,
          user.accessToken,
        );

        if (response.success && response.data) {
          const convertedRecs = convertApiResponseToRecommendations(
            response.data,
          );
          setRound2Recommendations(convertedRecs);
          setHasGeneratedRecommendations(true);

          if (response.data.is_payment === true) {
            localStorage.setItem("recommendationUnlocked", "true");
            setIsUnlocked(true);
          }

          sessionStorage.setItem(
            "cachedRound2Recommendations_v3",
            JSON.stringify(convertedRecs),
          );

          localStorage.setItem(
            "round2Recommendations",
            JSON.stringify(response.data),
          );

          toast({
            title: "Recommendations Generated",
            description: "Your Round 2 recommendations have been generated.",
          });
        } else {
          toast({
            title: "Generation Failed",
            description:
              response.message || "Failed to generate recommendations",
            variant: "destructive",
          });
        }
      } else {
        // EXISTING LOGIC FOR NON-KARNATAKA
        await apiService.updateRoundPreferences(
          preferencesPayload,
          user.accessToken,
        );

        // Update localStorage with latest preferences
        localStorage.setItem(
          "round2Preferences",
          JSON.stringify({
            branches: selectedBranches,
            cities: selectedCities.length > 0 ? selectedCities : ["ALL"],
            timestamp: Date.now(),
          }),
        );

        // Get form data for category and CET percentile
        let formData = recommendationStorage.getFormData();

        // Attempt to fetch missing data
        if ((!formData || !formData.district) && user?.email) {
          try {
            const capResponse = await apiService.fetchAICapDetails(
              user.accessToken,
              user.email,
            );
            if (capResponse.success && capResponse.data) {
              const apiData = capResponse.data;
              const credentials = apiData.academic_credentials || apiData;
              const gender = apiData.gender;
              const otherExam =
                credentials.examPercentiles?.otherEntranceExam?.[0];

              const mappedData = {
                gender: gender || undefined,
                reservationCategory:
                  credentials.reservationCategory || "GOPENS",
                grouping:
                  credentials.educationBackground?.stream ||
                  "PCM (Physics, Chemistry, Mathematics)",
                tenthMarks:
                  credentials.academicMarks?._10thGradeMarksPercent ||
                  undefined,
                twelfthMarks:
                  credentials.academicMarks?._12thGradeMarksPercent ||
                  undefined,
                groupingMarks:
                  credentials.academicMarks?.groupingMarksPercent || undefined,
                cetPercentile: credentials.examPercentiles?.CET || undefined,
                jeePercentile: credentials.examPercentiles?.JEE || undefined,
                otherExamName: otherExam?.examName || undefined,
                otherExamPercentile: otherExam?.percentileOrScore || undefined,
                sportsAchievements:
                  credentials.achievementsExperience?.sportsAchievements ||
                  undefined,
                certifications:
                  credentials.achievementsExperience?.certifications ||
                  undefined,
                internships:
                  credentials.achievementsExperience
                    ?.internshipsWorkExperience || undefined,
                otherAchievements:
                  credentials.achievementsExperience?.otherAchievements ||
                  undefined,
                preferredStreams:
                  credentials.preferences?.engineeringBranches || [],
                preferredCities: credentials.preferences?.preferredCities || [],
                district:
                  credentials.preferences?.preferredDistrict || undefined,
                hostelPreference:
                  credentials.campusFacilitiesEnvironment?.hostelFacility ||
                  undefined,
                campusSetting:
                  credentials.campusFacilitiesEnvironment?.campusSetting ||
                  undefined,
                transportFacility:
                  credentials.campusFacilitiesEnvironment?.transportFacility ||
                  undefined,
                wifiTechInfrastructure:
                  credentials.campusFacilitiesEnvironment
                    ?.wifiTechInfrastructure || undefined,
                coCurricularActivities:
                  credentials.campusFacilitiesEnvironment
                    ?.coCurricularActivities || undefined,
                maxBudget: credentials.annualBudget || undefined,
                collegeTypes: credentials.collegeTypePreferences || [],
                priorities: credentials.priorityFactors || [],
              };

              recommendationStorage.saveAcademicDetails(mappedData);
              recommendationStorage.savePreferences(mappedData);
              recommendationStorage.savePriorities(mappedData);
              sessionStorage.setItem(
                "recommendationFormData",
                JSON.stringify(mappedData),
              );
              sessionStorage.setItem(
                "recommendation_form_data",
                JSON.stringify(mappedData),
              );
              formData = mappedData;
            }
          } catch (e) {
            console.error("Failed to restore form data", e);
          }
        }

        // Call the generic API
        const response = await apiService.generateRecommendations(
          2,
          user.accessToken,
        );

        if (response.success && response.data) {
          const convertedRecs = convertApiResponseToRecommendations(
            response.data,
          );
          setRound2Recommendations(convertedRecs);
          setHasGeneratedRecommendations(true);

          if (response.data.is_payment === true) {
            localStorage.setItem("recommendationUnlocked", "true");
            setIsUnlocked(true);
          }

          sessionStorage.setItem(
            "cachedRound2Recommendations_v3",
            JSON.stringify(convertedRecs),
          );

          localStorage.setItem(
            "round2Recommendations",
            JSON.stringify(response.data),
          );

          toast({
            title: "Recommendations Generated",
            description: "Your Round 2 recommendations have been generated.",
          });
        } else {
          throw new Error(
            response.message || "Failed to generate recommendations",
          );
        }
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search value",
        variant: "destructive",
      });
      return;
    }

    if (!isLoggedIn || !user?.accessToken) {
      toast({
        title: "Login Required",
        description: "Please login to search colleges",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedCollege(null);

    try {
      let response;
      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      switch (searchType) {
        case "choice_code":
          // Check if the value is purely numeric or alphanumeric
          const isNumericOnly = /^\d+$/.test(searchValue.trim());
          const choiceCodeValue = isNumericOnly
            ? parseInt(searchValue.trim())
            : searchValue.trim();
          response = await apiService.searchCollegeByChoiceCode(
            { choice_code: choiceCodeValue },
            user.accessToken,
          );
          break;

        case "college_name":
          if (isKarnataka) {
            response = await apiService.searchKarnatakaCollegeByName(
              searchValue,
              user.accessToken,
            );
          } else {
            response = await apiService.searchCollegeByName(
              { college_name: searchValue },
              user.accessToken,
            );
          }
          break;

        case "college_code":
          if (isKarnataka) {
            // Karnataka college code is a string (E184), no parseInt needed
            response = await apiService.searchKarnatakaCollegeByCode(
              searchValue.trim(),
              user.accessToken,
            );
          } else {
            const collegeCode = parseInt(searchValue);
            if (isNaN(collegeCode)) {
              toast({
                title: "Invalid College Code",
                description: "College code must be a number",
                variant: "destructive",
              });
              return;
            }
            response = await apiService.searchCollegeByCode(
              { college_code: collegeCode },
              user.accessToken,
            );
          }
          break;
      }

      if (response.success && response.data) {
        // Handle different response structures
        if (isKarnataka) {
          const apiData = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const mappedData: CollegeSearchResult[] = apiData.map(
            (item: any) => ({
              College_Name: item.college_name,
              College_Website: "", // Not provided in Karnataka search API
              City: item.city,
              College_code: item.college_code,
              department: Array.isArray(item.department)
                ? item.department.map((dept: any) => ({
                    course_name: dept.course_name,
                    // choice_code not available in search response for Karnataka
                  }))
                : [],
            }),
          );
          setSearchResults(mappedData);
        } else {
          if (Array.isArray(response.data)) {
            setSearchResults(response.data);
          } else {
            setSearchResults([response.data]);
          }
        }
      } else {
        setSearchResults([]);
        const errorMessage =
          searchType === "choice_code"
            ? "No college found for this choice code"
            : searchType === "college_name"
              ? "No colleges found matching this name"
              : "No college found for this college code";

        toast({
          title: "No Results",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: "Failed to search colleges. Please try again.",
        variant: "destructive",
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
      description:
        "Set your preferences below to generate Round 2 recommendations without Round 1 selection.",
    });
  };
  const handleRecommendationConfirmEdit = () => {
    // Clear localStorage and reset state
    setRound2Recommendations([]);
    localStorage.removeItem("round2Recommendations");
    sessionStorage.removeItem("cachedRound2Recommendations");
    localStorage.removeItem("round2Selection");
    setHasGeneratedRecommendations(false);
    toast({
      title: "Selection Reset",
      description:
        "You can now make a new selection for Round 2 recommendations.",
    });
  };
  const handleConfirmEdit = () => {
    // Clear localStorage and reset state
    setRound2Recommendations([]);
    localStorage.removeItem("round2Recommendations");
    sessionStorage.removeItem("cachedRound2Recommendations");
    localStorage.removeItem("round2Selection");
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
      description:
        "You can now make a new selection for Round 2 recommendations.",
    });
  };

  const handleDepartmentSelect = (
    college: CollegeSearchResult,
    department: CollegeDepartment,
  ) => {
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
        variant: "destructive",
      });
      return;
    }

    setIsStoring(true);
    setShowFinalConfirmation(false);

    try {
      // Store to localStorage first
      const storageData = {
        selectedCollege,
        isConfirmed: true,
      };
      localStorage.setItem("round2Selection", JSON.stringify(storageData));

      // Get form data from session storage for category and CET percentile
      const formData = recommendationStorage.getFormData();
      const category = formData?.reservationCategory || "";
      const cetPercentile =
        formData?.cetPercentile || formData?.cet_percentile || 0;
      const cetRank = formData?.cetRank || formData?.cet_rank || 0;

      const isKarnataka =
        localStorage.getItem("selected_state") === "Karnataka";

      let response;

      if (isKarnataka) {
        const payload = {
          round: 1, // Karnataka Round 2 uses round=1 for storage
          college_code: selectedCollege.college.College_code,
          college_name: selectedCollege.college.College_Name,
          course_name: selectedCollege.selectedDepartment.course_name,
          city: selectedCollege.college.City,
          category: category,
          cet_rank: cetRank, // Use authentic cetRank
          isDeleted: false,
        };
        response = await apiService.storeKarnatakaEngineeringRoundDetails(
          payload,
          user.accessToken,
        );
      } else {
        // Prepare API payload
        const apiPayload = {
          username: user.email,
          college_name: selectedCollege.college.College_Name,
          college_code: selectedCollege.college.College_code as number,
          course_name: selectedCollege.selectedDepartment.course_name,
          course_code: selectedCollege.selectedDepartment.course_code || 0,
          choice_code: selectedCollege.selectedDepartment.choice_code as number,
          round: 2,
          location: selectedCollege.college.City,
          category: category,
          cet_percentile: cetPercentile,
        };

        // Store to backend
        response = await apiService.storeCollegeDetails(
          apiPayload,
          user.accessToken,
        );
      }

      if (response.success) {
        setIsConfirmed(true);
        setShowPreferences(true);
        await loadPreferencesFromFormData();
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast({
          title: "College Details Confirmed",
          description:
            "Your Round 1 college details have been confirmed and saved. Now please review and update your preferences for Round 2.",
        });
      } else {
        // If API fails, still keep local storage but show warning
        setIsConfirmed(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast({
          title: "Details Saved Locally",
          description:
            "Your college details were saved locally. We'll sync them when connection is available.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error storing college details:", error);
      // Still set as confirmed if localStorage succeeded
      setIsConfirmed(true);
      setShowPreferences(true);
      await loadPreferencesFromFormData();
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({
        title: "Details Saved Locally",
        description:
          "Your college details were saved locally. Please review your preferences below.",
        variant: "destructive",
      });
    } finally {
      setIsStoring(false);
    }
  };

  const loadPreferencesFromFormData = async () => {
    // First try to get preferences from localStorage
    const storedPreferences = localStorage.getItem("round2Preferences");
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        return;
      } catch (error) {
        console.error("Error parsing stored preferences, continuing...");
      }
    }

    // Then try to get preferences from API
    if (user?.accessToken) {
      try {
        let branches: string[] = [];
        let cities: string[] = [];
        let hasData = false;

        if (localStorage.getItem("selected_state") === "Karnataka") {
          const configResponse =
            await apiService.fetchKarnatakaEngineeringConfig(user.accessToken);
          if (
            configResponse.success &&
            configResponse.data?.academic_credentials?.preferences
          ) {
            const prefs = configResponse.data.academic_credentials.preferences;
            branches = prefs.engineeringBranches || [];
            cities = prefs.preferredCities || [];
            hasData = branches.length > 0 || cities.length > 0;
          }
        } else {
          const response = await apiService.getUserRoundPreferences(
            2,
            user.accessToken,
          );
          if (
            response.success &&
            response.data &&
            (response.data.branches?.length > 0 ||
              response.data.cities?.length > 0)
          ) {
            branches = response.data.branches || [];
            cities = response.data.cities || [];
            hasData = true;
          }
        }

        if (hasData) {
          setSelectedBranches(branches);
          setSelectedCities(cities);
          setShowPreferences(true); // Show preferences when loaded from API

          // Store in localStorage for future use
          localStorage.setItem(
            "round2Preferences",
            JSON.stringify({
              branches,
              cities,
              timestamp: Date.now(),
            }),
          );
          return;
        }
      } catch (error) {
        console.error(
          "No existing preferences found in API, falling back to form data",
        );
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
      localStorage.setItem(
        "round2Preferences",
        JSON.stringify({
          branches,
          cities,
          timestamp: Date.now(),
        }),
      );
    }
  };

  const handleUpdatePreferences = async () => {
    if (!user?.accessToken) {
      toast({
        title: "Authentication Required",
        description: "Please login to update preferences",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingPreferences(true);

    try {
      let isSuccess = false;

      // Check if Karnataka state is selected
      if (localStorage.getItem("selected_state") === "Karnataka") {
        // 1. Fetch current Karnataka config
        const configResponse = await apiService.fetchKarnatakaEngineeringConfig(
          user.accessToken,
        );

        if (configResponse.success && configResponse.data) {
          const currentConfig = configResponse.data;

          // 2. Prepare updated payload with new preferences
          const updatedPayload = {
            ...currentConfig,
            academic_credentials: {
              ...currentConfig.academic_credentials,
              preferences: {
                ...currentConfig.academic_credentials?.preferences,
                engineeringBranches: selectedBranches,
                preferredCities:
                  selectedCities.length > 0 ? selectedCities : ["Bengaluru"], // Default to Bengaluru if empty for Karnataka
                // preferredDistrict is removed for Karnataka as per requirements
              },
            },
          };

          // 3. Store updated config
          const storeResponse =
            await apiService.storeKarnatakaEngineeringConfig(updatedPayload);
          isSuccess = storeResponse.success;
        }
      } else {
        // Existing logic for other states (Maharashtra)
        // First, call the getUserRoundPreferences API to fetch latest preferences
        await apiService.getUserRoundPreferences(2, user.accessToken);

        const payload = {
          round: 2,
          branches: selectedBranches,
          cities: selectedCities.length > 0 ? selectedCities : ["ALL"],
        };

        const response = await apiService.updateRoundPreferences(
          payload,
          user.accessToken,
        );
        isSuccess = response.success;
      }

      if (isSuccess) {
        setEditingPreferences(false);

        // Update localStorage with new preferences
        localStorage.setItem(
          "round2Preferences",
          JSON.stringify({
            branches: selectedBranches,
            cities: selectedCities.length > 0 ? selectedCities : ["ALL"],
            timestamp: Date.now(),
          }),
        );

        window.scrollTo({ top: 0, behavior: "smooth" });

        toast({
          title: "Preferences Updated",
          description:
            "Your Round 2 preferences have been successfully updated.",
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update preferences. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPreferences(false);
    }
  };

  // Helper functions for PreferencesForm layout
  const addBranch = (branch: string) => {
    if (branch === "ALL") {
      setSelectedBranches(["ALL"]);
      return;
    }
    if (!selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const removeBranch = (branch: string) => {
    setSelectedBranches(selectedBranches.filter((b) => b !== branch));
  };

  const addCity = (city: string) => {
    if (city === "ALL") {
      setSelectedCities(["ALL"]);
      return;
    }
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter((c) => c !== city));
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

  const { generatePDF, isGenerating: isPdfGenerating } = usePdfDownload();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleDownloadPDF = () => {
    if (!isUnlocked) {
      toast({
        title: "Download Locked",
        description:
          "Please unlock recommendations to download the Round 2 PDF report. Your Round 1 unlock also works for Round 2.",
        variant: "destructive",
      });
      return;
    }

    const formData = recommendationStorage.getFormData();
    generatePDF(round2Recommendations, formData, {
      branches: selectedBranches,
      cities: selectedCities,
    });
  };

  const sortRecommendationsByCategory = (recs: any[]) => {
    return recs.sort((a, b) => {
      const categoryOrder = { Dream: 0, Reach: 1, Match: 2, Safety: 3 };
      const categoryA =
        categoryOrder[a.category as keyof typeof categoryOrder] ?? 4;
      const categoryB =
        categoryOrder[b.category as keyof typeof categoryOrder] ?? 4;

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

    if (activeCategory !== "All") {
      filtered = round2Recommendations.filter(
        (rec) => rec.category === activeCategory,
      );
    }

    return sortRecommendationsByCategory(filtered);
  };

  const categoryStats = {
    Dream:
      round2Recommendations?.filter((r) => r.category === "Dream").length || 0,
    Reach:
      round2Recommendations?.filter((r) => r.category === "Reach").length || 0,
    Match:
      round2Recommendations?.filter((r) => r.category === "Match").length || 0,
    Safety:
      round2Recommendations?.filter((r) => r.category === "Safety").length || 0,
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
    "Textile Technology",
  ];

  // Get selected state from localStorage
  const selectedState = localStorage.getItem("selected_state") || "Maharashtra";

  const maharashtraCities = [
    "ALL",
    "Adgaon",
    "Ahmednagar",
    "Akluj",
    "Akola",
    "Almala",
    "Ambejogai",
    "Ambernath",
    "Amlibari Fata",
    "Amravati",
    "Arvi",
    "Asangaon",
    "Ashta",
    "Ashti",
    "Avasari Khurd",
    "Badlapur",
    "Badnapur",
    "Ballarpur",
    "Baramati",
    "Barshi",
    "Beed",
    "Belhe",
    "Bhalgaon",
    "Bhandara",
    "Bhandup West",
    "Bhor",
    "Bhusawal",
    "Boisar",
    "Buldhana",
    "Chandrapur",
    "Chandwad",
    "Chhatrapati Sambhaji Nagar (Aurangabad)",
    "Chikhli",
    "Chopda",
    "Dharashiv (Osmanabad)",
    "Dhule",
    "Dondaicha",
    "Faizpur",
    "Gadhinglaj",
    "Ghotsai",
    "Gondur",
    "Ichalkaranji",
    "Indapur",
    "Induri",
    "Jalgaon",
    "Jalna",
    "Jaysingpur",
    "Jaywantnagar",
    "Junnar",
    "Kada",
    "Kalamb (Walchandnagar)",
    "Kalmeshwar",
    "Kalyan",
    "Kamshet",
    "Karad",
    "Karjat",
    "Katraj",
    "Khalapur",
    "Khed",
    "Kolhapur",
    "Kopargaon",
    "Lakhewadi",
    "Latur",
    "Lonavala",
    "Lonere",
    "Loni",
    "Malegaon",
    "Malkapur",
    "Mira Bhayandar",
    "Mira Road",
    "Miraj",
    "Mohili-Aghai",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Narhe",
    "Nashik",
    "Navi Mumbai",
    "Neral",
    "Paladhi BK",
    "Palghar",
    "Pandharpur",
    "Panhala",
    "Paniv",
    "Panvel",
    "Parbhani",
    "Parli Vaijnath",
    "Peth Naka (Islampur)",
    "Phaltan",
    "Phulepimpalgaon",
    "Pimpri-Chinchwad",
    "Pune",
    "Raigad",
    "Raigaon",
    "Rajuri (Junnar)",
    "Ramtek",
    "Ratnagiri",
    "Sakoli",
    "Sangamner",
    "Sangli",
    "Sangola",
    "Sasewadi",
    "Satara",
    "Sawantwadi",
    "Sevagram",
    "Shahada",
    "Shahapur",
    "Shegaon",
    "Shevgaon",
    "Shirpur",
    "Shrirampur",
    "Sindhudurg",
    "Solapur",
    "Sukhali (Gupchup)",
    "Swami Chincholi",
    "Talegaon Dabhade",
    "Thane",
    "Tuljapur",
    "Ulhasnagar",
    "Vasai",
    "Vasai East",
    "Velhale",
    "Virar",
    "Vita",
    "Warananagar",
    "Wardha",
    "Washim",
    "Yavatmal",
    "Yeola",
  ];

  const karnatakaCities = [
    "ALL",
    "Bagalkote",
    "Ballari",
    "Belagavi",
    "Bengaluru",
    "Bidar",
    "Chamarajanagara",
    "Chikkaballapura",
    "Chikkamagaluru (Chikmagalur)",
    "Chintamani",
    "Chitradurga",
    "Davanagere",
    "Devanahalli",
    "Dharwad",
    "Gadag",
    "Gokak",
    "Haliyal",
    "Hassan",
    "Haveri",
    "Hubballi (Hubli)",
    "Kalaburagi",
    "Karwar",
    "Kolar",
    "Koppal",
    "Kushalanagar",
    "Mandya",
    "Mangaluru (Mangalore)",
    "Moodabidri (Moodabidre)",
    "Mysuru (Mysore)",
    "Nelamangala",
    "Ponnampet",
    "Puttur",
    "Raichur",
    "Ramanagara (Ramanagar)",
    "Shivamogga (Shimoga)",
    "Shorapur",
    "Sullia",
    "Tiptur",
    "Tumakuru (Tumkur)",
    "Udupi",
    "Ujire",
    "Vijayapura",
  ];

  const availableCities =
    selectedState === "Karnataka" ? karnatakaCities : maharashtraCities;

  const renderDepartments = (college: CollegeSearchResult) => {
    const departments = Array.isArray(college.department)
      ? college.department
      : [college.department];

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
                {localStorage.getItem("selected_state") !== "Karnataka" && (
                  <p className="text-xs text-muted-foreground">
                    Choice Code: {dept.choice_code}
                  </p>
                )}
                {dept.course_code && (
                  <p className="text-xs text-muted-foreground">
                    Course Code: {dept.course_code}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => handleDepartmentSelect(college, dept)}
                variant={
                  selectedCollege?.selectedDepartment.choice_code ===
                  dept.choice_code
                    ? "default"
                    : "outline"
                }
                className="ml-2"
              >
                {selectedCollege?.selectedDepartment.choice_code ===
                dept.choice_code ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Selected
                  </>
                ) : (
                  "Select"
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
                  disabled={
                    hasGeneratedRecommendations &&
                    round2Recommendations.length > 0
                  }
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
                  <span className="text-sm text-green-700 sm:text-right">
                    {selectedCollege.college.College_Name}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-green-700">
                    {selectedCollege.college.City}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">Department:</span>
                  <Badge variant="secondary" className="w-fit">
                    {selectedCollege.selectedDepartment.course_name}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-medium text-sm">
                    {localStorage.getItem("selected_state") === "Karnataka"
                      ? "College Code:"
                      : "Choice Code:"}
                  </span>
                  <code className="px-2 py-1 bg-green-100 rounded text-sm w-fit">
                    {localStorage.getItem("selected_state") === "Karnataka"
                      ? selectedCollege.college.College_code
                      : selectedCollege.selectedDepartment.choice_code}
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
            onClick={() =>
              setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)
            }
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
                    disabled={
                      hasGeneratedRecommendations &&
                      round2Recommendations.length > 0
                    }
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
                            .filter(
                              (branch) => !selectedBranches.includes(branch),
                            )
                            .map((branch) => ({
                              value: branch,
                              label: branch,
                            }))}
                          value=""
                          onValueChange={addBranch}
                          placeholder="Add your favorite engineering branches"
                          searchPlaceholder="Search branches..."
                          className="w-full"
                          disabled={selectedBranches.includes("ALL")}
                        />

                        {selectedBranches.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              🎯 Your Preferences (drag to reorder by priority):
                            </p>
                            <div
                              className={`border-2 rounded-xl p-3 bg-white ${selectedBranches.length > 5 ? "max-h-80 overflow-y-auto" : ""}`}
                            >
                              <DragDropContext onDragEnd={handleBranchDragEnd}>
                                <Droppable droppableId="branches">
                                  {(provided) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className="space-y-2"
                                    >
                                      {selectedBranches.map((branch, index) => (
                                        <Draggable
                                          key={branch}
                                          draggableId={branch}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                            >
                                              <div
                                                {...provided.dragHandleProps}
                                              >
                                                <GripVertical
                                                  size={16}
                                                  className="text-slate-400 hover:text-slate-600"
                                                />
                                              </div>
                                              <span className="text-sm font-bold text-purple-700 bg-white px-2 py-1 rounded-full">
                                                #{index + 1}
                                              </span>
                                              <span className="flex-1 text-sm font-medium text-slate-700">
                                                {branch}
                                              </span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                  removeBranch(branch)
                                                }
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
                            <BookOpen
                              size={32}
                              className="mx-auto mb-2 opacity-50"
                            />
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
                          <span className="text-xs text-slate-500 font-normal ml-2">
                            (Optional)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <SearchableSelect
                          options={availableCities
                            .filter((city) => !selectedCities.includes(city))
                            .map((city) => ({ value: city, label: city }))}
                          value=""
                          onValueChange={addCity}
                          placeholder="Add cities you'd love to study in"
                          searchPlaceholder="Search cities..."
                          className="w-full"
                          disabled={selectedCities.includes("ALL")}
                        />

                        {selectedCities.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                              🗺️ Your Preferences (drag to reorder by priority):
                            </p>
                            <div
                              className={`border-2 rounded-xl p-3 bg-white ${selectedCities.length > 5 ? "max-h-80 overflow-y-auto" : ""}`}
                            >
                              <DragDropContext onDragEnd={handleCityDragEnd}>
                                <Droppable droppableId="cities">
                                  {(provided) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className="space-y-2"
                                    >
                                      {selectedCities.map((city, index) => (
                                        <Draggable
                                          key={city}
                                          draggableId={city}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                            >
                                              <div
                                                {...provided.dragHandleProps}
                                              >
                                                <GripVertical
                                                  size={16}
                                                  className="text-slate-400 hover:text-slate-600"
                                                />
                                              </div>
                                              <span className="text-sm font-bold text-green-700 bg-white px-2 py-1 rounded-full">
                                                #{index + 1}
                                              </span>
                                              <span className="flex-1 text-sm font-medium text-slate-700">
                                                {city}
                                              </span>
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
                            <MapPin
                              size={32}
                              className="mx-auto mb-2 opacity-50"
                            />
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
                      {isUpdatingPreferences
                        ? "Updating..."
                        : "Update Preferences"}
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
                    <Label className="text-sm font-medium text-blue-800">
                      Selected Engineering Branches:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedBranches.length > 0 ? (
                        selectedBranches.map((branch) => (
                          <Badge
                            key={branch}
                            variant="secondary"
                            className="text-xs"
                          >
                            {branch}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-blue-600 italic">
                          No branches selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-blue-800">
                      Preferred Cities:
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCities.length > 0 ? (
                        selectedCities.map((city) => (
                          <Badge
                            key={city}
                            variant="secondary"
                            className="text-xs"
                          >
                            {city}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          ALL
                        </Badge>
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
      {showPreferences &&
        !editingPreferences &&
        selectedBranches.length > 0 &&
        (!hasGeneratedRecommendations ||
          round2Recommendations.length === 0) && (
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGeneratingRecommendations}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl transition-all duration-200 text-white font-bold text-base rounded-xl min-w-[200px]"
              size="default"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {isGeneratingRecommendations
                ? "Generating..."
                : "Generate Round 2 Recommendations"}
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
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Round 2 College Recommendations
            </h3>
            <p className="text-muted-foreground">
              Based on your Round 1 selection and preferences, here are your
              Round 2 options
            </p>
          </div>

          {/* Results Summary and Download */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                Found{" "}
                <span className="font-semibold text-blue-600">
                  {categorizedRecommendations.length}
                </span>{" "}
                college recommendations
                {activeCategory !== "All" && ` in ${activeCategory} category`}
              </p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={!isUnlocked || isPdfGenerating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg min-h-[44px] touch-manipulation"
            >
              <span className="text-sm font-medium">
                {isPdfGenerating
                  ? "Generating..."
                  : isUnlocked
                    ? "Download PDF"
                    : "Unlock to Download"}
              </span>
            </Button>
          </div>

          {/* Recommendations List */}
          {isUnlocked ? (
            <div className="space-y-4">
              {categorizedRecommendations.map((recommendation, index) => {
                // Add debugging and safety checks
                if (
                  !recommendation ||
                  !recommendation.college ||
                  !recommendation.college.name
                ) {
                  console.error("Invalid recommendation data:", recommendation);
                  return null;
                }

                return (
                  <RecommendationCard
                    key={`${recommendation.college?.SJ_Institute_Code || recommendation.college?.id}-${recommendation.course_name}-${index}`}
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
                {categorizedRecommendations
                  .slice(0, 3)
                  .map((recommendation, index) => {
                    if (
                      !recommendation ||
                      !recommendation.college ||
                      !recommendation.college.name
                    ) {
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

              {/* Premium Gate for Round 2 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <PremiumGate
                  onUnlock={() => setIsUnlocked(true)}
                  storageKey="recommendationUnlocked"
                  productType={
                    localStorage.getItem("selected_state") === "Karnataka"
                      ? "karnataka-engineering-recommendations"
                      : "future-bridge"
                  }
                  title="Unlock Round 2 Recommendations"
                  description="Get access to all round recommendations including Round 2 counselling guidance."
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
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Round 2 College Selection
          </h2>
          <p className="text-muted-foreground">
            Search and select the college you received in Round 1 for Round 2
            counselling
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
                  <h3 className="text-lg font-semibold text-gray-800">
                    Create New Round 2 List
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Don't have Round 1 details? Start fresh with a new Round 2
                    recommendation list based on your preferences.
                  </p>
                </div>
                <Button
                  onClick={handleCreateNewList}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New List
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* OR Create New List Option */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-sm text-muted-foreground bg-background px-3">
              OR
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Search Your Round 1 College
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="search-type">Search Type</Label>
                  <Select
                    value={searchType}
                    onValueChange={(value: any) => setSearchType(value)}
                  >
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
                    {searchType === "choice_code"
                      ? "Choice Code"
                      : searchType === "college_name"
                        ? "College Name"
                        : "College Code"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="search-value"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={
                        searchType === "choice_code"
                          ? "Enter choice code (e.g., 211626310 or 1234U)"
                          : searchType === "college_name"
                            ? "Enter college name"
                            : localStorage.getItem("selected_state") ===
                                "Karnataka"
                              ? "Enter college code (e.g., E184)"
                              : "Enter college code (e.g., 1146)"
                      }
                      type={
                        searchType === "college_name" ||
                        (localStorage.getItem("selected_state") ===
                          "Karnataka" &&
                          searchType === "college_code")
                          ? "text"
                          : "number"
                      }
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button onClick={handleSearch} disabled={isSearching}>
                      <Search className="w-4 h-4 mr-2" />
                      {isSearching ? "Searching..." : "Search"}
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
                <Card
                  key={`${college.College_code}-${index}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* College Info */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-foreground">
                              {college.College_Name}
                            </h4>
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
                  <li>
                    <strong>Choice Code:</strong> Use the exact choice code from
                    your Round 1 allotment
                  </li>
                  <li>
                    <strong>College Name:</strong> You can search with partial
                    names
                  </li>
                  <li>
                    <strong>College Code:</strong> Use the official college code
                    from your documents
                  </li>
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
                  <span className="text-sm text-muted-foreground">
                    {selectedCollege.college.College_Name}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">City:</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedCollege.college.City}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">Department:</span>
                  <Badge variant="secondary" className="w-fit">
                    {selectedCollege.selectedDepartment.course_name}
                  </Badge>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium text-sm">
                    {localStorage.getItem("selected_state") === "Karnataka"
                      ? "College Code"
                      : "Choice Code"}
                    :
                  </span>
                  <code className="px-2 py-1 bg-muted rounded text-sm w-fit">
                    {localStorage.getItem("selected_state") === "Karnataka"
                      ? selectedCollege.college.College_code
                      : selectedCollege.selectedDepartment.choice_code}
                  </code>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSelectionDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmSelection}>Confirm Selection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog
        open={showFinalConfirmation}
        onOpenChange={setShowFinalConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm Round 1 College Details?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Based on this selection, your Round 2 recommendation list will be
              generated when you complete the preference settings. This will
              help you find the best available options for your next round of
              counselling.
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
      <AlertDialog
        open={showEditConfirmation}
        onOpenChange={setShowEditConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit your college selection? This will
              reset your current selection and any generated Round 2
              recommendation list will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmEdit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Edit Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Confirmation Dialog */}
      <AlertDialog
        open={showEditConfirmationRecommendation}
        onOpenChange={setShowEditConfirmationRecommendation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Selection?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to edit your Round 2 Recommendation? This
              will reset your current Round 2 Recommendation list and any
              generated Round 2 Recommendation list will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRecommendationConfirmEdit}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Edit Round 2 Recommendation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default Round2Tab;
