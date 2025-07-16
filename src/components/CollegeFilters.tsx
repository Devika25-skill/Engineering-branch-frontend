
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, RotateCcw } from "lucide-react";

export interface CollegeFiltersProps {
  cities: string[];
  types: string[];
  streams: string[];
  selectedCity: string;
  selectedType: string;
  selectedStream: string;
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onStreamChange: (stream: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  feesRange: [number, number];
  onFeesRangeChange: (range: [number, number]) => void;
  selectedCities: string[];
  selectedTypes: string[];
  selectedStreams: string[];
  onSelectedCitiesChange: (cities: string[]) => void;
  onSelectedTypesChange: (types: string[]) => void;
  onSelectedStreamsChange: (streams: string[]) => void;
  onClearAllFilters: () => void;
}

const CollegeFilters = ({
  cities,
  types,
  streams,
  selectedCity,
  selectedType,
  selectedStream,
  onCityChange,
  onTypeChange,
  onStreamChange,
  showFilters,
  onToggleFilters,
  feesRange,
  onFeesRangeChange,
  selectedCities,
  selectedTypes,
  selectedStreams,
  onSelectedCitiesChange,
  onSelectedTypesChange,
  onSelectedStreamsChange,
  onClearAllFilters
}: CollegeFiltersProps) => {
  const [localFeesRange, setLocalFeesRange] = useState<[number, number]>(feesRange);

  useEffect(() => {
    setLocalFeesRange(feesRange);
  }, [feesRange]);

  const handleCityToggle = (city: string, checked: boolean) => {
    
    let newSelectedCities;
    if (checked) {
      newSelectedCities = [...selectedCities, city];
    } else {
      newSelectedCities = selectedCities.filter(c => c !== city);
    }
    
    onSelectedCitiesChange(newSelectedCities);
  };

  const handleTypeToggle = (type: string, checked: boolean) => {
    let newSelectedTypes;
    if (checked) {
      newSelectedTypes = [...selectedTypes, type];
    } else {
      newSelectedTypes = selectedTypes.filter(t => t !== type);
    }
    onSelectedTypesChange(newSelectedTypes);
  };

  const handleStreamToggle = (stream: string, checked: boolean) => {
    let newSelectedStreams;
    if (checked) {
      newSelectedStreams = [...selectedStreams, stream];
    } else {
      newSelectedStreams = selectedStreams.filter(s => s !== stream);
    }
    onSelectedStreamsChange(newSelectedStreams);
  };

  const handleFeesChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setLocalFeesRange(newRange);
    onFeesRangeChange(newRange);
  };

  const formatFees = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const handleClearAll = () => {
    onClearAllFilters();
    setLocalFeesRange([0, 1000000]);
  };

  const activeFiltersCount = selectedCities.length + selectedTypes.length + selectedStreams.length;

 

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          onClick={onToggleFilters}
          variant="outline"
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center">
            <Filter className="mr-2" size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </span>
          {showFilters ? <X size={16} /> : <Filter size={16} />}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-4 ${!showFilters ? 'hidden lg:block' : ''}`}>
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Filter className="mr-2" size={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <RotateCcw className="mr-1" size={14} />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fees Range */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Annual Fees Range: {formatFees(localFeesRange[0])} - {formatFees(localFeesRange[1])}
              </Label>
              <Slider
                value={localFeesRange}
                onValueChange={handleFeesChange}
                max={1000000}
                min={0}
                step={25000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹0</span>
                <span>₹10L+</span>
              </div>
            </div>

            {/* Regions */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Regions</Label>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {cities.map((city) => (
                  <div key={city} className="flex items-center space-x-3 py-1 px-2 rounded-md hover:bg-purple-50 transition-colors min-h-[44px] lg:min-h-[36px]">
                    <Checkbox
                      id={`city-${city}`}
                      checked={selectedCities.includes(city)}
                      onCheckedChange={(checked) => handleCityToggle(city, checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={`city-${city}`} 
                      className="text-sm cursor-pointer flex-1 leading-relaxed py-2 lg:py-1"
                    >
                      {city}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* College Types */}
            <div>
              <Label className="text-sm font-medium mb-3 block">College Type</Label>
              <div className="space-y-3">
                {types.map((type) => (
                  <div key={type} className="flex items-center space-x-3 py-1 px-2 rounded-md hover:bg-purple-50 transition-colors min-h-[44px] lg:min-h-[36px]">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={(checked) => handleTypeToggle(type, checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={`type-${type}`} 
                      className="text-sm cursor-pointer flex-1 leading-relaxed py-2 lg:py-1"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Streams */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Engineering Streams</Label>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {streams.map((stream) => (
                  <div key={stream} className="flex items-center space-x-3 py-1 px-2 rounded-md hover:bg-purple-50 transition-colors min-h-[44px] lg:min-h-[36px]">
                    <Checkbox
                      id={`stream-${stream}`}
                      checked={selectedStreams.includes(stream)}
                      onCheckedChange={(checked) => handleStreamToggle(stream, checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor={`stream-${stream}`} 
                      className="text-sm cursor-pointer flex-1 leading-relaxed py-2 lg:py-1"
                    >
                      {stream}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollegeFilters;
