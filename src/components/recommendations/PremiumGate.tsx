import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/config/env';

interface PremiumGateProps {
  onUnlock: () => void;
  storageKey?: string;
  productType?: string;
  title?: string;
  description?: string;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  couponCode: string;
}

interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  data: {
    order_id: string;
    amount: number;
    currency: string;
    razorpay_key: string;
  };
}

interface PaymentVerifyResponse {
  success: boolean;
  detail?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PremiumGate = ({ 
  onUnlock, 
  storageKey = 'recommendationUnlocked',
  productType = 'future-bridge',
  title = 'College Recommendation Unlock',
  description = 'Unlock your personalized college recommendations'
}: PremiumGateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    couponCode: 'LAUNCHOFFER'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Auto-fetch user data from AuthContext (similar to Round 1) on mount
  useEffect(() => {
    if (user) {
      // Priority 1: Use authenticated user data
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        couponCode: prev.couponCode || 'LAUNCHOFFER'
      }));
    } else {
      // Priority 2: Fall back to localStorage userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            name: parsed.name || '',
            email: parsed.email || '',
            mobile: parsed.mobile || '',
            couponCode: prev.couponCode || 'LAUNCHOFFER'
          }));
        } catch (error) {
          console.error('Error parsing stored userData:', error);
        }
      }
    }
  }, [user]);

  const getDiscountedPrice = () => {
    const couponCode = formData.couponCode.toUpperCase();
    if (couponCode === 'LAUNCHOFFER') return 99;
    if (couponCode === 'LAUNCHOFFERTEST') return 1;
    return 499;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, mobile } = formData;
    
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
      full_name: formData.name,
      email: formData.email,
      contact: parseInt(formData.mobile),
      product_type: productType,
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
            const verifyResult = await verifyPayment(formData.email, paymentData.order_id);
            if (verifyResult.success) {
              // Payment already completed
              toast({
                title: "Payment Successful!",
                description: "Your content has been unlocked."
              });

              localStorage.setItem(storageKey, 'true');
              localStorage.setItem('userData', JSON.stringify(formData));

              onUnlock();
              setIsOpen(false);
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
          name: title,
          description: description,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.mobile,
          },
          timeout: 300,
          theme: {
            color: '#3B82F6',
          },
          handler: async (response: any) => {
            clearTimeout(paymentTimer);
            try {
              const verifyResult = await verifyPayment(formData.email, paymentData.order_id);

              if (verifyResult.success) {
                toast({
                  title: "Payment Successful!",
                  description: "Your content has been unlocked."
                });

                localStorage.setItem(storageKey, 'true');
                localStorage.setItem('userData', JSON.stringify(formData));

                onUnlock();
                setIsOpen(false);
              } else {
                toast({
                  title: "Payment Failed",
                  description: "Failed to verify payment. Please contact support.",
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error('Payment verification failed:', error);
              toast({
                title: "Verification Error",
                description: "Failed to verify payment. Please contact support.",
                variant: "destructive"
              });
            } finally {
              setIsLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              clearTimeout(paymentTimer);
              setIsLoading(false);
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Free case
        toast({
          title: "Access Granted!",
          description: "Your content has been unlocked."
        });

        localStorage.setItem(storageKey, 'true');
        localStorage.setItem('userData', JSON.stringify(formData));

        onUnlock();
        setIsOpen(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const originalPrice = 499;
  const finalPrice = getDiscountedPrice();
  const discount = originalPrice - finalPrice;

  return (
    <div className="relative">
      {/* Unlock Button */}
      <div className="text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <Lock className="mx-auto mb-4 text-blue-600" size={48} />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Unlock Your Complete Recommendations
        </h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          Get access to all your personalized college recommendations with detailed analysis and admission chances.
        </p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-lg">
              <Unlock className="mr-2" size={20} />
              Unlock Now
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Unlock Recommendations</DialogTitle>
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
                    value={formData.name}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
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
                    value={formData.couponCode}
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
    </div>
  );
};