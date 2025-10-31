import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Search, MapPin, Users, TrendingUp, Building, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Link, useNavigate } from 'react-router-dom';
import { backgroundLoader } from '@/services/backgroundLoader';
import { sessionStorageService } from '@/services/sessionStorage';
import { ProgramSelectionDialog } from '@/components/common/ProgramSelectionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

// Remove All the applied filters on Coming back to home
  useEffect(() => {
    if(!isLoggedIn){
      localStorage.removeItem('recommendation_type');
      localStorage.removeItem('integrated_admission_type');
    }
    sessionStorageService.clearFilters();
    
  }, []);

  // Load college data in background when component mounts
  useEffect(() => {
    backgroundLoader.loadCollegeData();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/colleges?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/colleges');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRecommendationTypeSelect = (type: 'first-year' | 'direct-second-year') => {
    // Store the selected type for future reference
    localStorage.setItem('recommendation_type', type);
    
    if (type === 'first-year') {
      const hasExistingData = sessionStorage.getItem('recommendationFormData');
      navigate(hasExistingData ? '/recommendations/results' : '/recommendations/steps');
    } else {
      const hasExistingData = sessionStorage.getItem('cachedDiplomaRecommendations');
      navigate(hasExistingData ? '/diploma-recommendations/results' : '/diploma-recommendations/steps');
    }
  };

  const handleGetRecommendations = () => {
    
    // Check saved preference and navigate accordingly
    const savedRecommendationType = localStorage.getItem('recommendation_type');
    const savedIntegratedType = localStorage.getItem('integrated_admission_type');
    

    
    if (savedRecommendationType === 'direct-second-year') {
      const hasExistingData = sessionStorage.getItem('cachedDiplomaRecommendations');
      navigate(hasExistingData ? '/diploma-recommendations/results' : '/diploma-recommendations/steps');
    } else if (savedRecommendationType === 'first-year') {
      navigate('/recommendations');
    } else if (savedIntegratedType) {
      navigate(`/integrated-rounds?type=${savedIntegratedType}`);
    } else {
      // No preference saved, show dialog
      setShowProgramDialog(true);
    }
  };

  const handleProgramSelect = (program: string) => {
    switch (program) {
      case 'first-year':
      case 'direct-second-year':
        localStorage.setItem('recommendation_type', program);
        localStorage.removeItem('integrated_admission_type');
        handleRecommendationTypeSelect(program as 'first-year' | 'direct-second-year');
        break;
      
      case 'BCA_MCA_Int':
        localStorage.setItem('integrated_admission_type', program);
        localStorage.removeItem('recommendation_type');
        setTimeout(() => {
          navigate(`/integrated-steps?type=BCA_MCA_Int`);
        }, 50);
        break;
      
      case 'BBA_BMS_BBM_MBA_Int':
        localStorage.setItem('integrated_admission_type', program);
        localStorage.removeItem('recommendation_type');
        setTimeout(() => {
          navigate(`/integrated-steps?type=BBA_BMS_BBM_MBA_Int`);
        }, 50);
        break;
      
      case 'B_and_D_Pharmacy':
        localStorage.setItem('integrated_admission_type', program);
        localStorage.removeItem('recommendation_type');
        setTimeout(() => {
          navigate(`/integrated-steps?type=B_and_D_Pharmacy`);
        }, 50);
        break;
      
      case 'First_Year_Medical':
        localStorage.setItem('integrated_admission_type', program);
        localStorage.removeItem('recommendation_type');
        setTimeout(() => {
          navigate(`/integrated-steps?type=First_Year_Medical`);
        }, 50);
        break;
      
      default:
        console.error('Unknown program type:', program);
        break;
    }
  };

  // Check if user has any saved program selection
  const hasSavedSelection = () => {
    const savedRecommendationType = localStorage.getItem('recommendation_type');
    const savedIntegratedType = localStorage.getItem('integrated_admission_type');
    return !!(savedRecommendationType || savedIntegratedType);
  };

  const handleChangeType = () => {
    localStorage.removeItem('recommendation_type');
    localStorage.removeItem('integrated_admission_type');
    setShowProgramDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 text-white py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full animate-bounce animation-delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-10 h-10 sm:w-16 sm:h-16 bg-white rounded-full animate-bounce animation-delay-2000"></div>
          <div className="absolute bottom-32 right-1/3 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full animate-bounce animation-delay-3000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <GraduationCap size={60} className="sm:w-20 sm:h-20 text-yellow-300 animate-pulse" />
                <Sparkles size={24} className="sm:w-8 sm:h-8 absolute -top-2 -right-2 text-pink-300 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent leading-tight">
              Find Your Dream
              <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 text-yellow-300">College! 🎓</span>
              <span className="block text-sm sm:text-4xl md:text-5xl lg:text-6xl mt-2 text-white-300">Engineering, BCA, BBA, B-Pharmacy</span>

            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 font-light max-w-3xl mx-auto px-2">
              Discover the perfect engineering college that matches your dreams, budget, and career goals with our 
              <span className="font-bold text-yellow-300"> smart recommendation engine!</span>
            </p>
          </div>

          {/* Mobile-Optimized Search */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6 animate-fade-in animation-delay-300 px-2">
            <div className="flex flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search colleges or cities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg text-gray-800 bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-xl focus:border-yellow-300 focus:ring-4 focus:ring-yellow-300/20 shadow-xl placeholder:text-gray-500"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Search size={18} className="sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fade-in animation-delay-500 px-2">
            <Button 
              onClick={handleGetRecommendations}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="mr-2" size={18} />
              Get AI Recommended CET List ✨
            </Button>
            
            {/* Reset button for logged-in users with saved selections */}
            {isLoggedIn && hasSavedSelection() && (
              <Button 
                onClick={handleChangeType}
                variant="outline"
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <GraduationCap className="mr-2" size={18} />
                Change Program Type
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Stats Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16">
          <div className="text-center animate-fade-in">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-2 sm:mb-3">
              <Building className="text-purple-600" size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">300+</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">Engineering Colleges</p>
          </div>
          <div className="text-center animate-fade-in animation-delay-200">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-2 sm:mb-3">
              <GraduationCap className="text-pink-600" size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">12+</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">Engineering Branches</p>
          </div>
          <div className="text-center animate-fade-in animation-delay-400">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-2 sm:mb-3">
              <MapPin className="text-indigo-600" size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">20+</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">Cities Covered</p>
          </div>
          <div className="text-center animate-fade-in animation-delay-600">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-2 sm:mb-3">
              <Users className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">50K+</h3>
            <p className="text-gray-600 font-medium text-xs sm:text-sm">Students Helped</p>
          </div>
        </div>

        {/* Mobile-Optimized Features Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
            Why Choose SkillJourney FutureBridge?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Your trusted partner in finding the perfect engineering college
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">AI-Powered Matching</h3>
            <p className="text-gray-600 text-sm">
              Our smart algorithm analyzes your profile and preferences to recommend the best colleges for you
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <TrendingUp className="text-pink-600" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Updated Data</h3>
            <p className="text-gray-600 text-sm">
              Real-time information on placements, fees, cutoffs, and admission criteria from official sources
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Users className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Expert Guidance</h3>
            <p className="text-gray-600 text-sm">
              Comprehensive college profiles with detailed information to help you make informed decisions
            </p>
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-12 px-2">
          <Link to="/colleges">
            <Button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Building className="mr-2" size={18} />
              Explore All Colleges
            </Button>
          </Link>
        </div>
      </div>

      <ProgramSelectionDialog
        open={showProgramDialog}
        onOpenChange={setShowProgramDialog}
        onSelectProgram={handleProgramSelect}
      />
    </div>
  );
};

export default Index;
