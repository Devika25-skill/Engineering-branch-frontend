import { useState, useEffect } from 'react';
import { MedicalCollegeRecommendation } from "@/types/medical";
import { Lock, Unlock, Calendar, Clock, MapPin, Users, TrendingUp, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { config } from '@/config/env';
import { usePdfDownloadMedical } from "@/hooks/usePdfDownloadMedical";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecommendationHeader } from "./RecommendationHeader";
import { RecommendationDisclaimer } from "./RecommendationDisclaimer";
import { CAPFormInstructions } from "./CAPFormInstructions";
import { NoResultsState } from "./NoResultsState";
import { MedicalRound2Tab } from "./MedicalRound2Tab";

interface MedicalRecommendationResultsProps {
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
  activeRound?: string;
  onRoundChange?: (round: string) => void;
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
  paymentData,
  activeRound: externalActiveRound,
  onRoundChange
}: MedicalRecommendationResultsProps) => {
  // Use external activeRound if provided, otherwise use local state
  const [internalActiveRound, setInternalActiveRound] = useState<string>(() => {
    const sessionRound = sessionStorage.getItem('activeRound');
    if (sessionRound) {
      return sessionRound;
    }
    const savedRound = localStorage.getItem('activeRoundTab');
    return savedRound || 'round1';
  });
  
  const activeRound = externalActiveRound || internalActiveRound;
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const { generatePDF, isGenerating } = usePdfDownloadMedical();

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

    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your recommendations report...",
    });

    // Convert to flat array with category information for PDF generation
    const flatRecommendations = [
      ...recommendations.Dream.map((rec: any) => ({ ...rec, category: 'Dream' })),
      ...recommendations.Reach.map((rec: any) => ({ ...rec, category: 'Reach' })),
      ...recommendations.Match.map((rec: any) => ({ ...rec, category: 'Match' })),
      ...recommendations.Safety.map((rec: any) => ({ ...rec, category: 'Safety' }))
    ];
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

  // Handle tab change
  const handleTabChange = (newRound: string) => {
    if (onRoundChange) {
      onRoundChange(newRound);
    } else {
      setInternalActiveRound(newRound);
      localStorage.setItem('activeRoundTab', newRound);
      sessionStorage.setItem('activeRound', newRound);
    }
  };

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

  const sortRecommendationsByCategory = (recs: MedicalCollegeRecommendation[]) => {
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
    // Ensure recommendations has valid structure
    const validRecommendations = {
      Dream: Array.isArray(recommendations?.Dream) ? recommendations.Dream : [],
      Reach: Array.isArray(recommendations?.Reach) ? recommendations.Reach : [],
      Match: Array.isArray(recommendations?.Match) ? recommendations.Match : [],
      Safety: Array.isArray(recommendations?.Safety) ? recommendations.Safety : [],
    };
    
    const allRecs = Object.entries(validRecommendations).flatMap(([category, recs]) =>
      recs.map(rec => ({ ...rec, category }))
    );
    return sortRecommendationsByCategory(allRecs);
  };

  const filteredRecommendations = getCategorizedRecommendations();

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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RecommendationHeader formData={formData} />

      <Tabs value={activeRound} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="round1">Round 1</TabsTrigger>
          <TabsTrigger value="round2">Round 2</TabsTrigger>
          <TabsTrigger value="round3">Round 3</TabsTrigger>
        </TabsList>

        <TabsContent value="round1" className="space-y-6">
          <CAPFormInstructions />
          <RecommendationDisclaimer />

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredRecommendations.length}</span> college recommendations
              </p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={(!isUnlocked && paymentData?.is_payment !== true) || isGenerating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg min-h-[44px] touch-manipulation"
              aria-label="Download recommendations as PDF"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  <span className="text-sm font-medium">Download PDF</span>
                </>
              )}
            </Button>
          </div>

          {filteredRecommendations.length === 0 ? (
            <NoResultsState />
          ) : (
            <>
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

                  const getProbabilityColor = (probability: number) => {
                    if (probability >= 80) return "text-green-600";
                    if (probability >= 60) return "text-yellow-600";
                    return "text-red-600";
                  };

                  const truncateText = (text: string, maxLength: number) => {
                    if (!text) return "";
                    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
                  };

                  return (
                    <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                          {/* Index Number */}
                          <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>

                          {/* College Logo */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                              <span className="text-gray-600 text-xs font-bold">
                                {rec.college.college_name.charAt(0)}
                              </span>
                            </div>
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                  {truncateText(rec.college.college_name, 40)}
                                </h3>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                  <MapPin size={12} className="flex-shrink-0" />
                                  <span className="truncate">{rec.college.city}</span>
                                </div>
                              </div>
                              <Badge className={`${getCategoryColor(rec.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
                                {rec.category}
                              </Badge>
                            </div>

                            {/* Course Name */}
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-700 leading-snug">
                                {truncateText(rec.program, 60)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-2 pb-3">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-start gap-1">
                              <TrendingUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-600 leading-tight">Closing Rank</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {rec.closing_rank ? rec.closing_rank.toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-start gap-1">
                              <Users size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-600 leading-tight">Admission Chance</p>
                                <p className={`text-sm font-bold truncate ${getProbabilityColor(rec.admission_probability)}`}>
                                  {rec.admission_probability}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-start gap-1">
                              <Users size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-600 leading-tight">Your Rank</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {rec.neet_rank ? rec.neet_rank.toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="flex items-start gap-1">
                              <Users size={14} className="text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-600 leading-tight">College Type</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {rec.college.college_type || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* College Info */}
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-1 text-xs text-blue-700">
                            <Badge variant="outline" className="text-xs">
                              {rec.college.course_type}
                            </Badge>
                            <span className="text-gray-400">•</span>
                            <span className="font-medium">Code: {rec.college.college_code}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

                      {/* Blurred recommendation cards preview */}
                      <div className="blur-sm pointer-events-none space-y-4 mt-6">
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

                          const truncateText = (text: string, maxLength: number) => {
                            if (!text) return "";
                            return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
                          };

                          return (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden">
                              <CardHeader className="pb-2">
                                <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
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
                                      <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                          {truncateText(rec.college.college_name, 40)}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                          <MapPin size={12} className="flex-shrink-0" />
                                          <span className="truncate">{rec.college.city}</span>
                                        </div>
                                      </div>
                                      <Badge className={`${getCategoryColor(rec.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0`}>
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
                                    <p className="text-xs text-gray-600">Closing Rank</p>
                                    <p className="text-sm font-bold text-gray-900">
                                      {rec.closing_rank ? rec.closing_rank.toLocaleString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <p className="text-xs text-gray-600">Admission Chance</p>
                                    <p className="text-sm font-bold text-gray-900">
                                      {rec.admission_probability}%
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="round2">
          <MedicalRound2Tab />
        </TabsContent>

        <TabsContent value="round3">
          {renderUpcomingRound(3)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
