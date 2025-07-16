
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const NoResultsState = () => {
  return (
    <div className="text-center py-12">
      <div className="mb-4">
        <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recommendations Found</h3>
        <p className="text-gray-600 text-lg mb-4">
          We couldn't find colleges matching your preferred streams with available cutoff data.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>Suggestions:</strong>
            <br />• Try selecting different engineering streams
            <br />• Consider expanding your preferred cities
            <br />• Check if your CET percentile is entered correctly
          </p>
        </div>
      </div>
      <Link to="/recommendations">
        <Button className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Modify Your Preferences
        </Button>
      </Link>
    </div>
  );
};
