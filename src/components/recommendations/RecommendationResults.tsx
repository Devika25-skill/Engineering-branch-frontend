import { useState, useEffect } from "react";
import { CollegeRecommendation } from "@/services/cutoffService";
import { RecommendationCard } from "./RecommendationCard";
import { CategoryFilter } from "./CategoryFilter";
import { RecommendationHeader } from "./RecommendationHeader";
import { RecommendationDisclaimer } from "./RecommendationDisclaimer";
import { CAPFormInstructions } from "./CAPFormInstructions";
import { NoResultsState } from "./NoResultsState";
import { Lock, Unlock, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";
import { TIMEOUT } from "dns";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Round2Tab } from "./Round2Tab";
import Round3Tab from "./Round3Tab";

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

export interface RecommendationResultsProps {
  recommendations: CollegeRecommendation[];
  formData: any;
  recommendationId?: string | null;
  paymentData?: {
    is_payment?: boolean;
    accept_payment?: boolean;
  };
  onTabChange?: (tab: string) => void;
  round2Key?: number | string;
  round3Key?: number | string;
}

export const RecommendationResults = ({
  recommendations,
  formData,
  recommendationId,
  paymentData,
  onTabChange,
  round2Key,
  round3Key,
}: RecommendationResultsProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Initialize with Round 2 as default and persist selection
  const [activeRound, setActiveRound] = useState<string>(() => {
    const savedRound = localStorage.getItem("activeRoundTab");
    return savedRound || "round2"; // Default to Round 2
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
  const { generatePDF, isGenerating } = usePdfDownload();

  const [paymentFormData, setPaymentFormData] = useState<FormData>({
    name: userFromStorage.name || "",
    email: userFromStorage.email || "",
    mobile: "",
    couponCode: "LAUNCHOFFER",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    if (!isUnlocked && paymentData?.is_payment !== true) {
      toast({
        title: "Download Locked",
        description:
          "Please unlock recommendations to download the PDF report.",
        variant: "destructive",
      });
      return;
    }

    generatePDF(recommendations, formData, {
      branches: formData?.preferredStreams,
      cities: formData?.preferredCities,
    });
  };
  // Load user data from localStorage
  useEffect(() => {
    const isUnlocked: any = localStorage.getItem("recommendationUnlocked");
    setIsUnlocked(isUnlocked === "true");
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed = JSON.parse(userData);
      setPaymentFormData((prev) => ({
        ...prev,
        name: parsed.name || "",
        email: parsed.email || "",
        mobile: parsed.mobile || "",
      }));
    }
  }, []);

  // Determine if unlock functionality should be shown
  const shouldShowUnlock = () => {
    const isUnlocked: any = localStorage.getItem("recommendationUnlocked");
    if (isUnlocked === "true") {
      return false;
    }
    return paymentData?.accept_payment === undefined;
  };

  const getDiscountedPrice = () => {
    let finalPrice =
      paymentFormData.couponCode.toUpperCase() === "LAUNCHOFFER" ? 99 : 499;
    finalPrice =
      paymentFormData.couponCode.toUpperCase() === "SJ-FB100FREE"
        ? 0
        : finalPrice;
    finalPrice =
      paymentFormData.couponCode.toUpperCase() === "LAUNCHOFFERTEST"
        ? 1
        : finalPrice;
    return finalPrice;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setPaymentFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, mobile } = paymentFormData;

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Valid email is required",
        variant: "destructive",
      });
      return false;
    }

    if (!mobile.trim() || mobile.length < 10) {
      toast({
        title: "Error",
        description: "Valid mobile number is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    const isKarnataka = localStorage.getItem("selected_state") === "Karnataka";
    const productType = isKarnataka
      ? "karnataka-engineering-recommendations"
      : "future-bridge";

    const payload = {
      full_name: paymentFormData.name,
      email: paymentFormData.email,
      contact: parseInt(paymentFormData.mobile),
      product_type: productType,
      amount: getDiscountedPrice(),
    };

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/v1/payment/payment/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentInitiateResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      return data.data;
    } catch (error) {
      console.error("Payment initiation failed:", error);
      throw error;
    }
  };

  const verifyPayment = async (email: string, orderId: string) => {
    const payload = {
      email: email,
      order_id: orderId,
    };

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/v1/payment/payment/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentVerifyResponse = await response.json();

      if (data.detail) {
        throw new Error(data.detail);
      }

      return data;
    } catch (error) {
      console.error("Payment verification failed:", error);
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
          toast({
            title: "Error",
            description: "Payment gateway failed to load",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Initiate payment
        const paymentData = await initiatePayment();

        // Immediately verify payment after initiation
        setTimeout(async () => {
          try {
            const verifyResult = await verifyPayment(
              paymentFormData.email,
              paymentData.order_id,
            );
            if (verifyResult.success) {
              // Payment already completed
              toast({
                title: "Payment Successful!",
                description: "Your recommendations have been unlocked.",
              });

              localStorage.setItem("recommendationUnlocked", "true");
              localStorage.setItem("userData", JSON.stringify(paymentFormData));

              setIsUnlocked(true);
              setIsDialogOpen(false);
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Payment verification check:", error);
          }
        }, 1000);

        // Set up 2-minute timer for payment timeout
        const paymentTimer = setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Payment Timeout",
            description: "Payment session expired. Please try again.",
            variant: "destructive",
          });
        }, 150000); // 2 minutes

        const options = {
          key: paymentData.razorpay_key,
          amount: paymentData.amount,
          currency: paymentData.currency,
          order_id: paymentData.order_id,
          name: "College Recommendation Unlock",
          description: "Unlock your personalized college recommendations",
          prefill: {
            name: paymentFormData.name,
            email: paymentFormData.email,
            contact: paymentFormData.mobile,
          },
          timeout: 300,
          theme: {
            color: "#3B82F6",
          },
          handler: async function (response: any) {
            clearTimeout(paymentTimer);
            try {
              // Verify payment
              await verifyPayment(paymentFormData.email, paymentData.order_id);

              // Payment successful
              toast({
                title: "Payment Successful!",
                description: "Your recommendations have been unlocked.",
              });

              // Save payment info to localStorage
              localStorage.setItem("userData", JSON.stringify(paymentFormData));
              localStorage.setItem("recommendationUnlocked", "true");
              setIsUnlocked(true);
              setIsDialogOpen(false);
            } catch (error) {
              toast({
                title: "Payment Verification Failed",
                description:
                  "There was an issue verifying your payment. Please contact support.",
                variant: "destructive",
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
                variant: "destructive",
              });
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        localStorage.setItem("recommendationUnlocked", "true");
        setIsUnlocked(true);
        setIsDialogOpen(false);
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setIsLoading(false);
    }
  };

  // Log the data for debugging
  useEffect(() => {}, [recommendations, formData, recommendationId]);

  const sortRecommendationsByCategory = (recs: CollegeRecommendation[]) => {
    if (!Array.isArray(recs)) return [];

    // Skip sorting for Karnataka
    const isKarnataka = localStorage.getItem("selected_state") === "Karnataka";
    if (isKarnataka) {
      return [...recs];
    }

    // Sort to maintain category order: Dream, Reach, Match, Safety
    // Within each category, sort by cutoff percentile in descending order
    // Use spread to avoid mutating original array
    return [...recs].sort((a, b) => {
      // First sort by category order
      const categoryOrder = { Dream: 0, Reach: 1, Match: 2, Safety: 3 };
      const categoryA =
        categoryOrder[a.category as keyof typeof categoryOrder] ?? 4;
      const categoryB =
        categoryOrder[b.category as keyof typeof categoryOrder] ?? 4;

      if (categoryA !== categoryB) {
        return categoryA - categoryB;
      }

      // Within same category, sort by cutoff percentile descending (higher cutoffs first)
      return (b.cutoff_percentile || 0) - (a.cutoff_percentile || 0);
    });
  };

  const getCategorizedRecommendations = () => {
    if (
      !recommendations ||
      !Array.isArray(recommendations) ||
      recommendations.length === 0
    ) {
      return [];
    }

    let filtered = recommendations;

    if (activeCategory !== "All") {
      filtered = recommendations.filter(
        (rec) => rec.category === activeCategory,
      );
    }

    return sortRecommendationsByCategory(filtered);
  };

  const categoryStats = {
    Dream: Array.isArray(recommendations)
      ? recommendations.filter((r) => r.category === "Dream").length
      : 0,
    Reach: Array.isArray(recommendations)
      ? recommendations.filter((r) => r.category === "Reach").length
      : 0,
    Match: Array.isArray(recommendations)
      ? recommendations.filter((r) => r.category === "Match").length
      : 0,
    Safety: Array.isArray(recommendations)
      ? recommendations.filter((r) => r.category === "Safety").length
      : 0,
  };

  const categorizedRecommendations = getCategorizedRecommendations();
  const originalPrice = 499;
  const finalPrice = getDiscountedPrice();
  const discount = originalPrice - finalPrice;

  // Render upcoming round placeholder
  const renderUpcomingRound = (roundNumber: number) => {
    // For Round 3, always show the default upcoming message
    if (roundNumber === 3) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Round {roundNumber} Counselling
          </h3>
          <div className="flex items-center gap-2 text-blue-600 mb-3">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Date Yet to be Announced
            </span>
          </div>
          <p className="text-gray-600 text-sm max-w-md leading-relaxed">
            We'll notify you as soon as Round {roundNumber} counselling dates
            are officially announced. Stay tuned for updates and prepare your
            documents in advance.
          </p>
          <div className="mt-6 p-3 bg-white rounded-lg border border-blue-200 text-xs text-blue-700">
            💡 Tip: Use Round 1 results to plan your strategy for upcoming
            rounds
          </div>
        </div>
      );
    }

    const isUnlocked =
      localStorage.getItem("recommendationUnlocked") === "true";

    if (!isUnlocked) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Round {roundNumber} Counselling
          </h3>
          <p className="text-gray-600 text-sm max-w-md leading-relaxed mb-4">
            Complete payment in Round 1 to unlock all rounds including Round{" "}
            {roundNumber}.
          </p>
          <Button
            onClick={() => setActiveRound("round1")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Go to Round 1 for Payment
          </Button>
        </div>
      );
    }

    return (
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
          We'll notify you as soon as Round {roundNumber} counselling dates are
          officially announced. Stay tuned for updates and prepare your
          documents in advance.
        </p>
        <div className="mt-6 p-3 bg-white rounded-lg border border-blue-200 text-xs text-blue-700">
          💡 Tip: Use Round 1 results to plan your strategy for upcoming rounds
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <RecommendationHeader
        formData={formData}
        recommendationId={recommendationId}
      />

      {/* Rounds Tabs */}
      <Tabs
        value={activeRound}
        onValueChange={(value) => {
          setActiveRound(value);
          localStorage.setItem("activeRoundTab", value);
          if (onTabChange) {
            onTabChange(value);
          }
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted">
          <TabsTrigger
            value="round1"
            className="text-xs sm:text-sm font-medium"
          >
            Round 1
          </TabsTrigger>
          <TabsTrigger
            value="round2"
            className="text-xs sm:text-sm font-medium"
          >
            Round 2
          </TabsTrigger>
          <TabsTrigger
            value="round3"
            className="text-xs sm:text-sm font-medium"
          >
            Round 3
          </TabsTrigger>
        </TabsList>

        <TabsContent value="round1" className="space-y-6 mt-4">
          {recommendations && recommendations.length > 0 ? (
            <>
              <CAPFormInstructions />
              <RecommendationDisclaimer />

              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="text-center sm:text-left">
                  <p className="text-lg text-gray-600">
                    Found{" "}
                    <span className="font-semibold text-blue-600">
                      {categorizedRecommendations.length}
                    </span>{" "}
                    college recommendations
                    {activeCategory !== "All" &&
                      ` in ${activeCategory} category`}
                  </p>
                </div>

                <Button
                  onClick={handleDownloadPDF}
                  disabled={
                    (!isUnlocked && paymentData?.is_payment !== true) ||
                    isGenerating
                  }
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg min-h-[44px] touch-manipulation"
                  aria-label="Download recommendations as PDF"
                >
                  <span className="text-sm font-medium">
                    {isGenerating ? "Generating..." : "Download PDF"}
                  </span>
                </Button>
              </div>

              {/* Results List */}
              {categorizedRecommendations.length > 0 ? (
                <div className="relative">
                  {/* First 3 cards - always visible */}
                  <div className="space-y-4">
                    {categorizedRecommendations
                      .slice(0, isUnlocked ? 10 : 5)
                      .map((recommendation, index) => {
                        return (
                          <RecommendationCard
                            key={`${recommendation.college.id}-${recommendation.course_name}-${index}`}
                            recommendation={recommendation}
                            index={index + 1}
                          />
                        );
                      })}
                  </div>

                  {/* Blurred cards section with unlock functionality */}
                  {shouldShowUnlock() &&
                    categorizedRecommendations.length > 10 && (
                      <div id="blurred-section" className="relative mt-4 z-10">
                        {/* Unlock section at the top */}
                        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-4 border-2 border-blue-200">
                          <Lock
                            className="mx-auto mb-3 text-blue-600"
                            size={32}
                          />
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            🔒 Unlock Unlimited Attempts
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            {categorizedRecommendations.length - 10} more
                            recommendations waiting
                          </p>

                          {/* Unlock button */}
                          <Dialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                          >
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
                                <DialogTitle className="text-center">
                                  Unlock Recommendations
                                </DialogTitle>
                              </DialogHeader>

                              <div className="space-y-4">
                                {/* Pricing Section */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                  <div className="flex items-center justify-center gap-3 mb-2">
                                    <span className="text-lg text-gray-500 line-through">
                                      ₹{originalPrice}
                                    </span>
                                    <span className="text-2xl font-bold text-green-600">
                                      ₹{finalPrice}
                                    </span>
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
                                      value={
                                        JSON.parse(
                                          localStorage.getItem("user") || "{}",
                                        ).name || ""
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          "name",
                                          e.target.value,
                                        )
                                      }
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
                                      value={
                                        JSON.parse(
                                          localStorage.getItem("user") || "{}",
                                        ).email || ""
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          "email",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Enter your email"
                                      required
                                      disabled
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="mobile">
                                      Mobile Number *
                                    </Label>
                                    <Input
                                      id="mobile"
                                      value={paymentFormData.mobile}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "mobile",
                                          e.target.value,
                                        )
                                      }
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
                                      onChange={(e) =>
                                        handleInputChange(
                                          "couponCode",
                                          e.target.value,
                                        )
                                      }
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
                                  {isLoading
                                    ? "Processing..."
                                    : `Pay ₹${finalPrice} & Unlock`}
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
                          -{" "}
                          {categorizedRecommendations
                            .slice(
                              3,
                              Math.min(8, categorizedRecommendations.length),
                            )
                            .map((recommendation, index) => (
                              <RecommendationCard
                                key={`${recommendation.college.id}-${recommendation.course_name}-${index + 10}`}
                                recommendation={recommendation}
                                index={index + 11}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Unlocked cards - show all remaining */}
                  {(isUnlocked || paymentData?.is_payment === true) &&
                    categorizedRecommendations.length > 10 && (
                      <div className="space-y-4 mt-4">
                        {categorizedRecommendations
                          .slice(10)
                          .map((recommendation, index) => (
                            <RecommendationCard
                              key={`${recommendation.college.id}-${recommendation.course_name}-${index + 10}`}
                              recommendation={recommendation}
                              index={index + 11}
                            />
                          ))}
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No recommendations found for the {activeCategory} category.
                  </p>
                  <button
                    onClick={() => setActiveCategory("All")}
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
          <Round2Tab key={round2Key} />
        </TabsContent>

        <TabsContent value="round3" className="space-y-6 mt-4">
          <Round3Tab key={round3Key} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
