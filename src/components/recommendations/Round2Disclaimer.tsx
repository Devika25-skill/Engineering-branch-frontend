import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const Round2Disclaimer = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm font-medium">
        <strong>Important Disclaimer:</strong> These Round 2 college recommendations are based on previous year's Round 2 cutoff data and your provided information. 
        Actual cutoffs may vary this year due to factors like seat availability, category-wise distribution, and overall competition. 
        Please verify all details including current cutoffs, fees, course availability, and admission requirements 
        directly with the respective institutions before finalizing your preferences.
      </AlertDescription>
    </Alert>
  );
};