import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Unlock, Sparkles } from "lucide-react";
import { useMedicalRecommendation } from "@/hooks/useMedicalRecommendation";
import { recommendationStorage } from "@/services/recommendationStorage";
import StepLoadingMessages from '@/components/recommendations/StepLoadingMessages';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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
  const [recommendations, setRecommendations] = useState<any>({
    Dream: [],
    Reach: [],
    Match: [],
    Safety: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
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

  const getCategoryStats = () => {
    return {
      Dream: recommendations.Dream?.length || 0,
      Reach: recommendations.Reach?.length || 0,
      Match: recommendations.Match?.length || 0,
      Safety: recommendations.Safety?.length || 0
    };
  };

  const getTotalRecommendations = () => {
    const stats = getCategoryStats();
    return stats.Dream + stats.Reach + stats.Match + stats.Safety;
  };

  const getFilteredRecommendations = () => {
    if (activeCategory === 'All') {
      return [
        ...(recommendations.Dream || []),
        ...(recommendations.Reach || []),
        ...(recommendations.Match || []),
        ...(recommendations.Safety || [])
      ];
    }
    return recommendations[activeCategory] || [];
  };

  const shouldShowUnlock = () => {
    const totalRecs = getTotalRecommendations();
    return !isPaid && totalRecs > 5;
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

  const handlePayment = () => {
    if (!validateForm()) return;
    
    setIsPaid(true);
    recommendationStorage.setMedicalPaidStatus(true);
    localStorage.setItem('userData', JSON.stringify(paymentFormData));
    
    setIsDialogOpen(false);
    toast({
      title: "Payment Successful!",
      description: "You now have access to all recommendations and features.",
    });
  };

  const categoryStats = getCategoryStats();
  const totalRecommendations = getTotalRecommendations();
  const filteredRecommendations = getFilteredRecommendations();
  const displayedRecommendations = isPaid ? filteredRecommendations : filteredRecommendations.slice(0, 5);
  const hiddenCount = isPaid ? 0 : Math.max(0, filteredRecommendations.length - 5);
  const discountedPrice = getDiscountedPrice();

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <StepLoadingMessages />
        </div>
      </div>
    );
  }

  if (!recommendations || totalRecommendations === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Recommendations Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any medical college recommendations based on your criteria.
            </p>
            <Button onClick={() => navigate('/recommendations')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/recommendations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recommendations
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Medical College Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized suggestions based on your NEET score and preferences
          </p>
        </div>

        <Tabs value={activeRound} onValueChange={setActiveRound} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="round1">Round 1</TabsTrigger>
            <TabsTrigger value="round2" disabled>Round 2</TabsTrigger>
            <TabsTrigger value="round3" disabled>Round 3</TabsTrigger>
          </TabsList>

          <TabsContent value="round1" className="space-y-6">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold">{totalRecommendations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NEET Rank</p>
                    <p className="text-2xl font-bold">{formData?.neetAllIndiaRank?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-2xl font-bold">{formData?.reservationCategory || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={isPaid ? "default" : "secondary"}>
                      {isPaid ? <><Unlock className="w-3 h-3 mr-1" /> Full Access</> : <><Lock className="w-3 h-3 mr-1" /> Limited</>}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 mb-6">
              {(['All', 'Dream', 'Reach', 'Match', 'Safety'] as const).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  size="sm"
                >
                  {category}
                  {category !== 'All' && (
                    <Badge variant="secondary" className="ml-2">
                      {categoryStats[category]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {displayedRecommendations.map((rec: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rec.college.college_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.college.college_type} • {rec.college.city}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          rec.admission_probability >= 70
                            ? 'default' 
                            : rec.admission_probability >= 40
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {rec.admission_probability}% Chance
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 p-3 bg-muted rounded-md">
                      <p className="text-sm">{rec.probability_message}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Program</p>
                        <p className="font-medium">{rec.program}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{rec.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Your NEET Rank</p>
                        <p className="font-medium">{rec.neet_rank?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Closing Rank</p>
                        <p className="font-medium">{rec.closing_rank?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {shouldShowUnlock() && (
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Lock className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          Unlock {hiddenCount} More Recommendations
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Get access to all medical college recommendations and detailed insights
                        </p>
                      </div>
                      
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg" className="gap-2">
                            <Sparkles className="h-5 w-5" />
                            Unlock Now - ₹{discountedPrice.final}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Unlock Full Access</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-primary/5 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground line-through">₹{discountedPrice.original}</span>
                                <Badge>Save ₹{discountedPrice.discount}</Badge>
                              </div>
                              <div className="text-2xl font-bold text-primary">₹{discountedPrice.final}</div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={paymentFormData.name}
                                  onChange={(e) => handleInputChange('name', e.target.value)}
                                  placeholder="Enter your full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={paymentFormData.email}
                                  onChange={(e) => handleInputChange('email', e.target.value)}
                                  placeholder="Enter your email"
                                />
                              </div>
                              <div>
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                  id="mobile"
                                  type="tel"
                                  value={paymentFormData.mobile}
                                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                                  placeholder="Enter 10-digit mobile number"
                                  maxLength={10}
                                />
                              </div>
                              <div>
                                <Label htmlFor="coupon">Coupon Code (Optional)</Label>
                                <Input
                                  id="coupon"
                                  value={paymentFormData.couponCode}
                                  onChange={(e) => handleInputChange('couponCode', e.target.value)}
                                  placeholder="Enter coupon code"
                                />
                              </div>
                            </div>

                            <Button onClick={handlePayment} className="w-full" size="lg">
                              Pay & Unlock ₹{discountedPrice.final}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="round2">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Round 2 recommendations will be available soon</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="round3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Round 3 recommendations will be available soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <FeedbackSection />
      </div>
    </div>
  );
};

export default MedicalRecommendationResults;
