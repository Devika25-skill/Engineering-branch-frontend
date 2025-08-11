import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Award, Settings, CheckCircle2 } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { BranchesForm } from '@/components/integrated/BranchesForm';
import { CitiesForm } from '@/components/integrated/CitiesForm';
import Navigation from '@/components/Navigation';

const IntegratedRounds = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [admissionType, setAdmissionType] = useState<IntegratedAdmissionType | null>(null);
  const [activeTab, setActiveTab] = useState('round1');
  
  // Round 1 preferences
  const [round1Branches, setRound1Branches] = useState<string[]>([]);
  const [round1Cities, setRound1Cities] = useState<string[]>([]);
  const [round1Submitted, setRound1Submitted] = useState(false);
  
  // Round 2 preferences (includes previous round allotted colleges)
  const [round2Branches, setRound2Branches] = useState<string[]>([]);
  const [round2Cities, setRound2Cities] = useState<string[]>([]);
  const [round2Submitted, setRound2Submitted] = useState(false);
  
  // Round 3 preferences (includes previous rounds allotted colleges)
  const [round3Branches, setRound3Branches] = useState<string[]>([]);
  const [round3Cities, setRound3Cities] = useState<string[]>([]);
  const [round3Submitted, setRound3Submitted] = useState(false);

  useEffect(() => {
    const typeFromParams = searchParams.get('type') as IntegratedAdmissionType;
    const typeFromStorage = localStorage.getItem('integrated_admission_type') as IntegratedAdmissionType;
    
    const finalType = typeFromParams || typeFromStorage;
    
    if (!finalType || !['BCA_MCA_Int', 'BBA_BMS_BBM_MBA_Int', 'B_and_D_Pharmacy'].includes(finalType)) {
      navigate('/');
      return;
    }
    
    setAdmissionType(finalType);
    
    // Load saved preferences
    loadSavedPreferences(finalType);
  }, [searchParams, navigate]);

  const loadSavedPreferences = (type: IntegratedAdmissionType) => {
    // Load Round 1 preferences
    const round1Data = localStorage.getItem(`integrated_round1_${type}`);
    if (round1Data) {
      const parsed = JSON.parse(round1Data);
      setRound1Branches(parsed.branches || []);
      setRound1Cities(parsed.cities || []);
      setRound1Submitted(true);
    }
    
    // Load Round 2 preferences
    const round2Data = localStorage.getItem(`integrated_round2_${type}`);
    if (round2Data) {
      const parsed = JSON.parse(round2Data);
      setRound2Branches(parsed.branches || []);
      setRound2Cities(parsed.cities || []);
      setRound2Submitted(true);
    }
    
    // Load Round 3 preferences
    const round3Data = localStorage.getItem(`integrated_round3_${type}`);
    if (round3Data) {
      const parsed = JSON.parse(round3Data);
      setRound3Branches(parsed.branches || []);
      setRound3Cities(parsed.cities || []);
      setRound3Submitted(true);
    }
  };

  const getAdmissionTypeDisplay = (type: IntegratedAdmissionType): string => {
    switch (type) {
      case 'BCA_MCA_Int':
        return 'BCA-MCA Integrated';
      case 'BBA_BMS_BBM_MBA_Int':
        return 'BBA/BMS/BBM-MBA Integrated';
      case 'B_and_D_Pharmacy':
        return 'B.Pharm - D.Pharm Integrated';
      default:
        return type;
    }
  };

  const handleRound1Submit = () => {
    if (round1Branches.length === 0 || round1Cities.length === 0) {
      toast.error('Please select at least one branch and one city for Round 1');
      return;
    }
    
    // Save Round 1 preferences
    const round1Data = {
      branches: round1Branches,
      cities: round1Cities,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`integrated_round1_${admissionType}`, JSON.stringify(round1Data));
    setRound1Submitted(true);
    toast.success('Round 1 preferences saved successfully!');
  };

  const handleRound2Submit = () => {
    if (round2Branches.length === 0 || round2Cities.length === 0) {
      toast.error('Please select at least one branch and one city for Round 2');
      return;
    }
    
    // Save Round 2 preferences
    const round2Data = {
      branches: round2Branches,
      cities: round2Cities,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`integrated_round2_${admissionType}`, JSON.stringify(round2Data));
    setRound2Submitted(true);
    toast.success('Round 2 preferences saved successfully!');
  };

  const handleRound3Submit = () => {
    if (round3Branches.length === 0 || round3Cities.length === 0) {
      toast.error('Please select at least one branch and one city for Round 3');
      return;
    }
    
    // Save Round 3 preferences
    const round3Data = {
      branches: round3Branches,
      cities: round3Cities,
      submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`integrated_round3_${admissionType}`, JSON.stringify(round3Data));
    setRound3Submitted(true);
    toast.success('Round 3 preferences saved successfully!');
  };

  const calculateProgress = () => {
    let completed = 0;
    if (round1Submitted) completed += 1;
    if (round2Submitted) completed += 1;
    if (round3Submitted) completed += 1;
    return (completed / 3) * 100;
  };

  if (!admissionType) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header - Mobile Friendly */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/integrated-steps?type=${admissionType}&from=form`)}
              className="w-fit flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Form</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                {getAdmissionTypeDisplay(admissionType)}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Integrated Admission Rounds
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Set your preferences for each counseling round
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(calculateProgress())}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="w-full" />
          </div>
        </div>

        {/* Mobile-Friendly Tabs for Rounds */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-10 sm:h-12">
            <TabsTrigger value="round1" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Round 1</span>
              <span className="sm:hidden">R1</span>
              {round1Submitted && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="round2" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Round 2</span>
              <span className="sm:hidden">R2</span>
              {round2Submitted && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </TabsTrigger>
            <TabsTrigger value="round3" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Round 3</span>
              <span className="sm:hidden">R3</span>
              {round3Submitted && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
            </TabsTrigger>
          </TabsList>

          {/* Round 1 */}
          <TabsContent value="round1" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="w-5 h-5 text-blue-600" />
                  Round 1 Preferences
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  Select your preferred branches and cities for the first counseling round
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <BranchesForm
                  admissionType={admissionType}
                  onSelectionChange={setRound1Branches}
                  initialSelection={round1Branches}
                />
                
                <CitiesForm
                  onSelectionChange={setRound1Cities}
                  initialSelection={round1Cities}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleRound1Submit}
                    disabled={round1Branches.length === 0 || round1Cities.length === 0}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  >
                    Save Round 1 Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Round 2 */}
          <TabsContent value="round2" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="w-5 h-5 text-purple-600" />
                  Round 2 Preferences
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  Select preferences for Round 2, including any previously allotted colleges you want to consider
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <BranchesForm
                  admissionType={admissionType}
                  onSelectionChange={setRound2Branches}
                  initialSelection={round2Branches}
                />
                
                <CitiesForm
                  onSelectionChange={setRound2Cities}
                  initialSelection={round2Cities}
                />
                
                {/* Coming Soon Message */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Round 2 Results Coming Soon</span>
                    </div>
                    <p className="text-xs sm:text-sm text-yellow-700 mt-2">
                      Round 2 counseling and results will be available after Round 1 completion.
                    </p>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleRound2Submit}
                    disabled={round2Branches.length === 0 || round2Cities.length === 0}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                  >
                    Save Round 2 Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Round 3 */}
          <TabsContent value="round3" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Award className="w-5 h-5 text-green-600" />
                  Round 3 Preferences
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  Final round preferences, including any colleges from previous rounds
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <BranchesForm
                  admissionType={admissionType}
                  onSelectionChange={setRound3Branches}
                  initialSelection={round3Branches}
                />
                
                <CitiesForm
                  onSelectionChange={setRound3Cities}
                  initialSelection={round3Cities}
                />
                
                {/* Coming Soon Message */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">Round 3 Results Coming Soon</span>
                    </div>
                    <p className="text-xs sm:text-sm text-yellow-700 mt-2">
                      Round 3 counseling and results will be available after Round 2 completion.
                    </p>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleRound3Submit}
                    disabled={round3Branches.length === 0 || round3Cities.length === 0}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  >
                    Save Round 3 Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntegratedRounds;