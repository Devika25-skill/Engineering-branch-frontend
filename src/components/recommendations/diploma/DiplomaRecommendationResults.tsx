import { useState, useEffect } from 'react';
import { CollegeRecommendation } from "@/services/cutoffService";
import { DiplomaRecommendationCard } from "./DiplomaRecommendationCard";
import { DiplomaCategoryFilter } from "./DiplomaCategoryFilter";
import { DiplomaRecommendationHeader } from "./DiplomaRecommendationHeader";
import { DiplomaRecommendationDisclaimer } from "./DiplomaRecommendationDisclaimer";
import { CAPFormInstructions } from "../CAPFormInstructions";
import { NoResultsState } from "../NoResultsState";
import { Lock, Unlock, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { config } from '@/config/env';
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiplomaRound2Tab } from "./DiplomaRound2Tab";
import { usePdfDownloadDSY } from '@/hooks/usePdfDownloadDSY';

interface DiplomaRecommendationResultsProps {
  recommendations: CollegeRecommendation[];
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

export const DiplomaRecommendationResults = ({
  recommendations,
  formData,
  recommendationId,
  paymentData
}: DiplomaRecommendationResultsProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeRound, setActiveRound] = useState<string>('round1');
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

    generatePDF(recommendations, formData);
  };

  // Load user data from localStorage
  useEffect(() => {
    const isUnlocked: any = localStorage.getItem('diplomaRecommendationUnlocked')
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
    const isUnlocked: any = localStorage.getItem('diplomaRecommendationUnlocked')
    if (isUnlocked === "true") {
      return false;
    }
    return paymentData?.accept_payment === undefined;
  };

  const getDiscountedPrice = () => {
    let finalPrice = paymentFormData.couponCode.toUpperCase() === 'LAUNCHOFFER' ? 99 : 499;
    finalPrice = paymentFormData.couponCode.toUpperCase() === 'SJ-FB100FREE' ? 0 : finalPrice;
    finalPrice = paymentFormData.couponCode.toUpperCase() === 'LAUNCHOFFERTEST' ? 1 : finalPrice;
    return finalPrice;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setPaymentFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, mobile } = paymentFormData;

    if (!name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      toast({ title: "Error", description: "Valid email is required", variant: "destructive" });
      return false;
    }

    if (!mobile.trim() || mobile.length < 10) {
      toast({ title: "Error", description: "Valid mobile number is required", variant: "destructive" });
      return false;
    }

    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    const payload = {
      full_name: paymentFormData.name,
      email: paymentFormData.email,
      contact: parseInt(paymentFormData.mobile),
      product_type: "future-bridge-dsy",
      amount: getDiscountedPrice()
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/payment/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentInitiateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to initiate payment');
      }

      return data.data;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  };

  const verifyPayment = async (email: string, orderId: string) => {
    const payload = {
      email: email,
      order_id: orderId
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/payment/payment/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentVerifyResponse = await response.json();

      if (data.detail) {
        throw new Error(data.detail);
      }

      return data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const price = getDiscountedPrice();
      if (price > 0) {
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
          toast({ title: "Error", description: "Payment gateway failed to load", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        // Initiate payment
        const paymentData = await initiatePayment();

        // Immediately verify payment after initiation
        setTimeout(async () => {
          try {
            const verifyResult = await verifyPayment(paymentFormData.email, paymentData.order_id);
            if (verifyResult.success) {
              // Payment already completed
              toast({
                title: "Payment Successful!",
                description: "Your diploma recommendations have been unlocked."
              });

              localStorage.setItem('diplomaRecommendationUnlocked', 'true');
              localStorage.setItem('userData', JSON.stringify(paymentFormData));

              setIsUnlocked(true);
              setIsDialogOpen(false);
              setIsLoading(false);
            }
          } catch (error) {
            console.error('Payment verification check:', error);
          }
        }, 1000);

        // Set up 2-minute timer for payment timeout
        const paymentTimer = setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Payment Timeout",
            description: "Payment session expired. Please try again.",
            variant: "destructive"
          });
        }, 150000); // 2 minutes

        const options = {
          key: paymentData.razorpay_key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          order_id: paymentData.order_id,
          name: 'Diploma Recommendation Unlock',
          description: 'Unlock your personalized diploma college recommendations',
          prefill: {
            name: paymentFormData.name,
            email: paymentFormData.email,
            contact: paymentFormData.mobile,
          },
          timeout: 300,
          theme: {
            color: '#3B82F6',
          },
          handler: async function (response: any) {
            clearTimeout(paymentTimer);
            try {
              // Verify payment
              await verifyPayment(paymentFormData.email, paymentData.order_id);

              // Payment successful
              toast({
                title: "Payment Successful!",
                description: "Your diploma recommendations have been unlocked."
              });

              // Save payment info to localStorage
              localStorage.setItem('userData', JSON.stringify(paymentFormData));
              localStorage.setItem('diplomaRecommendationUnlocked', 'true');
              setIsUnlocked(true);
              setIsDialogOpen(false);
            } catch (error) {
              toast({
                title: "Payment Verification Failed",
                description: "There was an issue verifying your payment. Please contact support.",
                variant: "destructive"
              });
            } finally {
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              clearTimeout(paymentTimer);
              setIsLoading(false);
              toast({
                title: "Payment Cancelled",
                description: "Payment was cancelled by user.",
                variant: "destructive"
              });
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        localStorage.setItem('diplomaRecommendationUnlocked', 'true');
        setIsUnlocked(true);
        setIsDialogOpen(false);
      }

    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDialogOpen(false);
      setIsLoading(false);
    }
  };

  const sortRecommendationsByCategory = (recs: CollegeRecommendation[]) => {
    return recs.sort((a, b) => {
      const categoryOrder = { 'Dream': 0, 'Reach': 1, 'Match': 2, 'Safety': 3 };
      const categoryA = categoryOrder[a.category as keyof typeof categoryOrder] ?? 4;
      const categoryB = categoryOrder[b.category as keyof typeof categoryOrder] ?? 4;

      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      return (b.cutoff_percentile || 0) - (a.cutoff_percentile || 0);
    });
  };

  const getCategorizedRecommendations = () => {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    let filtered = recommendations;

    if (activeCategory !== 'All') {
      filtered = recommendations.filter(rec => rec.category === activeCategory);
    }

    return sortRecommendationsByCategory(filtered);
  };

  const categoryStats = {
    Dream: recommendations?.filter(r => r.category === 'Dream').length || 0,
    Reach: recommendations?.filter(r => r.category === 'Reach').length || 0,
    Match: recommendations?.filter(r => r.category === 'Match').length || 0,
    Safety: recommendations?.filter(r => r.category === 'Safety').length || 0,
  };

  const categorizedRecommendations = getCategorizedRecommendations();
  const originalPrice = 499;
  const finalPrice = getDiscountedPrice();
  const discount = originalPrice - finalPrice;

  // Render upcoming round placeholder
  const renderUpcomingRound = (roundNumber: number) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Round {roundNumber} Counselling
      </h3>
      <div className="flex items-center gap-2 text-blue-600 mb-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Date Yet to be Announced</span>
      </div>
      <p className="text-gray-600 text-sm max-w-md leading-relaxed">
        We'll notify you as soon as Round {roundNumber} counselling dates are officially announced. 
        Stay tuned for updates and prepare your documents in advance.
      </p>
      <div className="mt-6 p-3 bg-white rounded-lg border border-blue-200 text-xs text-blue-700">
        💡 Tip: Use Round 1 results to plan your strategy for upcoming rounds
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <DiplomaRecommendationHeader formData={formData} />

      {/* Rounds Tabs */}
      <Tabs value={activeRound} onValueChange={setActiveRound} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted">
          <TabsTrigger value="round1" className="text-xs sm:text-sm font-medium">
            Round 1
          </TabsTrigger>
          <TabsTrigger value="round2" className="text-xs sm:text-sm font-medium">
            Round 2
          </TabsTrigger>
        </TabsList>

        <TabsContent value="round1" className="space-y-6 mt-4">
          {recommendations && recommendations.length > 0 ? (
            <>
              <CAPFormInstructions />
              <DiplomaRecommendationDisclaimer />

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-center sm:text-left">
              <p className="text-lg text-gray-600">
                Found <span className="font-semibold text-blue-600">{categorizedRecommendations.length}</span> college recommendations
                {activeCategory !== 'All' && ` in ${activeCategory} category`}
              </p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={(!isUnlocked && paymentData?.is_payment !== true) || isGenerating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg min-h-[44px] touch-manipulation"
              aria-label="Download recommendations as PDF"
            >
              <span className="text-sm font-medium">
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </span>
            </Button>
          </div>

          {/* Category Filter
          <DiplomaCategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            stats={categoryStats}
          /> */}

          {/* Results List */}
          {categorizedRecommendations.length > 0 ? (
            <div className="relative">
              {/* First 5 cards - always visible */}
              <div className="space-y-4">
                {categorizedRecommendations.slice(0, isUnlocked ? 5 : 5).map((recommendation, index) => {
                  return (
                    <DiplomaRecommendationCard
                      key={`${recommendation.college.id}-${recommendation.course_name}-${index}`}
                      recommendation={recommendation}
                      index={index + 1}
                    />
                  );
                })}
              </div>

              {/* Blurred cards section with unlock functionality */}
              {shouldShowUnlock() && categorizedRecommendations.length > 5 && (
                <div id="blurred-section" className="relative mt-4 z-10">
                  {/* Unlock section at the top */}
                  <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-4 border-2 border-blue-200">
                    <Lock className="mx-auto mb-3 text-blue-600" size={32} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      🔒 Unlock Unlimited Attempts
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {categorizedRecommendations.length - 5} more recommendations waiting
                    </p>

                    {/* Unlock button */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setIsDialogOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                        >
                          <Unlock size={16} />
                          Unlock Now
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md z-[9999]">
                        <DialogHeader>
                          <DialogTitle className="text-center">Unlock Diploma Recommendations</DialogTitle>
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
                                value={JSON.parse(localStorage.getItem('user') || '{}').name || ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                required
                                disabled
                              />
                            </div>

                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={JSON.parse(localStorage.getItem('user') || '{}').email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email"
                                required
                                disabled
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
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                          >
                            {isLoading ? "Processing..." : `Pay ₹${finalPrice} & Unlock`}
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
                    {categorizedRecommendations.slice(3, Math.min(8, categorizedRecommendations.length)).map((recommendation, index) => (
                      <DiplomaRecommendationCard
                        key={`${recommendation.college.id}-${recommendation.course_name}-${index + 5}`}
                        recommendation={recommendation}
                        index={index + 6}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocked cards - show all remaining */}
              {(isUnlocked || paymentData?.is_payment === true) && categorizedRecommendations.length > 5 && (
                <div className="space-y-4 mt-4">
                  {categorizedRecommendations.slice(5).map((recommendation, index) => (
                    <DiplomaRecommendationCard
                      key={`${recommendation.college.id}-${recommendation.course_name}-${index + 5}`}
                      recommendation={recommendation}
                      index={index + 6}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No recommendations found for the {activeCategory} category.</p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                View all recommendations
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <NoResultsState />
        </>
      )}
        </TabsContent>

        <TabsContent value="round2" className="mt-4">
          {renderUpcomingRound(2)}
        </TabsContent>
      </Tabs>
    </div>
  );
};