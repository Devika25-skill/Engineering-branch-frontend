
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { College } from "@/types/college";
import { calculateAdmissionProbability, getAdmissionChanceColor, getAdmissionChanceLabel } from "@/utils/admissionCalculator";

interface CheckChancesButtonProps {
  college: College;
  onChancesCalculated?: (chances: number, cetScore: number, twelfthScore: number) => void;
  onAdmissionCalculated?: (chance: number, cetScore: number, twelfthScore: number) => void;
  variant?: 'default' | 'compact';
}

const CheckChancesButton = ({ college, onChancesCalculated, onAdmissionCalculated, variant = 'default' }: CheckChancesButtonProps) => {
  const [open, setOpen] = useState(false);
  const [cetPercentile, setCetPercentile] = useState<string>("");
  const [twelfthPercentage, setTwelfthPercentage] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [admissionChance, setAdmissionChance] = useState<number>(0);

  const handleCalculate = () => {
    const cetScore = parseFloat(cetPercentile);
    const twelfthScore = parseFloat(twelfthPercentage);
    
    if (isNaN(cetScore) || isNaN(twelfthScore) || cetScore < 0 || cetScore > 100 || twelfthScore < 0 || twelfthScore > 100) {
      alert("Please enter valid percentages between 0 and 100");
      return;
    }

    // Get college cutoff range
    const minCutoff = college.cetCutoffRange?.min || college.cutoff_percentile || 50;
    const maxCutoff = college.cetCutoffRange?.max || college.cutoff_percentile || 80;

    const probability = calculateAdmissionProbability({
      cetPercentile: cetScore,
      twelfthPercentage: twelfthScore,
      collegeMinCutoff: minCutoff,
      collegeMaxCutoff: maxCutoff,
      collegeType: college.type
    });

    setAdmissionChance(probability);
    setShowResult(true);
    
    // Notify parent component about calculated chances
    if (onChancesCalculated) {
      onChancesCalculated(probability, cetScore, twelfthScore);
    }
    if (onAdmissionCalculated) {
      onAdmissionCalculated(probability, cetScore, twelfthScore);
    }
  };

  const resetForm = () => {
    setCetPercentile("");
    setTwelfthPercentage("");
    setShowResult(false);
    setAdmissionChance(0);
  };

  const getIcon = () => {
    if (admissionChance >= 60) return <CheckCircle className="text-green-600" size={24} />;
    if (admissionChance >= 40) return <AlertCircle className="text-yellow-600" size={24} />;
    return <XCircle className="text-red-600" size={24} />;
  };

  const buttonContent = variant === 'compact' ? (
    <>
      <Calculator size={14} className="mr-1" />
      Recalculate
    </>
  ) : (
    <>
      <Calculator size={16} className="mr-2" />
      Check My Chances
    </>
  );

  const buttonClassName = variant === 'compact' 
    ? "text-xs px-3 py-1 h-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md"
    : "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          {buttonContent}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Calculate Admission Chances
          </DialogTitle>
        </DialogHeader>
        
        {!showResult ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter your academic details to calculate your admission probability for {college.name}
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="cet">MH-CET Percentile</Label>
                <Input
                  id="cet"
                  type="number"
                  placeholder="Enter your CET percentile (0-100)"
                  value={cetPercentile}
                  onChange={(e) => setCetPercentile(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <Label htmlFor="twelfth">12th Grade Percentage</Label>
                <Input
                  id="twelfth"
                  type="number"
                  placeholder="Enter your 12th percentage (0-100)"
                  value={twelfthPercentage}
                  onChange={(e) => setTwelfthPercentage(e.target.value)}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Minimum 50% required for eligibility
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>College Cutoff Range:</strong> {' '}
                {college.cetCutoffRange 
                  ? `${college.cetCutoffRange.min} - ${college.cetCutoffRange.max} (${college.cetCutoffRange.year})`
                  : `${college.cutoff_percentile}%ile`
                }
              </p>
            </div>
            
            <Button 
              onClick={handleCalculate} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Calculate Chances
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {getIcon()}
              </div>
              <CardTitle className={`text-2xl ${getAdmissionChanceColor(admissionChance)}`}>
                {admissionChance}%
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getAdmissionChanceLabel(admissionChance)} Chance of Admission
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Your CET:</span>
                  <div className="font-semibold">{cetPercentile}%ile</div>
                </div>
                <div>
                  <span className="text-gray-600">Your 12th:</span>
                  <div className="font-semibold">{twelfthPercentage}%</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Calculation Method:</p>
                <p className="text-sm font-medium">
                  Based primarily on CET score vs college cutoff. 12th marks used for eligibility (≥50% required).
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Recalculate
                </Button>
                <Button onClick={() => setOpen(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckChancesButton;
