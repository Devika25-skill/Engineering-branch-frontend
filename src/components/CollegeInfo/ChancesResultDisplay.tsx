
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { categoryMapping } from "./CategoryMapping";

interface AdmissionResult {
  admission_probability: number;
  probability_message: string;
  course_name: string;
  category: string;
  student_cet_percentile: number;
  last_year_cutoff: number;
  cutoff_year: string;
}

interface ChancesResultDisplayProps {
  admissionResult: AdmissionResult;
  onRecalculate: () => void;
  onClose: () => void;
}

const ChancesResultDisplay = ({ admissionResult, onRecalculate, onClose }: ChancesResultDisplayProps) => {
  const getIcon = () => {
    if (admissionResult.admission_probability >= 60) return <CheckCircle className="text-green-600" size={24} />;
    if (admissionResult.admission_probability >= 40) return <AlertCircle className="text-yellow-600" size={24} />;
    return <XCircle className="text-red-600" size={24} />;
  };

  const getChanceColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-blue-600';
    if (probability >= 40) return 'text-yellow-600';
    if (probability >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getIcon()}
        </div>
        <CardTitle className={`text-2xl ${getChanceColor(admissionResult.admission_probability)}`}>
          {admissionResult.admission_probability}%
        </CardTitle>
        <p className="text-sm text-gray-600">
          {admissionResult.probability_message}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Stream:</span>
            <div className="font-semibold text-right">{admissionResult.course_name}</div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <div className="font-semibold text-right">{categoryMapping[admissionResult.category as keyof typeof categoryMapping]}</div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your CET:</span>
            <div className="font-semibold text-right">{admissionResult.student_cet_percentile}%ile</div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Year Cutoff:</span>
            <div className="font-semibold text-right">{admissionResult.last_year_cutoff.toFixed(2)}%ile ({admissionResult.cutoff_year})</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRecalculate} className="flex-1">
            Recalculate
          </Button>
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChancesResultDisplay;
