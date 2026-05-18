
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Filter } from "lucide-react";

interface NoResultsStateProps {
  searchTerm: string;
  hasActiveFilters: boolean;
  onClearSearch: () => void;
  onClearAllFilters: () => void;
}

const NoResultsState = ({ searchTerm, hasActiveFilters, onClearSearch, onClearAllFilters }: NoResultsStateProps) => {
  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <Search size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Colleges Found</h3>
        
        {hasSearch && (
          <p className="text-gray-600 mb-4">
            No colleges match your search for "<span className="font-medium">{searchTerm}</span>"
            {hasActiveFilters && " with the current filters applied"}.
          </p>
        )}
        
        {!hasSearch && hasActiveFilters && (
          <p className="text-gray-600 mb-4">
            No colleges match the current filter criteria.
          </p>
        )}
        
        {!hasSearch && !hasActiveFilters && (
          <p className="text-gray-600 mb-4">
            No colleges are currently available.
          </p>
        )}

        <div className="space-y-3">
          {hasSearch && (
            <Button 
              variant="outline" 
              onClick={onClearSearch}
              className="w-full sm:w-auto"
            >
              <Search size={16} className="mr-2" />
              Clear Search
            </Button>
          )}
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={onClearAllFilters}
              className="w-full sm:w-auto"
            >
              <RotateCcw size={16} className="mr-2" />
              Clear All Filters
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Try:</strong>
            <br />• Using different search terms
            <br />• Removing some filters
            <br />• Checking spelling and spacing
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoResultsState;
