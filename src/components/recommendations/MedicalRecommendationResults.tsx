import { useState, useEffect } from 'react';
import { MedicalCollegeRecommendation } from "@/types/medical";
import { Lock, Unlock, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { config } from '@/config/env';
import { usePdfDownloadDSY } from "@/hooks/usePdfDownloadDSY";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendationHeader } from "./RecommendationHeader";
import { RecommendationDisclaimer } from "./RecommendationDisclaimer";
import { CAPFormInstructions } from "./CAPFormInstructions";
import { NoResultsState } from "./NoResultsState";
import { CategoryFilter } from "./CategoryFilter";

interface MedicalRecommendationResultsProps {
  recommendations: {
    Dream: MedicalCollegeRecommendation[];
    Reach: MedicalCollegeRecommendation[];
    Match: MedicalCollegeRecommendation[];
    Safety: MedicalCollegeRecommendation[];
  };
  formData: any;
  recommendationId?: string | null;
  paymentData?: {
    is_payment?: boolean;
    accept_payment?: boolean;
  };
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  couponCode: string;
}

interface PaymentInitiateResponse {
  message: string;
  success: boolean;
  data: {
    razorpay_key: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    username: string;
    contact: number;
    email: string;
  };
}

interface PaymentVerifyResponse {
  message: string;
  success: boolean;
  data: {};
  detail?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const MedicalRecommendationResults = ({
  recommendations,
  formData,
  recommendationId,
  paymentData
}: MedicalRecommendationResultsProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Initialize with Round 2 as default and persist selection
  const [activeRound, setActiveRound] = useState<string>(() => {
    const savedRound = localStorage.getItem('activeRoundTab');
    return savedRound || 'round2'; // Default to Round 2
  });
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const { generatePDF, isGenerating } = usePdfDownloadDSY();

  const [paymentFormData, setPaymentFormData] = useState<FormData>({
    name: userFromStorage.name || '',
    email: userFromStorage.email || '',
    mobile: '',
    couponCode: 'LAUNCHOFFER'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    if (!isUnlocked && paymentData?.is_payment !== true) {
      toast({
        title: "Download Locked",
        description: "Please unlock recommendations to download the PDF report.",
        variant: "destructive"
      });
      return;
    }

    // Convert to flat array for PDF generation
    const flatRecommendations = Object.values(recommendations).flat();
    generatePDF(flatRecommendations as any, formData);
  };
  
  // Load user data from localStorage
  useEffect(() => {
    const isUnlocked: any = localStorage.getItem('medicalRecommendationUnlocked')
    setIsUnlocked(isUnlocked === "true")
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

  // Determine if unlock functionality should be shown
  const shouldShowUnlock = () => {
    // If payment data explicitly states payment is done or not accepted, don't show unlock
    if (paymentData?.is_payment === true || paymentData?.accept_payment === false) {
      return false;
    }
    // Otherwise show unlock if not already unlocked
    return !isUnlocked;
  };

  // Persist active round to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeRoundTab', activeRound);
  }, [activeRound]);

  const calculatePrice = () => {
    const originalPrice = 999;
    const discount = 60; // 60% discount
    const finalPrice = Math.round(originalPrice * (1 - discount / 100));
    return { originalPrice, finalPrice, discount };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({ ...prev, [name]: value }));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (): Promise<PaymentInitiateResponse> => {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/user/payment/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: paymentFormData.email,
        mobile: paymentFormData.mobile,
        payment_type: 'MEDICAL_RECOMMENDATIONS',
        coupon_code: paymentFormData.couponCode,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment initiation failed');
    }

    return response.json();
  };

  const verifyPayment = async (
    razorpay_payment_id: string,
    razorpay_order_id: string,
    razorpay_signature: string
  ): Promise<PaymentVerifyResponse> => {
    const response = await fetch(`${config.apiBaseUrl}/api/v1/user/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        username: paymentFormData.email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment verification failed');
    }

    return response.json();
  };

  const handlePayment = async () => {
    // Validation
    if (!paymentFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!paymentFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!paymentFormData.mobile.trim() || !/^[0-9]{10}$/.test(paymentFormData.mobile)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Initiate payment
      const paymentData = await initiatePayment();

      // Configure Razorpay options
      const options = {
        key: paymentData.data.razorpay_key,
        amount: paymentData.data.amount,
        currency: paymentData.data.currency,
        name: 'Future Bridge',
        description: 'Unlock Medical College Recommendations',
        order_id: paymentData.data.order_id,
        prefill: {
          name: paymentFormData.name,
          email: paymentFormData.email,
          contact: paymentFormData.mobile,
        },
        theme: {
          color: '#3b82f6',
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            // Store unlock status and user data
            localStorage.setItem('recommendationUnlocked', 'true');
            localStorage.setItem('userData', JSON.stringify({
              name: paymentFormData.name,
              email: paymentFormData.email,
              mobile: paymentFormData.mobile,
            }));

            setIsUnlocked(true);
            setIsDialogOpen(false);

            toast({
              title: "Payment Successful!",
              description: "All recommendations have been unlocked. You can now view and download the complete list.",
            });
          } catch (error: any) {
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if the amount was deducted.",
              variant: "destructive"
            });
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process.",
              variant: "destructive"
            });
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryStats = () => {
    return {
      All: Object.values(recommendations).flat().length,
      Dream: recommendations.Dream?.length || 0,
      Reach: recommendations.Reach?.length || 0,
      Match: recommendations.Match?.length || 0,
      Safety: recommendations.Safety?.length || 0,
    };
  };

  const sortRecommendationsByCategory = (recs: MedicalCollegeRecommendation[]) => {
    const categoryOrder = { Dream: 1, Reach: 2, Match: 3, Safety: 4 };
    return [...recs].sort((a, b) => {
      const categoryDiff = categoryOrder[a.category as keyof typeof categoryOrder] - 
                          categoryOrder[b.category as keyof typeof categoryOrder];
      if (categoryDiff !== 0) return categoryDiff;
      return (a.closing_rank || 0) - (b.closing_rank || 0);
    });
  };

  const getCategorizedRecommendations = () => {
    const allRecs = Object.values(recommendations).flat();
    
    if (activeCategory === 'All') {
      return sortRecommendationsByCategory(allRecs);
    }
    
    const filtered = allRecs.filter(rec => rec.category === activeCategory);
    return sortRecommendationsByCategory(filtered);
  };

  const filteredRecommendations = getCategorizedRecommendations();
  const categoryStats = getCategoryStats();

  const shouldBlurResults = shouldShowUnlock();
  const visibleRecommendations = shouldBlurResults && !isUnlocked
    ? filteredRecommendations.slice(0, 5)
    : filteredRecommendations;

  const hiddenCount = shouldBlurResults ? filteredRecommendations.length - visibleRecommendations.length : 0;
  
  const { originalPrice, finalPrice, discount } = calculatePrice();

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
                  {isLocked ? `Unlock Round ${roundNumber} Predictions` : `Round ${roundNumber} Coming Soon`}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  {isLocked 
                    ? `Get access to Round ${roundNumber} college predictions based on historical cutoff trends and expert analysis. Unlock now to view all recommendations!`
                    : `Round ${roundNumber} predictions will be available once the official cutoff data is released by the admission authorities.`
                  }
                </p>
              </div>

              {isLocked && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Unlock className="mr-2 h-5 w-5" />
                        Unlock All Rounds Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center mb-2">
                          Unlock Complete Recommendations
                        </DialogTitle>
                        <p className="text-center text-muted-foreground">
                          Get access to all college predictions for Rounds 1, 2, and 3
                        </p>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        {/* Pricing */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl text-muted-foreground line-through">
                                ₹{originalPrice}
                              </span>
                              <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                                {discount}% OFF
                              </Badge>
                            </div>
                            <div className="text-4xl font-bold text-primary">
                              ₹{finalPrice}
                            </div>
                            <p className="text-sm text-muted-foreground">One-time payment • Lifetime access</p>
                          </div>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              value={paymentFormData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={paymentFormData.email}
                              onChange={handleInputChange}
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input
                              id="mobile"
                              name="mobile"
                              type="tel"
                              value={paymentFormData.mobile}
                              onChange={handleInputChange}
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                            <Input
                              id="couponCode"
                              name="couponCode"
                              value={paymentFormData.couponCode}
                              onChange={handleInputChange}
                              placeholder="Enter coupon code"
                            />
                          </div>
                        </div>

                        {/* Payment Button */}
                        <Button
                          onClick={handlePayment}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Clock className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-2 h-5 w-5" />
                              Pay ₹{finalPrice} & Unlock Now
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          Secure payment powered by Razorpay • Your data is safe with us
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {!isLocked && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                  <Clock className="w-4 h-4" />
                  <span>Check back after official cutoffs are announced</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <CAPFormInstructions />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RecommendationHeader formData={formData} />

      <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="round1">Round 1</TabsTrigger>
          <TabsTrigger value="round2">Round 2</TabsTrigger>
          <TabsTrigger value="round3">Round 3</TabsTrigger>
        </TabsList>

        <TabsContent value="round1" className="space-y-6">
          <RecommendationDisclaimer />
          
          <div className="flex flex-wrap gap-2">
            {(['All', 'Dream', 'Reach', 'Match', 'Safety'] as const).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category} ({categoryStats[category]})
              </Button>
            ))}
          </div>

          {filteredRecommendations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recommendations found for this category.</p>
              <Button onClick={() => setActiveCategory('All')} variant="outline" className="mt-4">
                View All Categories
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visibleRecommendations.map((rec, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{rec.college.college_name}</CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{rec.college.college_type}</Badge>
                            <Badge variant="secondary">{rec.program}</Badge>
                            <Badge variant="secondary">{rec.college.city}</Badge>
                            <Badge 
                              className={
                                rec.category === 'Dream' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                rec.category === 'Reach' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                rec.category === 'Match' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              }
                            >
                              {rec.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Your Rank</p>
                          <p className="font-semibold">{rec.neet_rank.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Closing Rank</p>
                          <p className="font-semibold">{rec.closing_rank.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reservation</p>
                          <p className="font-semibold">{rec.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Admission Probability</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                rec.admission_probability >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                rec.admission_probability >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                rec.admission_probability >= 25 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }
                            >
                              {rec.admission_probability}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{rec.probability_message}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
                          Unlock all {filteredRecommendations.length} personalized medical college recommendations to maximize your admission chances!
                        </p>
                      </div>

                      <div className="flex flex-col items-center gap-4 mt-6">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="lg"
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Unlock className="mr-2 h-5 w-5" />
                              Unlock All Recommendations
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-center mb-2">
                                Unlock Complete Recommendations
                              </DialogTitle>
                              <p className="text-center text-muted-foreground">
                                Get access to all medical college predictions
                              </p>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              {/* Pricing */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                <div className="text-center space-y-2">
                                  <div className="flex items-center justify-center gap-3">
                                    <span className="text-2xl text-muted-foreground line-through">
                                      ₹{originalPrice}
                                    </span>
                                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1">
                                      {discount}% OFF
                                    </Badge>
                                  </div>
                                  <div className="text-4xl font-bold text-primary">
                                    ₹{finalPrice}
                                  </div>
                                  <p className="text-sm text-muted-foreground">One-time payment • Lifetime access</p>
                                </div>
                              </div>

                              {/* Form */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name">Full Name *</Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    value={paymentFormData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="email">Email Address *</Label>
                                  <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={paymentFormData.email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="mobile">Mobile Number *</Label>
                                  <Input
                                    id="mobile"
                                    name="mobile"
                                    type="tel"
                                    value={paymentFormData.mobile}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    required
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                                  <Input
                                    id="couponCode"
                                    name="couponCode"
                                    value={paymentFormData.couponCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter coupon code"
                                  />
                                </div>
                              </div>

                              {/* Payment Button */}
                              <Button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                size="lg"
                              >
                                {isLoading ? (
                                  <>
                                    <Clock className="mr-2 h-5 w-5 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="mr-2 h-5 w-5" />
                                    Pay ₹{finalPrice} & Unlock Now
                                  </>
                                )
                              }</Button>

                              <p className="text-xs text-center text-muted-foreground">
                                Secure payment powered by Razorpay • Your data is safe with us
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          
          <CAPFormInstructions />
        </TabsContent>

        <TabsContent value="round2">
          {renderUpcomingRound(2)}
        </TabsContent>

        <TabsContent value="round3">
          {renderUpcomingRound(3)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
