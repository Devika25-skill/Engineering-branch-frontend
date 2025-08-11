import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, MapPin, ChevronDown, ChevronUp, Sparkles, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { BranchesForm } from './BranchesForm';
import { CitiesForm } from './CitiesForm';

interface IntegratedRound1TabProps {
  admissionType: IntegratedAdmissionType;
}

export const IntegratedRound1Tab = ({ admissionType }: IntegratedRound1TabProps) => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [isStoring, setIsStoring] = useState(false);
  const [isPreferencesCardCollapsed, setIsPreferencesCardCollapsed] = useState(false);
  const [hasSubmittedPreferences, setHasSubmittedPreferences] = useState(false);

  // Load existing preferences on mount
  useEffect(() => {
    const loadExistingPreferences = () => {
      const savedData = localStorage.getItem(`integrated_round1_${admissionType}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setSelectedBranches(parsed.branches || []);
        setSelectedCities(parsed.cities || []);
        setHasSubmittedPreferences(true);
        setIsPreferencesCardCollapsed(true);
      }
    };
    
    loadExistingPreferences();
  }, [admissionType]);

  const handleSubmitPreferences = async () => {
    if (selectedBranches.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one branch before proceeding.",
        variant: "destructive"
      });
      return;
    }

    if (selectedCities.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one city before proceeding.",
        variant: "destructive"
      });
      return;
    }

    setIsStoring(true);
    
    try {
      const round1Data = {
        branches: selectedBranches,
        cities: selectedCities,
        submittedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`integrated_round1_${admissionType}`, JSON.stringify(round1Data));
      setHasSubmittedPreferences(true);
      setIsPreferencesCardCollapsed(true);
      
      toast({
        title: "Success",
        description: "Round 1 preferences saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStoring(false);
    }
  };

  const handleEditPreferences = () => {
    setIsPreferencesCardCollapsed(false);
  };

  return (
    <div className="space-y-6">
      {/* Preferences Card */}
      <Card className="w-full">
        <CardHeader 
          className="cursor-pointer" 
          onClick={() => setIsPreferencesCardCollapsed(!isPreferencesCardCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Round 1 - Branch & City Preferences
                {hasSubmittedPreferences && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Saved
                  </Badge>
                )}
              </CardTitle>
            </div>
            {isPreferencesCardCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        {!isPreferencesCardCollapsed && (
          <CardContent className="space-y-6">
            <BranchesForm
              admissionType={admissionType}
              onSelectionChange={setSelectedBranches}
              initialSelection={selectedBranches}
            />
            
            <CitiesForm
              onSelectionChange={setSelectedCities}
              initialSelection={selectedCities}
            />
            
            <div className="flex justify-end gap-3">
              {hasSubmittedPreferences && (
                <Button 
                  variant="outline" 
                  onClick={handleEditPreferences}
                >
                  Edit Preferences
                </Button>
              )}
              <Button 
                onClick={handleSubmitPreferences}
                disabled={isStoring || selectedBranches.length === 0 || selectedCities.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isStoring ? 'Saving...' : hasSubmittedPreferences ? 'Update Preferences' : 'Save Preferences'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Coming Soon Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Round 1 Results Coming Soon
              </h3>
              <p className="text-yellow-700 text-sm max-w-md mx-auto">
                Round 1 counseling and seat allocation will begin once the official schedule is announced. 
                Your preferences have been saved and will be used for the counseling process.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
              <Sparkles className="w-4 h-4" />
              <span>Get ready for an exciting journey ahead!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};