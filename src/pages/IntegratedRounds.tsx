import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

const getAdmissionTypeInfo = (type: IntegratedAdmissionType) => {
  switch (type) {
    case 'BCA_MCA_Int':
      return { 
        title: 'BCA/MCA (Integrated)', 
        gradient: 'from-blue-500 to-cyan-500'
      };
    case 'BBA_BMS_BBM_MBA_Int':
      return { 
        title: 'BBA/BMS/BBM/MBA (Int.)', 
        gradient: 'from-purple-500 to-pink-500'
      };
    case 'B_and_D_Pharmacy':
      return { 
        title: 'B.Pharmacy/Pharm D', 
        gradient: 'from-green-500 to-emerald-500'
      };
  }
};

const IntegratedRounds = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  const [admissionType, setAdmissionType] = useState<IntegratedAdmissionType | null>(null);
  const [activeRound, setActiveRound] = useState<string>(() => {
    const savedRound = localStorage.getItem('activeIntegratedRoundTab');
    return savedRound || 'round1'; // Default to Round 1 for integrated
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    // Get admission type from URL params or localStorage
    const typeFromParams = searchParams.get('type') as IntegratedAdmissionType;
    const typeFromStorage = localStorage.getItem('integrated_admission_type') as IntegratedAdmissionType;
    
    const selectedType = typeFromParams || typeFromStorage;
    
    if (!selectedType || !['BCA_MCA_Int', 'BBA_BMS_BBM_MBA_Int', 'B_and_D_Pharmacy'].includes(selectedType)) {
      // Redirect to selection if no valid type
      navigate('/');
      return;
    }
    
    setAdmissionType(selectedType);
  }, [searchParams, navigate, isLoggedIn]);

  const handleBackToForm = () => {
    if (admissionType) {
      navigate(`/integrated-steps?type=${admissionType}&from=form`);
    }
  };

  if (!admissionType) {
    return null;
  }

  const admissionInfo = getAdmissionTypeInfo(admissionType);

  // Coming Soon Round Component
  const ComingSoonRound = ({ roundNumber }: { roundNumber: number }) => (
    <div className="space-y-6">
      {/* Round Header */}
      <Card className="relative overflow-hidden border-2 border-border/50">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${admissionInfo.gradient}`} />
        
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">
            Round {roundNumber}
          </CardTitle>
          <CardDescription>
            Set your preferences for round {roundNumber} admissions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-6 py-3 text-base">
              <Calendar className="mr-2 h-5 w-5" />
              Coming Soon
            </Badge>
          </div>
          
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-muted-foreground">
              Round {roundNumber} recommendations will be available soon. You'll be able to:
            </p>
            
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Search colleges by choice code, name, or college code</li>
              <li>• Set your preferred branches and specializations</li>
              <li>• Choose your preferred cities and institutions</li>
              <li>• View admission probabilities and cutoff data</li>
              <li>• Generate personalized recommendation lists</li>
            </ul>
          </div>
          
          <Button 
            variant="outline" 
            disabled
            className="w-full max-w-xs"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Set Round {roundNumber} Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Features Preview Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-900 mb-2">
                What's Coming in Round {roundNumber}?
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Advanced college search and filtering capabilities</li>
                <li>• Branch-wise preference setting for {admissionInfo.title}</li>
                <li>• City and location-based college recommendations</li>
                <li>• Real-time admission probability calculations</li>
                <li>• Detailed cutoff analysis and trend insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={handleBackToForm}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Form
            </Button>
            
            <div className="text-center">
              <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r ${admissionInfo.gradient} bg-clip-text text-transparent`}>
                {admissionInfo.title}
              </h1>
              <p className="text-xl text-muted-foreground">
                Round-wise Admission Recommendations
              </p>
            </div>
          </div>

          {/* Rounds Tabs - Replicating FY/DSY Layout */}
          <Tabs 
            value={activeRound} 
            onValueChange={(value) => {
              setActiveRound(value);
              localStorage.setItem('activeIntegratedRoundTab', value);
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted">
              <TabsTrigger value="round1" className="text-xs sm:text-sm font-medium">
                Round 1
              </TabsTrigger>
              <TabsTrigger value="round2" className="text-xs sm:text-sm font-medium">
                Round 2
              </TabsTrigger>
              <TabsTrigger value="round3" className="text-xs sm:text-sm font-medium">
                Round 3
              </TabsTrigger>
            </TabsList>

            <TabsContent value="round1" className="mt-6">
              <ComingSoonRound roundNumber={1} />
            </TabsContent>

            <TabsContent value="round2" className="mt-6">
              <ComingSoonRound roundNumber={2} />
            </TabsContent>

            <TabsContent value="round3" className="mt-6">
              <ComingSoonRound roundNumber={3} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IntegratedRounds;