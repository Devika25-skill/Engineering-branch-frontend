import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const DiplomaRecommendationDisclaimer = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm font-medium">
        <strong>Important Disclaimer:</strong> These Direct Second Year Engineering recommendations are based on previous year's cutoffs and your provided information. 
        Please verify all details including current cutoffs, fees, course availability, and admission requirements 
        directly with the respective institutions before submitting your application forms.
      </AlertDescription>
    </Alert>
  );
};