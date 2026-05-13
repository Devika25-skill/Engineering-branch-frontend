import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Star,
  Building,
  Users,
  IndianRupee,
  TrendingUp,
  Phone,
  Mail,
  Globe,
  Calendar,
  Trophy,
  Calculator,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import CollegeInfoTabs from "@/components/CollegeInfo/CollegeInfoTabs";
import CheckChancesButton from "@/components/CollegeInfo/CheckChancesButton";
import AdmissionChancesDisplay from "@/components/CollegeInfo/AdmissionChancesDisplay";
import { useCollege } from "@/hooks/useColleges";
import EnhancedCheckChancesButton from "@/components/CollegeInfo/EnhancedCheckChancesButton";

const CollegeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: college, isLoading, error } = useCollege(parseInt(id || "0"));
  const [admissionChance, setAdmissionChance] = useState<number | null>(null);
  const [userScores, setUserScores] = useState<{
    cetScore: number;
    stream: string;
    category: string;
  } | null>(null);
  const [navigationSource, setNavigationSource] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Check navigation source on component mount
  useEffect(() => {
    const source = sessionStorage.getItem("navigationSource");
    setNavigationSource(source);
  }, []);

  const handleAdmissionCalculated = (
    chance: number,
    cetScore: number,
    stream: string,
    category: string,
  ) => {
    setAdmissionChance(chance);
    setUserScores({ cetScore, stream, category });
  };

  const handleBackNavigation = () => {
    if (navigationSource === "recommendations") {
      sessionStorage.removeItem("navigationSource");
      navigate("/recommendations/results");
    } else if (navigationSource === "diploma-recommendations") {
      sessionStorage.removeItem("navigationSource");
      navigate("/diploma-recommendations/results");
    } else {
      navigate("/colleges");
    }
  };

  // Helper function to format values - ALL null values become '--'
  const formatValue = (value?: number | string | null): string => {
    if (value === null || value === undefined || value === 0 || value === "")
      return "--";
    return value.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Loading college details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4">
              College Not Found
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              The college you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => navigate("/colleges")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Colleges
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative">
      <Navigation />

      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-[1]">
        <Button
          onClick={handleBackNavigation}
          variant="outline"
          className={`mb-4 sm:mb-6 transition-all duration-200 ${
            navigationSource === "recommendations" ||
            navigationSource === "diploma-recommendations"
              ? "hover:bg-blue-50 hover:border-blue-300 border-blue-200"
              : "hover:bg-purple-50 hover:border-purple-300"
          }`}
        >
          <ArrowLeft className="mr-2" size={20} />
          <span className="hidden sm:inline">
            {navigationSource === "recommendations" ||
            navigationSource === "diploma-recommendations"
              ? "Back to Recommendations"
              : "Back to Colleges"}
          </span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* College Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm relative z-[5]">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-8">
                <div className="flex-shrink-0 self-center sm:self-start">
                  {imageError ? (
                    <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-2 sm:p-4 shadow-lg mx-auto sm:mx-0 flex items-center justify-center border border-purple-100">
                      <Building className="w-10 h-10 sm:w-16 sm:h-16 text-purple-300" />
                    </div>
                  ) : (
                    <img
                      src={`/img/${college.id}.png`}
                      onError={() => setImageError(true)}
                      alt={`${college.name} logo`}
                      className="w-20 h-20 sm:w-32 sm:h-32 rounded-2xl object-contain bg-gradient-to-br from-purple-50 to-pink-50 p-2 sm:p-4 shadow-lg mx-auto sm:mx-0"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6 text-center sm:text-left">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
                      {college.name}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-3 sm:mb-4">
                      <MapPin className="mr-2 text-purple-500" size={18} />
                      <span className="text-lg sm:text-xl">
                        {college.city}, Maharashtra
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
                      <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 sm:px-4 py-2 rounded-full">
                        <Star
                          className="mr-2 text-yellow-500 fill-current"
                          size={16}
                        />
                        <span className="font-bold text-orange-700 text-sm sm:text-base">
                          {college.rating ? `${college.rating} Rating` : "--"}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 sm:px-4 py-2"
                      >
                        <Building className="mr-1 sm:mr-2" size={14} />
                        <span className="text-xs sm:text-sm">
                          {formatValue(college.college_type)}
                        </span>
                      </Badge>
                      <Badge variant="outline" className="px-3 sm:px-4 py-2">
                        <span className="text-xs sm:text-sm">
                          {college.coursesOffered
                            ? `${college.coursesOffered} Engineering Streams`
                            : "Multiple Streams"}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {/* Institution Details - Mobile Optimized */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                      Institution Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Established Year:</span>
                        <div className="font-medium text-gray-800">
                          {formatValue(college.established)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Other Names:</span>
                        <div className="font-medium text-gray-800 break-words">
                          {formatValue(college.otherNames)}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Address:</span>
                        <div className="font-medium text-gray-800 break-words">
                          {college.address ||
                            college.locationDetails?.address ||
                            `${college.city}, Maharashtra`}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Website:</span>
                        <div className="font-medium text-gray-800 break-all">
                          {college.website ? (
                            <a
                              href={college.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {college.website}
                            </a>
                          ) : (
                            "--"
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Affiliation:</span>
                        <div className="font-medium text-gray-800">
                          {formatValue(college.affiliation)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">NAAC Grade:</span>
                        <div className="font-medium text-gray-800">
                          {formatValue(college.naacGrade)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Faculty Ratio:</span>
                        <div className="font-medium text-gray-800">
                          {formatValue(college.totalFaculty)}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">NIRF Ranking:</span>
                        <div className="font-medium text-gray-800">
                          {formatValue(college.nirf_ranking)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Check Chances Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          {admissionChance === null ? (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 relative z-[5]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                      Check Your Admission Chances
                    </h3>
                    <p className="text-blue-600 text-sm">
                      Calculate your probability of getting admission to{" "}
                      {college.name}
                    </p>
                  </div>
                  <div className="flex justify-center sm:block">
                    <EnhancedCheckChancesButton
                      college={college}
                      onChancesCalculated={handleAdmissionCalculated}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 relative z-[5]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-2">
                      Your Admission Chances: {admissionChance}%
                    </h3>
                    <p className="text-green-600 text-sm">
                      For {userScores?.stream} • CET: {userScores?.cetScore}%ile
                    </p>
                  </div>
                  <div className="flex justify-center sm:block">
                    <EnhancedCheckChancesButton
                      college={college}
                      onChancesCalculated={handleAdmissionCalculated}
                      variant="compact"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Institution Quick Stats - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-[5]">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border border-green-200">
              <div className="flex items-center mb-2">
                <IndianRupee
                  className="mr-1 sm:mr-2 text-green-600"
                  size={16}
                />
                <span className="text-green-600 font-medium text-xs sm:text-sm">
                  Annual Fees
                </span>
              </div>
              <div className="font-bold text-base sm:text-xl text-green-700">
                {college.fees
                  ? `₹${(college.fees / 100000).toFixed(1)}L`
                  : "--"}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl border border-blue-200">
              <div className="flex items-center mb-2">
                <Users className="mr-1 sm:mr-2 text-blue-600" size={16} />
                <span className="text-blue-600 font-medium text-xs sm:text-sm">
                  Total Intake
                </span>
              </div>
              <div className="font-bold text-base sm:text-xl text-blue-700">
                {formatValue(college.totalIntake)}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 sm:p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center mb-2">
                <TrendingUp
                  className="mr-1 sm:mr-2 text-emerald-600"
                  size={16}
                />
                <span className="text-emerald-600 font-medium text-xs sm:text-sm">
                  Placement Rate
                </span>
              </div>
              <div className="font-bold text-base sm:text-xl text-emerald-700">
                {college.placement ? `${college.placement}%` : "--"}
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 sm:p-4 rounded-xl border border-orange-200">
              <div className="flex items-center mb-2">
                <Trophy className="mr-1 sm:mr-2 text-orange-600" size={16} />
                <span className="text-orange-600 font-medium text-xs sm:text-sm">
                  Highest Package
                </span>
              </div>
              <div className="font-bold text-base sm:text-xl text-orange-700">
                {college.placementDetails?.highestPackage
                  ? `₹${college.placementDetails.highestPackage.toFixed(1)}L`
                  : "--"}
              </div>
            </div>
          </div>
        </div>

        {/* College Details Tabs */}
        <div className="relative z-[5]">
          <CollegeInfoTabs college={college} />
        </div>
      </div>
    </div>
  );
};

export default CollegeDetails;
