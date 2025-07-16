import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Building, IndianRupee, GraduationCap, TrendingUp, Trophy, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import CollegeFilters from "@/components/CollegeFilters";
import FloatingFilterButton from "@/components/colleges/FloatingFilterButton";
import DesktopFilters from "@/components/colleges/DesktopFilters";
import CollegeLoadingState from "@/components/colleges/CollegeLoadingState";
import CollegeErrorState from "@/components/colleges/CollegeErrorState";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useColleges } from "@/hooks/useColleges";
import { useDebounce } from "@/hooks/useDebounce";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { sessionStorageService } from '@/services/sessionStorage';
import NoResultsState from "@/components/colleges/NoResultsState";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useFeedbackTimer } from "@/hooks/useFeedbackTimer";

const Colleges = () => {
  const [searchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';
  const isOnline = useOnlineStatus();
  const { showFeedback, handleClose, handleSkipSession } = useFeedbackTimer();
  
  // Initialize state - URL search takes precedence over session storage
  const [searchTerm, setSearchTerm] = useState(() => {
    if (urlSearchTerm) {
      return urlSearchTerm;
    }
    const savedFilters = sessionStorageService.getFilters();
    return savedFilters?.searchTerm || '';
  });
  
  const [selectedCities, setSelectedCities] = useState<string[]>(() => {
    const savedFilters = sessionStorageService.getFilters();
    return savedFilters?.selectedCities || [];
  });
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const savedFilters = sessionStorageService.getFilters();
    return savedFilters?.selectedTypes || [];
  });
  
  const [selectedStreams, setSelectedStreams] = useState<string[]>(() => {
    const savedFilters = sessionStorageService.getFilters();
    return savedFilters?.selectedStreams || [];
  });
  
  const [feesRange, setFeesRange] = useState<[number, number]>(() => {
    const savedFilters = sessionStorageService.getFilters();
    return savedFilters?.feesRange || [0, 1000000];
  });
  
  const [sortBy, setSortBy] = useState<string>("cetCutoff");

  // Keep legacy single-select states for backwards compatibility
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStream, setSelectedStream] = useState<string>("");

  // Update search term when URL parameter changes
  useEffect(() => {
    if (urlSearchTerm && urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: colleges = [], isLoading, error, refetch } = useColleges();

  // Force reload with region data - clear cache on first load if no regions available
  useEffect(() => {
    const hasRegionData = colleges.some(college => college.region);
    if (colleges.length > 0 && !hasRegionData) {
      sessionStorageService.clearCache();
      refetch();
    }
  }, [colleges, refetch]);

  // Save filters to session storage whenever they change
  useEffect(() => {
    sessionStorageService.setFilters({
      selectedCities,
      selectedTypes,
      selectedStreams,
      feesRange,
      searchTerm: debouncedSearchTerm
    });
  }, [selectedCities, selectedTypes, selectedStreams, feesRange, debouncedSearchTerm]);

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      const collegeName = college.name || '';
      const collegeCity = college.city || '';
      const collegeStreams = college.streams || [];
      
      const matchesSearch = !debouncedSearchTerm || 
        collegeName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        collegeCity.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        collegeStreams.some(stream => stream && stream.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const collegeRegion = college.region || '';
      const matchesCity = selectedCities.length === 0 || selectedCities.includes(collegeRegion);
      const collegeType = college.college_type || '';
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(collegeType);
      const matchesStream = selectedStreams.length === 0 || 
        collegeStreams.some(stream => stream && selectedStreams.includes(stream));
      
      const collegeFees = college.feesRange ? college.feesRange.min : (college.fees || 0);
      const matchesFees = collegeFees >= feesRange[0] && collegeFees <= feesRange[1];
      
      return matchesSearch && matchesCity && matchesType && matchesStream && matchesFees;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return (a.name || '').localeCompare(b.name || '');
        case "fees":
          const aFees = a.feesRange ? a.feesRange.min : (a.fees || 0);
          const bFees = b.feesRange ? b.feesRange.min : (b.fees || 0);
          return aFees - bFees;
        case "placement":
          const aPlacement = a.placementRange ? a.placementRange.max : (a.placement || 0);
          const bPlacement = b.placementRange ? b.placementRange.max : (b.placement || 0);
          return bPlacement - aPlacement;
        case "cetCutoff":
          const aCutoff = a.cetCutoffRange ? a.cetCutoffRange.max : (a.cutoff_percentile || 0);
          const bCutoff = b.cetCutoffRange ? b.cetCutoffRange.max : (b.cutoff_percentile || 0);
          return bCutoff - aCutoff;
        default:
          return 0;
      }
    });

    return filtered;
  }, [colleges, debouncedSearchTerm, selectedCities, selectedTypes, selectedStreams, feesRange, sortBy]);

  // Show floating filter when search is empty OR when there are results
  const showFloatingFilter = true;

  const formatCollegeType = (type: string | null) => {
    if (!type) return '-';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const regions = [...new Set(colleges.map(college => college.region).filter(Boolean))].sort() as string[];
  const types = [...new Set(colleges.map(college => college.college_type).filter(Boolean))].sort() as string[];
  const streams = [...new Set(colleges.flatMap(college => college.streams || []).filter(Boolean))].sort() as string[];

  const removeFilter = (type: 'city' | 'type' | 'stream', value: string) => {
    switch (type) {
      case 'city':
        setSelectedCities(prev => prev.filter(c => c !== value));
        break;
      case 'type':
        setSelectedTypes(prev => prev.filter(t => t !== value));
        break;
      case 'stream':
        setSelectedStreams(prev => prev.filter(s => s !== value));
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedCities([]);
    setSelectedTypes([]);
    setSelectedStreams([]);
    setFeesRange([0, 1000000]);
    setSearchTerm('');
    sessionStorageService.clearFilters();
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const activeFilters = [
    ...selectedCities.map(city => ({ type: 'city' as const, value: city, label: city })),
    ...selectedTypes.map(type => ({ type: 'type' as const, value: type, label: type })),
    ...selectedStreams.map(stream => ({ type: 'stream' as const, value: stream, label: stream }))
  ];

  const handleRetry = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <CollegeErrorState onRetry={handleRetry} isOffline={!isOnline} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex flex-col">
        <Navigation />
        
        {/* Desktop Header with Search - Only show on desktop */}
        <div className="sticky top-0 z-40 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 border-b border-purple-100 shadow-sm hidden lg:block">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="flex flex-col gap-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search colleges, cities, or streams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-base md:text-lg border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                  />
                </div>
              </div>

              {/* Desktop Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-700">Active Filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-purple-100 text-purple-700 pr-1 text-xs"
                      >
                        {filter.label}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-purple-200"
                          onClick={() => removeFilter(filter.type, filter.value)}
                        >
                          <X size={10} />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 text-xs ml-auto"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">
                    {isLoading ? 'Loading...' : `${filteredAndSortedColleges.length} engineering colleges found`}
                  </h2>
                </div>
                
                <div className="w-full md:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-48 border-2 border-purple-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cetCutoff">Highest CET Cutoff</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="fees">Lowest Fees</SelectItem>
                      <SelectItem value="placement">Best Placement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Active Filters - Only show when search is active */}
        {!showFloatingFilter && activeFilters.length > 0 && (
          <div className="lg:hidden bg-white/90 backdrop-blur-sm mx-4 mt-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-700">Active:</span>
              <div className="flex flex-wrap gap-2">
                {activeFilters.slice(0, 3).map((filter, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-700 pr-1 text-xs"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 hover:bg-purple-200"
                      onClick={() => removeFilter(filter.type, filter.value)}
                    >
                      <X size={10} />
                    </Button>
                  </Badge>
                ))}
                {activeFilters.length > 3 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    +{activeFilters.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0">
          <div className="container mx-auto px-4 flex gap-6 h-full">
            {/* Desktop Sidebar Filters */}
            <div className="lg:w-1/4 flex-shrink-0 hidden lg:block">
              <div className="sticky top-6 h-fit max-h-[calc(100vh-12rem)] overflow-y-auto">
                 <DesktopFilters
                   cities={regions}
                   types={types}
                   streams={streams}
                  feesRange={feesRange}
                  onFeesRangeChange={setFeesRange}
                  selectedCities={selectedCities}
                  selectedTypes={selectedTypes}
                  selectedStreams={selectedStreams}
                  onSelectedCitiesChange={setSelectedCities}
                  onSelectedTypesChange={setSelectedTypes}
                  onSelectedStreamsChange={setSelectedStreams}
                  onClearAllFilters={clearAllFilters}
                />
              </div>
            </div>

            {/* Scrollable College Cards Area */}
            <div className="flex-1 lg:w-3/4 min-h-0">
              <div className="h-full overflow-y-auto py-6 pr-2">
                {isLoading ? (
                  <CollegeLoadingState />
                ) : filteredAndSortedColleges.length === 0 ? (
                  <NoResultsState 
                    searchTerm={debouncedSearchTerm}
                    hasActiveFilters={activeFilters.length > 0}
                    onClearSearch={clearSearch}
                    onClearAllFilters={clearAllFilters}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                    {filteredAndSortedColleges.map((college) => {
                      const collegeStreams = college.streams || [];
                      const collegeFees = college.feesRange ? college.feesRange : { min: college.fees || null, max: college.fees || null };
                      const placementRange = college.placementRange || { min: college.placement || null, max: college.placement || null };
                      const cetCutoffRange = college.cetCutoffRange;
                      
                      return (
                        <Link key={college.id} to={`/college/${college.id}`}>
                          <Card className="group bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                            <CardContent className="p-4">
                              <div className="flex gap-3 mb-3">
                                <img
                                  src={`/img/${college.id}.png`|| "/placeholder.svg"}
                                  alt={`${college.name || 'College'} logo`}
                                  className="w-12 h-12 rounded-lg object-contain bg-gradient-to-br from-purple-50 to-pink-50 p-2 shadow-sm flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                    {college.name || '-'}
                                  </h3>
                                  <div className="flex items-center text-gray-600 mb-2">
                                    <MapPin size={12} className="mr-1 text-purple-500 flex-shrink-0" />
                                    <span className="text-xs">{college.city || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                      <Building size={10} className="mr-1" />
                                      {formatCollegeType(college.college_type)}
                                    </Badge>
                                    <div className="flex items-center">
                                      <Star size={12} className="mr-1 text-yellow-500 fill-current" />
                                      <span className="text-xs font-semibold">{college.rating || '-'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg border border-green-100">
                                  <div className="flex items-center mb-1">
                                    <IndianRupee size={12} className="mr-1 text-green-600" />
                                    <span className="text-green-600 font-medium">Fees</span>
                                  </div>
                                  <div className="font-bold text-green-700">
                                    {collegeFees.min && collegeFees.max
                                      ? (collegeFees.min === collegeFees.max
                                        ? `₹${(collegeFees.min / 100000).toFixed(1)}L`
                                        : `₹${(collegeFees.min / 100000).toFixed(1)}-${(collegeFees.max / 100000).toFixed(1)}L`)
                                      : '-'
                                    }
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-2 rounded-lg border border-blue-100">
                                  <div className="flex items-center mb-1">
                                    <GraduationCap size={12} className="mr-1 text-blue-600" />
                                    <span className="text-blue-600 font-medium">Courses</span>
                                  </div>
                                  <div className="font-bold text-blue-700">
                                    {collegeStreams.length ? `${collegeStreams.length} Streams` : '-'}
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-2 rounded-lg border border-emerald-100">
                                  <div className="flex items-center mb-1">
                                    <TrendingUp size={12} className="mr-1 text-emerald-600" />
                                    <span className="text-emerald-600 font-medium">Placement</span>
                                  </div>
                                  <div className="font-bold text-emerald-700">
                                    {placementRange.min !== null || placementRange.max !== null
                                      ? (placementRange.min === placementRange.max
                                        ? `${placementRange.min || 0}%`
                                        : `${placementRange.min || 0}-${placementRange.max || 0}%`)
                                      : '-'
                                    }
                                  </div>
                                </div>

                                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-2 rounded-lg border border-orange-100">
                                  <div className="flex items-center mb-1">
                                    <Trophy size={12} className="mr-1 text-orange-600" />
                                    <span className="text-orange-600 font-medium">CET Cutoff</span>
                                  </div>
                                  <div className="font-bold text-orange-700">
                                    {cetCutoffRange && cetCutoffRange.min && cetCutoffRange.max
                                      ? `${cetCutoffRange.min} - ${cetCutoffRange.max}`
                                      : (college.cutoff_percentile ? `${college.cutoff_percentile}%ile` : '-')
                                    }
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="container mx-auto px-4 py-8">
          <FeedbackSection />
        </div>

        {/* Floating Filter Button for Mobile */}
         <FloatingFilterButton
           cities={regions}
           types={types}
           streams={streams}
          selectedCity={selectedCity}
          selectedType={selectedType}
          selectedStream={selectedStream}
          onCityChange={setSelectedCity}
          onTypeChange={setSelectedType}
          onStreamChange={setSelectedStream}
          feesRange={feesRange}
          onFeesRangeChange={setFeesRange}
          selectedCities={selectedCities}
          selectedTypes={selectedTypes}
          selectedStreams={selectedStreams}
          onSelectedCitiesChange={setSelectedCities}
          onSelectedTypesChange={setSelectedTypes}
          onSelectedStreamsChange={setSelectedStreams}
          onClearAllFilters={clearAllFilters}
          activeFiltersCount={activeFilters.length}
          isVisible={showFloatingFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Feedback Dialog */}
        <FeedbackDialog
          isOpen={showFeedback}
          onClose={handleClose}
          onSkipSession={handleSkipSession}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Colleges;
