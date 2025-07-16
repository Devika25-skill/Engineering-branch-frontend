
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";
import { College } from "@/types/college";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import ChancesCalculationForm from "./ChancesCalculationForm";
import ChancesResultDisplay from "./ChancesResultDisplay";
import { validateInputs, performCalculation, type CalculationPayload } from "./ChancesCalculationLogic";

interface EnhancedCheckChancesButtonProps {
  college: College;
  onChancesCalculated?: (chances: number, cetScore: number, stream: string, category: string) => void;
  variant?: 'default' | 'compact';
}

const EnhancedCheckChancesButton = ({ college, onChancesCalculated, variant = 'default' }: EnhancedCheckChancesButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [cetPercentile, setCetPercentile] = useState<string>("");
  const [selectedStream, setSelectedStream] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("GOPENS");
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [admissionResult, setAdmissionResult] = useState<any>(null);
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();

  // Filter streams that have CET data available (CET > 0)
  const availableStreams = college.departments?.filter(dept => 
    dept.cetPercent && dept.cetPercent > 0
  ).map(dept => dept.name) || [];
  
  const hasStreams = availableStreams.length > 0;

  const handleCalculateClick = () => {
    if (hasStreams) {
      setOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    performCalculationLogic();
  };

  const handleCalculate = async () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    await performCalculationLogic();
  };

  const performCalculationLogic = async () => {
    const cetScore = parseFloat(cetPercentile);
    
    const validation = validateInputs(cetScore, selectedStream);
    if (!validation.isValid) {
      toast({
        title: validation.error?.includes('CET') ? "Invalid Input" : "Stream Required",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const payload: CalculationPayload = {
      sj_institute_id: college.id,
      course_name: selectedStream,
      cet_percentile: cetScore,
      category: selectedCategory
    };

    const result = await performCalculation(payload);
    
    if (result.success) {
      setAdmissionResult(result.data);
      setShowResult(true);
      
      if (onChancesCalculated) {
        onChancesCalculated(result.data.admission_probability, cetScore, selectedStream, selectedCategory);
      }
    } else {
      toast({
        title: result.type === 'category_unavailable' ? "Category Data Not Available" : "Category Data Not Available",
        description: "Please recheck once the data is available for the selected category",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setCetPercentile("");
    setSelectedStream("");
    setSelectedCategory("GOPENS");
    setShowResult(false);
    setAdmissionResult(null);
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

  const disabledButtonClassName = variant === 'compact' 
    ? "text-xs px-3 py-1 h-auto bg-gray-400 text-gray-700 cursor-not-allowed"
    : "w-full bg-gray-400 text-gray-700 cursor-not-allowed";

  return (
    <>
      <div className="space-y-2">
        <Button 
          className={hasStreams ? buttonClassName : disabledButtonClassName}
          disabled={!hasStreams}
          onClick={handleCalculateClick}
        >
          {buttonContent}
        </Button>
        
        {!hasStreams && (
          <p className="text-sm text-gray-600 text-center">
            <AlertCircle className="inline w-4 h-4 mr-1" />
            CET cutoff for this Institute not available. Please recheck once data is available.
          </p>
        )}
      </div>

      <LoginDialog 
        open={loginOpen} 
        onOpenChange={(open) => {
          setLoginOpen(open);
          if (!open && isLoggedIn) {
            handleLoginSuccess();
          }
        }} 
      />

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Calculate Admission Chances
            </DialogTitle>
          </DialogHeader>
          
          {!showResult ? (
            <ChancesCalculationForm
              cetPercentile={cetPercentile}
              setCetPercentile={setCetPercentile}
              selectedStream={selectedStream}
              setSelectedStream={setSelectedStream}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              availableStreams={availableStreams}
              onCalculate={handleCalculate}
              isLoading={isLoading}
              collegeName={college.name}
            />
          ) : (
            <ChancesResultDisplay
              admissionResult={admissionResult}
              onRecalculate={resetForm}
              onClose={() => setOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedCheckChancesButton;
