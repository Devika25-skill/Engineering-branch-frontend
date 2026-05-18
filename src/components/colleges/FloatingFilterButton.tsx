import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X, Search } from "lucide-react";
import CollegeFilters, { type CollegeFiltersProps } from "@/components/CollegeFilters";

interface FloatingFilterButtonProps extends Omit<CollegeFiltersProps, 'showFilters' | 'onToggleFilters'> {
  activeFiltersCount: number;
  isVisible: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const FloatingFilterButton = ({ 
  activeFiltersCount, 
  isVisible,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  ...filterProps 
}: FloatingFilterButtonProps) => {
  const [open, setOpen] = useState(false);

  // if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-4 z-[100] lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className="rounded-full w-16 h-16 bg-purple-600 hover:bg-purple-700 shadow-2xl border-4 border-white transition-all duration-300 hover:scale-105 active:scale-95"
            size="icon"
          >
            <Filter size={22} className="text-white" />
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold border-3 border-white shadow-lg">
                {activeFiltersCount > 9 ? '9+' : activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[92vh] bg-white z-[150] rounded-t-2xl">
          <SheetHeader className="pb-6 border-b">
            <SheetTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center">
                <Filter className="mr-3" size={20} />
                Search & Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-3 bg-purple-100 text-purple-700 px-2 py-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6 overflow-y-auto h-[calc(92vh-140px)] pb-6">
            {/* Search Section */}
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-4 flex items-center text-lg">
                <Search className="mr-2" size={18} />
                Search
              </h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search colleges, cities, or streams..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 py-4 text-base border-2 border-purple-200 focus:border-purple-400 rounded-xl bg-white h-14"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            </div>

            {/* Sort Section */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-4 text-lg">Sort By</h3>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-full border-2 border-blue-200 bg-white h-14 text-base rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-white border-2 border-gray-200 shadow-2xl">
                  <SelectItem value="cetCutoff" className="text-base py-3">Highest CET Cutoff</SelectItem>
                  <SelectItem value="rating" className="text-base py-3">Highest Rated</SelectItem>
                  <SelectItem value="name" className="text-base py-3">Name (A-Z)</SelectItem>
                  <SelectItem value="fees" className="text-base py-3">Lowest Fees</SelectItem>
                  <SelectItem value="placement" className="text-base py-3">Best Placement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <CollegeFilters
                {...filterProps}
                showFilters={true}
                onToggleFilters={() => setOpen(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FloatingFilterButton;
