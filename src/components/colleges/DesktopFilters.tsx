
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, RotateCcw } from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import { CollegeFiltersProps } from "@/components/CollegeFilters";

const DesktopFilters = ({
  cities,
  types,
  streams,
  feesRange,
  onFeesRangeChange,
  selectedCities,
  selectedTypes,
  selectedStreams,
  onSelectedCitiesChange,
  onSelectedTypesChange,
  onSelectedStreamsChange,
  onClearAllFilters
}: Omit<CollegeFiltersProps, 'selectedCity' | 'selectedType' | 'selectedStream' | 'onCityChange' | 'onTypeChange' | 'onStreamChange' | 'showFilters' | 'onToggleFilters'>) => {
  
  const formatFees = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const activeFiltersCount = selectedCities.length + selectedTypes.length + selectedStreams.length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-purple-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2" size={18} />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAllFilters}
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
            Annual Fees Range: {formatFees(feesRange[0])} - {formatFees(feesRange[1])}
          </Label>
          <Slider
            value={feesRange}
            onValueChange={(value) => onFeesRangeChange([value[0], value[1]])}
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

        {/* Filter Dropdowns */}
        <div className="space-y-4">
          <FilterDropdown
            title="Cities"
            items={cities}
            selectedItems={selectedCities}
            onSelectionChange={onSelectedCitiesChange}
            searchPlaceholder="Search cities..."
          />
          
          <FilterDropdown
            title="College Type"
            items={types}
            selectedItems={selectedTypes}
            onSelectionChange={onSelectedTypesChange}
            searchPlaceholder="Search college types..."
          />
          
          <FilterDropdown
            title="Engineering Streams"
            items={streams}
            selectedItems={selectedStreams}
            onSelectionChange={onSelectedStreamsChange}
            searchPlaceholder="Search streams..."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DesktopFilters;
