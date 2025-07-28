import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumGateProps {
  onUnlock: () => void;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  couponCode: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PremiumGate = ({ onUnlock }: PremiumGateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    couponCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load user data from localStorage
  useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        name: parsed.name || '',
        email: parsed.email || '',
        mobile: parsed.mobile || ''
      }));
    }
  });

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

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({ title: "Error", description: "Payment gateway failed to load", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const amount = getDiscountedPrice() * 100; // Amount in paise
    
    const options = {
      key: 'rzp_test_9999999999', // Replace with your Razorpay key ID
      amount: amount,
      currency: 'INR',
      name: 'College Recommendation Unlock',
      description: 'Unlock your personalized college recommendations',
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.mobile,
      },
      theme: {
        color: '#3B82F6',
      },
      handler: function (response: any) {
        // Payment successful
        toast({ 
          title: "Payment Successful!", 
          description: "Your recommendations have been unlocked." 
        });
        
        // Save payment info to localStorage
        localStorage.setItem('userData', JSON.stringify(formData));
        
        onUnlock();
        setIsOpen(false);
        setIsLoading(false);
      },
      modal: {
        ondismiss: function() {
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