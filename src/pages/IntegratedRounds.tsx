import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegratedRound1Tab } from '@/components/integrated/IntegratedRound1Tab';
import { IntegratedRound2Tab } from '@/components/integrated/IntegratedRound2Tab';
import { IntegratedRound3Tab } from '@/components/integrated/IntegratedRound3Tab';

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

    // Check if form has been completed - this is the key check
    const hasCompletedForm = localStorage.getItem(`integrated_form_completed_${selectedType}`) === 'true';
    
    if (!hasCompletedForm) {
      // Redirect back to form if preferences not saved
      navigate(`/integrated-steps?type=${selectedType}`);
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

          {/* Rounds Tabs - Exactly replicating FY/DSY Layout */}
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

            <TabsContent value="round1" className="mt-4">
              <IntegratedRound1Tab admissionType={admissionType} />
            </TabsContent>

            <TabsContent value="round2" className="mt-4">
              <IntegratedRound2Tab admissionType={admissionType} />
            </TabsContent>

            <TabsContent value="round3" className="mt-4">
              <IntegratedRound3Tab admissionType={admissionType} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default IntegratedRounds;