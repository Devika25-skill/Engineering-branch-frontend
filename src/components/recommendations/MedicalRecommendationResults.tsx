import { useState, useEffect } from 'react';
import { MedicalCollegeRecommendation } from "@/types/medical";
import { Calendar, MapPin, Users, TrendingUp, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendationHeader } from "./RecommendationHeader";
import { RecommendationDisclaimer } from "./RecommendationDisclaimer";
import { CAPFormInstructions } from "./CAPFormInstructions";
import { NoResultsState } from "./NoResultsState";
import { MedicalRound2Tab } from "./MedicalRound2Tab";
import { PremiumGate } from "./PremiumGate";

export interface MedicalRecommendationResultsProps {
  recommendations: {
    Dream: MedicalCollegeRecommendation[];
    Reach: MedicalCollegeRecommendation[];
    Match: MedicalCollegeRecommendation[];
    Safety: MedicalCollegeRecommendation[];
  };
  formData: any;
  paymentData?: {
    is_payment?: boolean;
    accept_payment?: boolean;
  };
  activeRound?: 'round1' | 'round2' | 'round3';
  onRoundChange?: (round: 'round1' | 'round2' | 'round3') => void | Promise<void>;
  isRoundInvalidated?: boolean;
  onRegenerateRecommendations?: () => void | Promise<void>;
}

export const MedicalRecommendationResults = ({
  recommendations: rawRecommendations,
  formData,
  paymentData,
  activeRound: externalActiveRound,
  onRoundChange,
  isRoundInvalidated,
  onRegenerateRecommendations
}: MedicalRecommendationResultsProps) => {
  // Ensure recommendations always have the required structure with empty arrays as defaults
  const recommendations = {
    Dream: Array.isArray(rawRecommendations?.Dream) ? rawRecommendations.Dream : [],
    Reach: Array.isArray(rawRecommendations?.Reach) ? rawRecommendations.Reach : [],
    Match: Array.isArray(rawRecommendations?.Match) ? rawRecommendations.Match : [],
    Safety: Array.isArray(rawRecommendations?.Safety) ? rawRecommendations.Safety : []
  };

  // Initialize with Round 1 as default
  const [internalActiveRound, setInternalActiveRound] = useState<string>('round1');

  // Use external activeRound if provided, otherwise use internal state
  const activeRound = externalActiveRound || internalActiveRound;
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { generatePDF, isGenerating } = usePdfDownloadMedical();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    if (onRoundChange) {
      onRoundChange(value as 'round1' | 'round2' | 'round3');
    } else {
      setInternalActiveRound(value);
    }
  };

  const handleDownloadPDF = () => {
    if (!isUnlocked && paymentData?.is_payment !== true) {
      toast({
        title: "Download Locked",
        description: "Please unlock recommendations to download the PDF report.",
        variant: "destructive"
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your recommendations report...",
    });

    // Convert to flat array with category information for PDF generation
    const flatRecommendations = [
      ...(Array.isArray(recommendations.Dream) ? recommendations.Dream.map((rec: any) => ({ ...rec, category: 'Dream' })) : []),
      ...(Array.isArray(recommendations.Reach) ? recommendations.Reach.map((rec: any) => ({ ...rec, category: 'Reach' })) : []),
      ...(Array.isArray(recommendations.Match) ? recommendations.Match.map((rec: any) => ({ ...rec, category: 'Match' })) : []),
      ...(Array.isArray(recommendations.Safety) ? recommendations.Safety.map((rec: any) => ({ ...rec, category: 'Safety' })) : [])
    ];
    generatePDF(flatRecommendations as any, formData);
  };
  
  // Load unlock status from localStorage
  useEffect(() => {
    const unlockStatus = localStorage.getItem('medicalRecommendationUnlocked');
    setIsUnlocked(unlockStatus === 'true');
  }, []);

  // Determine if unlock functionality should be shown
  const shouldShowUnlock = () => {
    // If payment data explicitly states payment is done or not accepted, don't show unlock
    if (paymentData?.is_payment === true || paymentData?.accept_payment === false) {
      return false;
    }
    // Otherwise show unlock if not already unlocked
    return !isUnlocked;
  };

  const sortRecommendationsByCategory = (recs: MedicalCollegeRecommendation[]) => {
    // Safety check: ensure recs is an array
    if (!Array.isArray(recs)) {
      console.error('sortRecommendationsByCategory received non-array:', recs);
      return [];
    }
    
    const categoryOrder = { Dream: 1, Reach: 2, Match: 3, Safety: 4 };
    return [...recs].sort((a, b) => {
      const categoryDiff = categoryOrder[a.category as keyof typeof categoryOrder] - 
                          categoryOrder[b.category as keyof typeof categoryOrder];
      if (categoryDiff !== 0) return categoryDiff;
      return (a.closing_rank || 0) - (b.closing_rank || 0);
    });
  };

  const getCategorizedRecommendations = () => {
    const allRecs = Object.entries(recommendations).flatMap(([category, recs]) => {
      // Safety check: ensure recs is an array before mapping
      if (!Array.isArray(recs)) {
        console.error(`Category ${category} has non-array data:`, recs);
        return [];
      }
      return recs.map(rec => ({ ...rec, category }));
    });
    return sortRecommendationsByCategory(allRecs);
  };

  const filteredRecommendations = getCategorizedRecommendations();

  const shouldBlurResults = shouldShowUnlock();
  const visibleRecommendations = shouldBlurResults && !isUnlocked
    ? filteredRecommendations.slice(0, 5)
    : filteredRecommendations;

  const hiddenCount = shouldBlurResults ? filteredRecommendations.length - visibleRecommendations.length : 0;

  const renderUpcomingRound = (roundNumber: number) => {
    return (
      <div className="space-y-6">
        <RecommendationDisclaimer />
        
        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Round {roundNumber} Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Round {roundNumber} predictions will be available once the official cutoff data is released by the admission authorities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Calculate category statistics
  const categoryStats = {
    Dream: recommendations.Dream?.length || 0,
    Reach: recommendations.Reach?.length || 0,
    Match: recommendations.Match?.length || 0,
    Safety: recommendations.Safety?.length || 0,
    Total: filteredRecommendations.length
  };

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 space-y-6">
      <Tabs value={activeRound} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="round1" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Round 1
          </TabsTrigger>
          <TabsTrigger value="round2" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Round 2
          </TabsTrigger>
          <TabsTrigger value="round3" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Round 3
          </TabsTrigger>
        </TabsList>

        {/* Round 1 Content */}
        <TabsContent value="round1" className="space-y-6">
          {filteredRecommendations.length === 0 ? (
            <NoResultsState />
          ) : (
            <>
              <CAPFormInstructions />
              <RecommendationDisclaimer />
              
              {/* Summary Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    Your Medical College Recommendations (Round 1)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-purple-600">{categoryStats.Dream}</p>
                      <p className="text-sm text-gray-600">Dream</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-blue-600">{categoryStats.Reach}</p>
                      <p className="text-sm text-gray-600">Reach</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-green-600">{categoryStats.Match}</p>
                      <p className="text-sm text-gray-600">Match</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-2xl font-bold text-orange-600">{categoryStats.Safety}</p>
                      <p className="text-sm text-gray-600">Safety</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-300">
                      <p className="text-2xl font-bold text-blue-700">{categoryStats.Total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating || (shouldBlurResults && !isUnlocked)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Full Report (PDF)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Recommendations List */}
              <div className="space-y-4">
                {visibleRecommendations.map((rec, index) => {
                  const getCategoryColor = (category: string) => {
                    switch (category) {
                      case "Dream": return "bg-purple-100 text-purple-800 border-purple-200";
                      case "Reach": return "bg-blue-100 text-blue-800 border-blue-200";
                      case "Match": return "bg-green-100 text-green-800 border-green-200";
                      case "Safety": return "bg-orange-100 text-orange-800 border-orange-200";
                      default: return "bg-gray-100 text-gray-800 border-gray-200";
                    }
                  };

                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border border-blue-200">
                              <span className="text-blue-600 text-lg font-bold">
                                {rec.college.college_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                                {rec.college.college_name}
                              </h3>
                              <Badge className={`${getCategoryColor(rec.category)} text-xs font-medium flex-shrink-0`}>
                                {rec.category}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{rec.college.city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span>{rec.program || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Closing Rank</p>
                            <p className="text-lg font-bold text-blue-600">{rec.closing_rank?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Admission Probability</p>
                            <p className="text-lg font-bold text-green-600">{rec.admission_probability}%</p>
                          </div>
                        </div>
                        {rec.probability_message && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                            {rec.probability_message}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {hiddenCount > 0 && shouldBlurResults && (
                <div className="relative mt-6">
                  {/* Blurred recommendation cards preview */}
                  <div className="blur-sm pointer-events-none space-y-4">
                    {filteredRecommendations.slice(5, Math.min(10, filteredRecommendations.length)).map((rec, index) => {
                      const getCategoryColor = (category: string) => {
                        switch (category) {
                          case "Dream": return "bg-purple-100 text-purple-800 border-purple-200";
                          case "Reach": return "bg-blue-100 text-blue-800 border-blue-200";
                          case "Match": return "bg-green-100 text-green-800 border-green-200";
                          case "Safety": return "bg-orange-100 text-orange-800 border-orange-200";
                          default: return "bg-gray-100 text-gray-800 border-gray-200";
                        }
                      };

                      return (
                        <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                          <CardHeader className="pb-2">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {index + 6}
                              </div>
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                                  <span className="text-gray-600 text-xs font-bold">
                                    {rec.college.college_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                    {rec.college.college_name}
                                  </h3>
                                  <Badge className={`${getCategoryColor(rec.category)} text-xs font-medium flex-shrink-0`}>
                                    {rec.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="w-3 h-3" />
                                  <span>{rec.college.city}</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Premium Gate for Round 1 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PremiumGate
                      onUnlock={() => setIsUnlocked(true)}
                      storageKey="medicalRecommendationUnlocked"
                      productType="medical-recommendations"
                      title="Medical Recommendations Unlock"
                      description="Unlock complete medical college recommendations"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Round 2 Content */}
        <TabsContent value="round2" className="space-y-6">
          <MedicalRound2Tab 
            isRoundInvalidated={isRoundInvalidated}
            onRegenerateRecommendations={onRegenerateRecommendations}
          />
        </TabsContent>

        {/* Round 3 Content */}
        <TabsContent value="round3" className="space-y-6">
          {renderUpcomingRound(3)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
