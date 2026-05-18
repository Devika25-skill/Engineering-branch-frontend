
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const RecommendationDisclaimer = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-sm font-medium">
        <strong>Important Disclaimer:</strong> These college recommendations are based on previous year's Round 1 cutoffs and your provided information. 
        Please verify all details including current cutoffs, fees, course availability, and admission requirements 
        directly with the respective institutions before submitting your application forms.
      </AlertDescription>
    </Alert>
  );
};
