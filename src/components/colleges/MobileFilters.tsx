
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, X } from "lucide-react";
import CollegeFilters, { type CollegeFiltersProps } from "@/components/CollegeFilters";

interface MobileFiltersProps extends Omit<CollegeFiltersProps, 'showFilters' | 'onToggleFilters'> {
  activeFiltersCount: number;
}

const MobileFilters = ({ activeFiltersCount, ...filterProps }: MobileFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle - Only show when no floating button */}
      <div className="lg:hidden mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between h-14 bg-white border-2 border-purple-200 text-base font-medium rounded-xl"
            >
              <span className="flex items-center">
                <Filter className="mr-3" size={18} />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-3 bg-purple-100 text-purple-700 px-2 py-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </span>
              <Filter size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] bg-white z-[100]">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center">
                  <Filter className="mr-3" size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-3 bg-purple-100 text-purple-700">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 p-0"
                >
                  <X size={18} />
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-[calc(90vh-120px)] pb-6">
              <CollegeFilters
                {...filterProps}
                showFilters={true}
                onToggleFilters={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Floating Filter Button - Better mobile positioning */}
      <div className="lg:hidden fixed bottom-6 right-4 z-[60]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              className="rounded-full w-16 h-16 bg-purple-600 hover:bg-purple-700 shadow-2xl border-4 border-white transition-all duration-300 hover:scale-105"
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
          <SheetContent side="bottom" className="h-[90vh] bg-white z-[100]">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center">
                  <Filter className="mr-3" size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-3 bg-purple-100 text-purple-700">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 p-0"
                >
                  <X size={18} />
                </Button>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-[calc(90vh-120px)] pb-6">
              <CollegeFilters
                {...filterProps}
                showFilters={true}
                onToggleFilters={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default MobileFilters;
