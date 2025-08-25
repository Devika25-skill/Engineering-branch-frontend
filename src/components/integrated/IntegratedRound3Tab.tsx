import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { IntegratedCollegeSelectionCard } from './IntegratedCollegeSelectionCard';
import { IntegratedBranchesForm } from './IntegratedBranchesForm';
import { IntegratedCitiesForm } from './IntegratedCitiesForm';
import { IntegratedRecommendationCard } from './IntegratedRecommendationCard';
import { useToast } from '@/hooks/use-toast';
import { integratedRecommendationApi } from '@/services/integratedRecommendationApi';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface IntegratedRound3TabProps {
  admissionType: IntegratedAdmissionType;
}

interface SelectedCollege {
  collegeCode: number;
  collegeName: string;
  courseCode: string;
  courseName: string;
}

export const IntegratedRound3Tab = ({ admissionType }: IntegratedRound3TabProps) => {
  const [currentStep, setCurrentStep] = useState<'college' | 'preferences' | 'results'>('college');
  const [selectedCollege, setSelectedCollege] = useState<SelectedCollege | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreferenceTab, setActivePreferenceTab] = useState('branches');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved data from localStorage
    const savedCollege = localStorage.getItem(`integrated_round3_college_${admissionType}`);
    const savedBranches = localStorage.getItem(`integrated_round3_branches_${admissionType}`);
    const savedCities = localStorage.getItem(`integrated_round3_cities_${admissionType}`);
    const savedRecommendations = localStorage.getItem(`integrated_round3_recommendations_${admissionType}`);

    if (savedCollege) {
      const college = JSON.parse(savedCollege);
      setSelectedCollege(college);
      if (savedBranches && savedCities) {
        setSelectedBranches(JSON.parse(savedBranches));
        setSelectedCities(JSON.parse(savedCities));
        if (savedRecommendations) {
          setRecommendations(JSON.parse(savedRecommendations));
          setCurrentStep('results');
        } else {
          setCurrentStep('preferences');
        }
      }
    }
  }, [admissionType]);

  const handleCollegeSelect = (college: SelectedCollege) => {
    setSelectedCollege(college);
    localStorage.setItem(`integrated_round3_college_${admissionType}`, JSON.stringify(college));
    setCurrentStep('preferences');
  };

  const handleSkipSelection = () => {
    setSelectedCollege(null);
    localStorage.removeItem(`integrated_round3_college_${admissionType}`);
    setCurrentStep('preferences');
  };

  const handleGenerateRecommendations = async () => {
    if (selectedBranches.length === 0 || selectedCities.length === 0) {
      toast({
        title: "Please complete all preferences",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const formData = JSON.parse(localStorage.getItem(`integrated_form_${admissionType}`) || '{}');
      
      const requestData = {
        exam_type: admissionType,
        branches: selectedBranches,
        locations: selectedCities,
        round_no: 3,
        category: formData.category,
        score: formData.score,
        ...(selectedCollege && { last_college_round_choice_code: selectedCollege.courseCode })
      };

      const response = await integratedRecommendationApi.generateRecommendations(requestData);
      
      if (response.success) {
        setRecommendations(response.data);
        localStorage.setItem(`integrated_round3_recommendations_${admissionType}`, JSON.stringify(response.data));
        localStorage.setItem(`integrated_round3_branches_${admissionType}`, JSON.stringify(selectedBranches));
        localStorage.setItem(`integrated_round3_cities_${admissionType}`, JSON.stringify(selectedCities));
        setCurrentStep('results');
        
        toast({
          title: selectedCollege 
            ? "Round 3 recommendations generated successfully!" 
            : "Fresh Round 3 recommendations generated successfully!"
        });
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Failed to generate recommendations",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetRound = () => {
    setSelectedCollege(null);
    setSelectedBranches([]);
    setSelectedCities([]);
    setRecommendations(null);
    setCurrentStep('college');
    setActivePreferenceTab('branches');
    
    // Clear localStorage
    localStorage.removeItem(`integrated_round3_college_${admissionType}`);
    localStorage.removeItem(`integrated_round3_branches_${admissionType}`);
    localStorage.removeItem(`integrated_round3_cities_${admissionType}`);
    localStorage.removeItem(`integrated_round3_recommendations_${admissionType}`);
  };

  if (currentStep === 'college') {
    return (
      <div className="space-y-6">
        <IntegratedCollegeSelectionCard
          admissionType={admissionType}
          onCollegeSelect={handleCollegeSelect}
          onSkipSelection={handleSkipSelection}
          selectedCollege={selectedCollege}
        />
      </div>
    );
  }

  if (currentStep === 'preferences') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Round 3 Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCollege 
                    ? `Based on your selected college: ${selectedCollege.collegeName}`
                    : 'Fresh recommendations without previous round constraint'
                  }
                </p>
              </div>
              <Button variant="outline" onClick={() => setCurrentStep('college')}>
                {selectedCollege ? 'Change College' : 'Select College'}
              </Button>
            </div>

            <Tabs value={activePreferenceTab} onValueChange={setActivePreferenceTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="branches">Branches</TabsTrigger>
                <TabsTrigger value="cities">Cities</TabsTrigger>
              </TabsList>

              <TabsContent value="branches" className="space-y-4">
                <IntegratedBranchesForm
                  admissionType={admissionType}
                  onSelectionChange={setSelectedBranches}
                  initialSelection={selectedBranches}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setActivePreferenceTab('cities')}
                    disabled={selectedBranches.length === 0}
                  >
                    Next: Select Cities <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cities" className="space-y-4">
                <IntegratedCitiesForm
                  admissionType={admissionType}
                  onSelectionChange={setSelectedCities}
                  initialSelection={selectedCities}
                />
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setActivePreferenceTab('branches')}
                  >
                    Back to Branches
                  </Button>
                  <Button 
                    onClick={handleGenerateRecommendations}
                    disabled={selectedCities.length === 0 || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Round 3 Recommendations'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Round 3 Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCollege 
              ? `Based on your previous choice: ${selectedCollege.collegeName}`
              : 'Fresh recommendations for Round 3'
            }
          </p>
        </div>
        <Button variant="outline" onClick={resetRound}>
          Start Over
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations && (
          <>
            {recommendations.Dream?.map((rec: any, idx: number) => (
              <IntegratedRecommendationCard key={idx} recommendation={rec} index={idx + 1} />
            ))}
            {recommendations.Reach?.map((rec: any, idx: number) => (
              <IntegratedRecommendationCard key={idx} recommendation={rec} index={recommendations.Dream?.length + idx + 1} />
            ))}
            {recommendations.Match?.map((rec: any, idx: number) => (
              <IntegratedRecommendationCard key={idx} recommendation={rec} index={(recommendations.Dream?.length || 0) + (recommendations.Reach?.length || 0) + idx + 1} />
            ))}
            {recommendations.Safety?.map((rec: any, idx: number) => (
              <IntegratedRecommendationCard key={idx} recommendation={rec} index={(recommendations.Dream?.length || 0) + (recommendations.Reach?.length || 0) + (recommendations.Match?.length || 0) + idx + 1} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};