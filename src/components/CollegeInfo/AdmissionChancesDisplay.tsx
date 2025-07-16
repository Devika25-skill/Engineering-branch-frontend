
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Calculator } from "lucide-react";
import { getAdmissionChanceColor, getAdmissionChanceLabel } from "@/utils/admissionCalculator";
import CheckChancesButton from "./CheckChancesButton";

interface AdmissionChancesDisplayProps {
  admissionChance: number;
  cetScore: number;
  twelfthScore: number;
  collegeName: string;
  onRecalculate?: (chance: number, cetScore: number, twelfthScore: number) => void;
}

const AdmissionChancesDisplay = ({ admissionChance, cetScore, twelfthScore, collegeName, onRecalculate }: AdmissionChancesDisplayProps) => {
  const [showRecalculate, setShowRecalculate] = useState(false);

  const getIcon = () => {
    if (admissionChance >= 60) return <CheckCircle className="text-green-600" size={20} />;
    if (admissionChance >= 40) return <AlertCircle className="text-yellow-600" size={20} />;
    return <XCircle className="text-red-600" size={20} />;
  };

  const handleRecalculated = (newChance: number, newCetScore: number, newTwelfthScore: number) => {
    setShowRecalculate(false);
    if (onRecalculate) {
      onRecalculate(newChance, newCetScore, newTwelfthScore);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            Your Admission Chances
          </div>
          <CheckChancesButton 
            college={{ name: collegeName } as any} 
            onAdmissionCalculated={handleRecalculated}
            variant="compact"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className={`text-2xl font-bold ${getAdmissionChanceColor(admissionChance)}`}>
              {admissionChance}%
            </span>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {getAdmissionChanceLabel(admissionChance)} Chance
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/70 p-2 rounded">
            <span className="text-gray-600">Your CET:</span>
            <div className="font-semibold">{cetScore}%ile</div>
          </div>
          <div className="bg-white/70 p-2 rounded">
            <span className="text-gray-600">Your 12th:</span>
            <div className="font-semibold">{twelfthScore}%</div>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mt-2">
          Based on your CET score and {collegeName}'s historical cutoffs
        </p>
      </CardContent>
    </Card>
  );
};

export default AdmissionChancesDisplay;
