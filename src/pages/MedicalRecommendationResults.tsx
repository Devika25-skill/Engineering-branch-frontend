import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Lock, Unlock, Sparkles } from "lucide-react";
import { useMedicalRecommendation } from "@/hooks/useMedicalRecommendation";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useAuth } from "@/contexts/AuthContext";
import { NoResultsState } from "@/components/recommendations/NoResultsState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { config } from '@/config/env';

interface FormData {
  name: string;
  email: string;
  mobile: string;
  couponCode: string;
}

const MedicalRecommendationResults = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { isGenerating } = useMedicalRecommendation();
  const [formData, setFormData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [activeChanceFilter, setActiveChanceFilter] = useState<string>('All');
  const [activeRound, setActiveRound] = useState<string>('round1');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const [paymentFormData, setPaymentFormData] = useState<FormData>({
    name: userFromStorage.name || '',
    email: userFromStorage.email || '',
    mobile: '',
    couponCode: 'LAUNCHOFFER'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const cached = recommendationStorage.getMedicalRecommendations();
        const savedFormData = recommendationStorage.getFormData();
        const paidStatus = recommendationStorage.getMedicalPaidStatus();

        if (cached && savedFormData) {
          setRecommendations(cached);
          setFormData(savedFormData);
          setIsPaid(paidStatus);
          setIsLoading(false);
        } else if (isLoggedIn) {
          navigate('/recommendations');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading recommendations:', error);
        navigate('/recommendations');
      }
    };

    loadRecommendations();
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      setPaymentFormData(prev => ({
        ...prev,
        name: parsed.name || '',
        email: parsed.email || '',
        mobile: parsed.mobile || ''
      }));
    }
  }, []);

  const handleDownloadPDF = () => {
    if (!isPaid) {
      toast({
        title: "Download Locked",
        description: "Please upgrade to download the PDF report.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "PDF Download",
      description: "PDF download functionality coming soon!",
    });
  };

  const getChanceFilterStats = () => {
    if (!recommendations.length) return { High: 0, Medium: 0, Low: 0 };
    
    return recommendations.reduce((acc, rec) => {
      const chance = parseInt(rec.admission_chance);
      if (chance >= 70) acc.High++;
      else if (chance >= 40) acc.Medium++;
      else acc.Low++;
      return acc;
    }, { High: 0, Medium: 0, Low: 0 });
  };

  const getFilteredRecommendations = () => {
    if (activeChanceFilter === 'All') return recommendations;
    
    return recommendations.filter(rec => {
      const chance = parseInt(rec.admission_chance);
      if (activeChanceFilter === 'High') return chance >= 70;
      if (activeChanceFilter === 'Medium') return chance >= 40 && chance < 70;
      if (activeChanceFilter === 'Low') return chance < 40;
      return true;
    });
  };

  const shouldShowUnlock = () => {
    return !isPaid && filteredRecommendations.length > 5;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setPaymentFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!paymentFormData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return false;
    }
    if (!paymentFormData.email.trim()) {
      toast({ title: "Email is required", variant: "destructive" });
      return false;
    }
    if (!paymentFormData.mobile.trim() || paymentFormData.mobile.length !== 10) {
      toast({ title: "Valid 10-digit mobile number is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const getDiscountedPrice = () => {
    const originalPrice = 299;
    if (paymentFormData.couponCode.toUpperCase() === 'LAUNCHOFFER') {
      return { original: originalPrice, final: 199, discount: 100 };
    }
    return { original: originalPrice, final: originalPrice, discount: 0 };
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsDialogOpen(false);
    
    toast({
      title: "Payment Successful!",
      description: "All medical recommendations have been unlocked.",
    });

    localStorage.setItem('medicalRecommendationUnlocked', 'true');
    localStorage.setItem('userData', JSON.stringify(paymentFormData));
    setIsPaid(true);
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <StepLoadingMessages />
        </div>
      </div>
    );
  }

  const getProbabilityColor = (chance: string) => {
    const probability = parseInt(chance);
    if (probability >= 70) return "text-green-600";
    if (probability >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProbabilityBadgeColor = (chance: string) => {
    const probability = parseInt(chance);
    if (probability >= 70) return "bg-green-100 text-green-800 border-green-200";
    if (probability >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getCollegeTypeColor = (type: string) => {
    if (type.toLowerCase().includes('govt') || type.toLowerCase().includes('aided')) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (type.toLowerCase().includes('private')) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const chanceStats = getChanceFilterStats();
  const filteredRecommendations = getFilteredRecommendations();
  const displayedRecommendations = isPaid ? filteredRecommendations : filteredRecommendations.slice(0, 5);
  const { original: originalPrice, final: finalPrice, discount } = getDiscountedPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-1 sm:mb-1">
          <Link to="/recommendations/steps">
            <Button variant="outline" className="rounded-lg hover:shadow-md transition-all duration-200 w-full sm:w-auto">
              <ArrowLeft size={16} className="mr-2" />
              Back to Form
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            Your Medical College Recommendations
          </h1>
        </div>

        <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="round1">Round 1</TabsTrigger>
            <TabsTrigger value="round2" disabled>Round 2</TabsTrigger>
            <TabsTrigger value="round3" disabled>Round 3</TabsTrigger>
          </TabsList>

          <TabsContent value="round1" className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-2">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-xl sm:text-2xl font-bold text-primary">{recommendations.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">NEET Rank</p>
                    <p className="text-xl sm:text-2xl font-bold">{formData?.neetAllIndiaRank}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Category</p>
                    <p className="text-base sm:text-lg font-semibold">{formData?.reservationCategory}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                    <Badge variant={isPaid ? "default" : "secondary"} className="text-xs">
                      {isPaid ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={handleDownloadPDF} 
                    variant="outline" 
                    size="sm"
                    className="flex-1 sm:flex-initial"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>

                {!isPaid && recommendations.length > 5 && (
                  <div className="mt-4 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Free Preview:</strong> Showing 5 of {recommendations.length} recommendations. 
                      Unlock all to see complete list with detailed insights.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chance Filter */}
            <div className="flex justify-center">
              <div className="flex gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg border">
                {['All', 'High', 'Medium', 'Low'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveChanceFilter(filter)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      activeChanceFilter === filter
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {filter}
                    {filter !== 'All' && (
                      <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {chanceStats[filter as keyof typeof chanceStats]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {displayedRecommendations.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {displayedRecommendations.map((college, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3">
                        {/* Index */}
                        <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-tight mb-2">
                                {college.college_name}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={getCollegeTypeColor(college.college_type)}>
                                  {college.college_type}
                                </Badge>
                                <Badge className={getProbabilityBadgeColor(college.admission_chance)}>
                                  {college.admission_chance} Chance
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Program</p>
                              <p className="font-semibold">{college.program}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">City</p>
                              <p className="font-semibold">{college.city}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Closing Rank</p>
                              <p className="font-semibold">{college.closing_rank.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Quota</p>
                              <div className="flex flex-wrap gap-1">
                                {college.quota.map((q: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {q}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500">
                            Code: {college.college_code}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Unlock Section */}
                {shouldShowUnlock() && (
                  <div className="relative mt-4">
                    {/* Unlock Banner */}
                    <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-4 border-2 border-green-200">
                      <Lock className="mx-auto mb-3 text-green-600" size={32} />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        🔒 Unlock All Recommendations
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {filteredRecommendations.length - 5} more medical college recommendations waiting
                      </p>

                      {/* Unlock Dialog */}
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                          >
                            <Unlock size={16} />
                            Unlock Now
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-md z-[9999]">
                          <DialogHeader>
                            <DialogTitle className="text-center">Unlock Medical Recommendations</DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Pricing Section */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                              <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="text-lg text-gray-500 line-through">₹{originalPrice}</span>
                                <span className="text-2xl font-bold text-green-600">₹{finalPrice}</span>
                              </div>
                              <p className="text-sm text-green-700">
                                Save ₹{discount} with Launch Offer!
                              </p>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                  id="name"
                                  value={paymentFormData.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  placeholder="Enter your full name"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={paymentFormData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  placeholder="Enter your email"
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="mobile">Mobile Number *</Label>
                                <Input
                                  id="mobile"
                                  value={paymentFormData.mobile}
                                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                                  placeholder="Enter your mobile number"
                                  maxLength={10}
                                  required
                                />
                              </div>

                              <div>
                                <Label htmlFor="coupon">Coupon Code</Label>
                                <Input
                                  id="coupon"
                                  value={paymentFormData.couponCode}
                                  onChange={(e) => handleInputChange('couponCode', e.target.value)}
                                  placeholder="Enter coupon code"
                                />
                              </div>
                            </div>

                            {/* Payment Button */}
                            <Button
                              onClick={handlePayment}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                            >
                              Pay ₹{finalPrice} & Unlock
                            </Button>

                            <p className="text-xs text-gray-500 text-center">
                              Secure payment powered by Razorpay
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Blurred cards */}
                    <div className="blur-sm pointer-events-none space-y-4">
                      {filteredRecommendations.slice(5, 8).map((college, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardContent className="p-4 sm:p-6">
                            <div className="h-32 bg-gray-100 rounded animate-pulse" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NoResultsState />
            )}
          </TabsContent>

          <TabsContent value="round2">
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Round 2 Coming Soon</h3>
              <p className="text-gray-600">Round 2 recommendations will be available after the counseling process.</p>
            </Card>
          </TabsContent>

          <TabsContent value="round3">
            <Card className="p-8 text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">Round 3 Coming Soon</h3>
              <p className="text-gray-600">Round 3 recommendations will be available after the counseling process.</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feedback Section */}
        <div className="mt-8">
          <FeedbackSection />
        </div>
      </div>
    </div>
  );
};

export default MedicalRecommendationResults;
