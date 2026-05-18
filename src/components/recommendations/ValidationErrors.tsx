
import { AlertTriangle } from "lucide-react";

interface ValidationErrorsProps {
  errors: string[];
}

const ValidationErrors = ({ errors }: ValidationErrorsProps) => {
  if (errors.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
      <div className="flex items-center">
        <AlertTriangle className="text-red-400 mr-3" size={20} />
        <h3 className="text-red-800 font-bold">Missing Required Information</h3>
      </div>
      <p className="text-red-700 mt-2">
        Please provide: {errors.join(', ')}
      </p>
    </div>
  );
};

export default ValidationErrors;
