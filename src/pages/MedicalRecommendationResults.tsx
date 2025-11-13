import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, BookOpen } from "lucide-react";
import { useMedicalRecommendation } from "@/hooks/useMedicalRecommendation";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useAuth } from "@/contexts/AuthContext";

const MedicalRecommendationResults = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { isGenerating } = useMedicalRecommendation();
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Try to get cached recommendations
        const cached = recommendationStorage.getMedicalRecommendations();
        const savedFormData = recommendationStorage.getFormData();

        if (cached && savedFormData) {
          setRecommendations(cached);
          setFormData(savedFormData);
          setIsLoading(false);
        } else if (isLoggedIn) {
          // If logged in but no cached data, redirect to steps
          navigate('/recommendations');
        } else {
          // Not logged in, redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        navigate('/recommendations');
      }
    };

    loadRecommendations();
  }, [isLoggedIn, navigate]);

  if (isLoading || isGenerating) {
    return <StepLoadingMessages />;
  }

  const getProbabilityColor = (chance: string) => {
    const probability = parseInt(chance);
    if (probability >= 70) return "bg-green-500";
    if (probability >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCollegeTypeColor = (type: string) => {
    if (type.toLowerCase().includes('govt') || type.toLowerCase().includes('aided')) {
      return "bg-blue-500";
    }
    if (type.toLowerCase().includes('autonomous')) {
      return "bg-purple-500";
    }
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/recommendations')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Medical College Recommendations - Round 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Colleges</p>
                <p className="text-2xl font-bold">{recommendations.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NEET Rank</p>
                <p className="text-2xl font-bold">{formData?.neetAllIndiaRank}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold">{formData?.reservationCategory}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Type</p>
                <Badge variant={isPaid ? "default" : "secondary"}>
                  {isPaid ? "Premium" : "Free"}
                </Badge>
              </div>
            </div>

            {!isPaid && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Free users see limited recommendations (3 colleges with 20-30% admission chance). 
                  Upgrade to Premium to see all recommendations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your College Matches</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {recommendations.map((college, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{college.college_name}</h3>
                      <Badge variant="outline" className={getCollegeTypeColor(college.college_type)}>
                        {college.college_type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Program</p>
                        <p className="font-semibold">{college.program}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-semibold">{college.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Closing Rank</p>
                        <p className="font-semibold">{college.closing_rank.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quota</p>
                        <div className="flex flex-wrap gap-1">
                          {college.quota.map((q: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {q}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      className={`${getProbabilityColor(college.admission_chance)} text-white`}
                    >
                      {college.admission_chance} Chance
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Code: {college.college_code}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </div>
  );
};

export default MedicalRecommendationResults;
