import { useState, useEffect } from "react";
import { MedicalCollegeRecommendation } from "@/types/medical";
import {
  Lock,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Loader2,
  Download,
  Building,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendationHeader } from "./RecommendationHeader";
import { RecommendationDisclaimer } from "./RecommendationDisclaimer";
import { CAPFormInstructions } from "./CAPFormInstructions";
import { NoResultsState } from "./NoResultsState";
import { MedicalRound2Tab } from "./MedicalRound2Tab";
import { MedicalRound3Tab } from "./MedicalRound3Tab";
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
  activeRound?: "round1" | "round2" | "round3";
  onRoundChange?: (
    round: "round1" | "round2" | "round3",
  ) => void | Promise<void>;
  isRoundInvalidated?: boolean;
  onRegenerateRecommendations?: () => void | Promise<void>;
  onPreferencesUpdated?: () => void;
  hasGeneratedRecommendations?: boolean;
  onRoundResolved?: () => void;
}

export const MedicalRecommendationResults = ({
  recommendations: rawRecommendations,
  formData,
  paymentData,
  activeRound: externalActiveRound,
  onRoundChange,
  isRoundInvalidated,
  onRegenerateRecommendations,
  onPreferencesUpdated,
  hasGeneratedRecommendations,
  onRoundResolved,
}: MedicalRecommendationResultsProps) => {
  // Ensure recommendations always have the required structure with empty arrays as defaults
  const recommendations = {
    Dream: Array.isArray(rawRecommendations?.Dream)
      ? rawRecommendations.Dream
      : [],
    Reach: Array.isArray(rawRecommendations?.Reach)
      ? rawRecommendations.Reach
      : [],
    Match: Array.isArray(rawRecommendations?.Match)
      ? rawRecommendations.Match
      : [],
    Safety: Array.isArray(rawRecommendations?.Safety)
      ? rawRecommendations.Safety
      : [],
  };

  // Initialize with Round 1 as default
  const [internalActiveRound, setInternalActiveRound] =
    useState<string>("round1");

  // Use external activeRound if provided, otherwise use internal state
  const activeRound = externalActiveRound || internalActiveRound;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const { generatePDF, isGenerating } = usePdfDownloadMedical();
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    if (onRoundChange) {
      onRoundChange(value as "round1" | "round2" | "round3");
    } else {
      setInternalActiveRound(value);
    }
  };

  const handleDownloadPDF = () => {
    if (!isUnlocked && paymentData?.is_payment !== true) {
      toast({
        title: "Download Locked",
        description:
          "Please unlock recommendations to download the PDF report.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Generating PDF",
      description:
        "Please wait while we prepare your recommendations report...",
      duration: 3000,
    });

    // Convert to flat array with category information for PDF generation
    const flatRecommendations = [
      ...(Array.isArray(recommendations.Dream)
        ? recommendations.Dream.map((rec: any) => ({
            ...rec,
            category: "Dream",
          }))
        : []),
      ...(Array.isArray(recommendations.Reach)
        ? recommendations.Reach.map((rec: any) => ({
            ...rec,
            category: "Reach",
          }))
        : []),
      ...(Array.isArray(recommendations.Match)
        ? recommendations.Match.map((rec: any) => ({
            ...rec,
            category: "Match",
          }))
        : []),
      ...(Array.isArray(recommendations.Safety)
        ? recommendations.Safety.map((rec: any) => ({
            ...rec,
            category: "Safety",
          }))
        : []),
    ];
    generatePDF(flatRecommendations as any, formData);
  };

  // Load unlock status from localStorage
  useEffect(() => {
    const unlocked = localStorage.getItem("medicalRecommendationUnlocked");
    setIsUnlocked(unlocked === "true");
  }, []);

  // Determine if unlock functionality should be shown
  const shouldShowUnlock = () => {
    // If payment data explicitly states payment is done or not accepted, don't show unlock
    if (
      paymentData?.is_payment === true ||
      paymentData?.accept_payment === false
    ) {
      return false;
    }
    // Otherwise show unlock if not already unlocked
    return !isUnlocked;
  };

  const sortRecommendationsByCategory = (
    recs: MedicalCollegeRecommendation[],
  ) => {
    if (!Array.isArray(recs)) {
      console.error("sortRecommendationsByCategory received non-array:", recs);
      return [];
    }

    // Use API response data directly without any sorting
    return [...recs];
  };

  const getCategorizedRecommendations = () => {
    const allRecs = Object.entries(recommendations).flatMap(
      ([category, recs]) => {
        if (!Array.isArray(recs)) {
          console.error(`Category ${category} has non-array data:`, recs);
          return [];
        }
        return recs.map((rec) => ({
          ...rec,
          quotaCategory: rec.category,
          category,
        }));
      },
    );
    return sortRecommendationsByCategory(allRecs);
  };

  const filteredRecommendations = getCategorizedRecommendations();

  const shouldBlurResults = shouldShowUnlock();
  const visibleRecommendations =
    shouldBlurResults && !isUnlocked
      ? filteredRecommendations.slice(0, 5)
      : filteredRecommendations;

  const hiddenCount = shouldBlurResults
    ? filteredRecommendations.length - visibleRecommendations.length
    : 0;

  const renderUpcomingRound = (roundNumber: number) => {
    const isLocked = shouldShowUnlock();

    return (
      <div className="space-y-6">
        <RecommendationDisclaimer />

        <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                {isLocked ? (
                  <Lock className="w-8 h-8 text-white" />
                ) : (
                  <Calendar className="w-8 h-8 text-white" />
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {isLocked
                    ? `Unlock Round ${roundNumber} Predictions`
                    : `Round ${roundNumber} Coming Soon`}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {isLocked
                    ? `Get access to Round ${roundNumber} college predictions based on historical cutoff trends and expert analysis. Unlock now to view all recommendations!`
                    : `Round ${roundNumber} predictions will be available once the official cutoff data is released by the admission authorities.`}
                </p>
              </div>

              {isLocked && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  <PremiumGate
                    onUnlock={() => setIsUnlocked(true)}
                    storageKey="medicalRecommendationUnlocked"
                    productType="medical-recommendations"
                    title="Medical Recommendations Unlock"
                    description="Unlock complete medical college recommendations"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Dream":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Reach":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Match":
        return "bg-green-100 text-green-800 border-green-200";
      case "Safety":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const renderRecommendationCard = (
    rec: MedicalCollegeRecommendation & {
      category: string;
      quotaCategory?: string;
    },
    index: number,
  ) => (
    <Card
      key={index}
      className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden"
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
          {/* Index Number */}
          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
            {index + 1}
          </div>

          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3
                  className="text-sm font-semibold text-gray-900 leading-tight"
                  title={rec.college.college_name}
                >
                  {truncateText(rec.college.college_name, 40)}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span className="truncate">
                    {rec.college.city}
                    {rec.college.state ? `, ${rec.college.state}` : ""}
                  </span>
                </div>
              </div>
              <Badge
                className={`${getCategoryColor(rec.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}
              >
                {rec.category}
              </Badge>
            </div>

            {/* Course Name */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-xs text-blue-600"
                >
                  {rec.college.course_type}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="font-medium">
                  College Code: {rec.college.college_code}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-xs text-blue-600"
              >
                Category: {rec.quotaCategory}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="flex items-start gap-1">
              <TrendingUp
                size={14}
                className="text-blue-600 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-blue-600 leading-tight">
                  Closing Rank
                </p>
                <p className="text-sm font-bold text-blue-900 truncate">
                  {rec.closing_rank ? rec.closing_rank.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-2">
            <div className="flex items-start gap-1">
              <Users
                size={14}
                className="text-green-600 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-green-600 leading-tight">
                  Admission Chance
                </p>
                <p
                  className={`text-sm font-bold truncate ${getProbabilityColor(rec.admission_probability)}`}
                >
                  {rec.admission_probability}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-2">
            <div className="flex items-start gap-1">
              <Users
                size={14}
                className="text-purple-600 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-purple-600 leading-tight">
                  Your Rank
                </p>
                <p className="text-sm font-bold text-purple-900 truncate">
                  {rec.neet_rank ? rec.neet_rank.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-2">
            <div className="flex items-start gap-1">
              <Users
                size={14}
                className="text-orange-600 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs text-orange-600 leading-tight">
                  College Type
                </p>
                <p className="text-sm font-bold text-orange-900 truncate">
                  {rec.college.college_type || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <RecommendationHeader formData={formData} />

      <Tabs
        value={activeRound}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="round1">Round 1</TabsTrigger>
          <TabsTrigger value="round2">Round 2</TabsTrigger>
          <TabsTrigger value="round3">Round 3</TabsTrigger>
        </TabsList>

        <TabsContent value="round1">
          {hasGeneratedRecommendations && isRoundInvalidated ? (
            <div className="space-y-6">
              <RecommendationDisclaimer />
              <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Form Updated - Regenerate Recommendations
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Your form data has been updated. Click the button below
                        to generate new recommendations based on your updated
                        information.
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={onRegenerateRecommendations}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Generate New Recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <CAPFormInstructions />
              <RecommendationDisclaimer />

              {/* Results Summary */}
              {filteredRecommendations.length > 0 && (
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {filteredRecommendations.length} Colleges Found
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Based on your profile and preferences
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={
                      isGenerating ||
                      (!isUnlocked && paymentData?.is_payment !== true)
                    }
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                          Generating...
                        </span>
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        <span className="text-sm font-medium">
                          Download PDF
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {filteredRecommendations.length === 0 ? (
                <NoResultsState />
              ) : (
                <div className="space-y-4">
                  {visibleRecommendations.map((rec, index) =>
                    renderRecommendationCard(rec, index),
                  )}

                  {hiddenCount > 0 && shouldBlurResults && (
                    <Card className="mt-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                            <Lock className="w-8 h-8 text-white" />
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {hiddenCount} More Recommendations Locked
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                              Unlock all {filteredRecommendations.length}{" "}
                              personalized medical college recommendations to
                              maximize your admission chances!
                            </p>
                          </div>

                          {/* Premium Gate for Round 1 */}
                          <div className="relative">
                            <PremiumGate
                              onUnlock={() => setIsUnlocked(true)}
                              storageKey="medicalRecommendationUnlocked"
                              productType="medical-recommendations"
                              title="Medical Recommendations Unlock"
                              description="Unlock complete medical college recommendations"
                            />
                          </div>

                          {/* Blurred recommendation cards preview */}
                          <div className="blur-sm pointer-events-none space-y-4 mt-6">
                            {filteredRecommendations
                              .slice(
                                5,
                                Math.min(10, filteredRecommendations.length),
                              )
                              .map((rec, index) => (
                                <Card
                                  key={index}
                                  className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden"
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                                      <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                        {index + 6}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                                          <Building className="w-6 h-6 text-purple-600" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                          <div className="flex-1 min-w-0">
                                            <h3
                                              className="text-sm font-semibold text-gray-900 leading-tight"
                                              title={rec.college.college_name}
                                            >
                                              {truncateText(
                                                rec.college.college_name,
                                                40,
                                              )}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                              <MapPin
                                                size={12}
                                                className="flex-shrink-0"
                                              />
                                              <span className="truncate">
                                                {rec.college.city}
                                              </span>
                                            </div>
                                          </div>
                                          <Badge
                                            className={`${getCategoryColor(rec.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}
                                          >
                                            {rec.category}
                                          </Badge>
                                        </div>
                                        <div className="mt-2">
                                          <p className="text-xs font-medium text-gray-700 leading-snug">
                                            {truncateText(rec.program, 60)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-2 pb-3">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                      <div className="bg-gray-50 rounded-lg p-2">
                                        <p className="text-xs text-gray-600">
                                          Closing Rank
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                          {rec.closing_rank
                                            ? rec.closing_rank.toLocaleString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <div className="bg-gray-50 rounded-lg p-2">
                                        <p className="text-xs text-gray-600">
                                          Admission Chance
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                          {rec.admission_probability}%
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="round2">
          <MedicalRound2Tab
            isRoundInvalidated={isRoundInvalidated}
            onRegenerateRecommendations={onRegenerateRecommendations}
            onRoundResolved={onRoundResolved}
          />
        </TabsContent>

        <TabsContent value="round3">
          <MedicalRound3Tab
            isRoundInvalidated={isRoundInvalidated}
            onRegenerateRecommendations={onRegenerateRecommendations}
            onRoundResolved={onRoundResolved}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
