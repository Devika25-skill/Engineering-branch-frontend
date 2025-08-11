import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock } from 'lucide-react';
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
  const [showFormUpdateWarning, setShowFormUpdateWarning] = useState(false);

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

    // Check if form has been completed AND preferences have been saved
    const hasCompletedForm = localStorage.getItem(`integrated_form_completed_${selectedType}`);
    
    if (!hasCompletedForm) {
      // Redirect back to form if preferences not saved
      navigate(`/integrated-steps?type=${selectedType}`);
      return;
    }
    
    setAdmissionType(selectedType);
    
    // Check if form data has been updated since last recommendation generation
    const checkFormDataUpdate = () => {
      const currentFormData = localStorage.getItem(`integrated_form_${selectedType}`);
      const storedHash = localStorage.getItem(`integrated_form_hash_${selectedType}`);
      const hasRecommendations = localStorage.getItem(`integrated_round1_recommendations_${selectedType}`);
      
      if (currentFormData && storedHash && hasRecommendations) {
        const currentHash = btoa(currentFormData);
        if (currentHash !== storedHash) {
          setShowFormUpdateWarning(true);
        }
      }
    };
    
    checkFormDataUpdate();
  }, [searchParams, navigate, isLoggedIn]);

  const handleUpdateRecommendations = () => {
    setShowFormUpdateWarning(false);
    setActiveRound('round1'); // Switch to Round 1 tab
    // The IntegratedRound1Tab component will handle the regeneration
  };

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

          
          {/* Form Update Warning Banner */}
          {showFormUpdateWarning && (
            <Card className="border-orange-200 bg-orange-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 text-sm mb-1">
                      Form Data Updated
                    </h4>
                    <p className="text-sm text-orange-700">
                      Your academic details have been updated. The current recommendations are based on previous data. 
                      Click below to regenerate recommendations with your latest information.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleUpdateRecommendations}
                  >
                    Update Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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