import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const typeFromParams = searchParams.get('type') as IntegratedAdmissionType;
    const typeFromStorage = localStorage.getItem('integrated_admission_type') as IntegratedAdmissionType;
    
    const selectedType = typeFromParams || typeFromStorage;
    
    if (!selectedType || !['BCA_MCA_Int', 'BBA_BMS_BBM_MBA_Int', 'B_and_D_Pharmacy'].includes(selectedType)) {
      navigate('/');
      return;
    }
    
    setAdmissionType(selectedType);
  }, [searchParams, navigate, isLoggedIn]);

  const handleBackToForm = () => {
    if (admissionType) {
      navigate(`/integrated-steps?type=${admissionType}`);
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
        <div className="max-w-4xl mx-auto">
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
                Round-wise Recommendations
              </p>
            </div>
          </div>

          {/* Round Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((round) => (
              <Card key={round} className="relative overflow-hidden border-2 border-border/50">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${admissionInfo.gradient}`} />
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">
                    Round {round}
                  </CardTitle>
                  <CardDescription>
                    Admission preferences for round {round}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="px-4 py-2">
                      <Calendar className="mr-2 h-4 w-4" />
                      Coming Soon
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground text-sm">
                    Round {round} recommendations will be available soon. 
                    You'll be able to set your branch and city preferences here.
                  </p>
                  
                  <Button 
                    variant="outline" 
                    disabled
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Set Preferences
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-blue-900 mb-2">
                    What's Coming Next?
                  </h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Set your preferred branches for each round</li>
                    <li>• Choose your preferred cities and colleges</li>
                    <li>• Get AI-powered recommendations based on your preferences</li>
                    <li>• View admission probabilities and cutoff data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IntegratedRounds;