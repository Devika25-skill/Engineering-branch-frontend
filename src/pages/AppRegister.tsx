
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { apiService } from "@/services/api";
import { Loader2, CheckCircle2, ArrowRight, Mail, GraduationCap } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

const admissionOptions = [
    { value: "First Year Engineering", label: "First Year Engineering" },
    { value: "Direct Second Year Engineering", label: "Direct Second Year Engineering" },
    { value: "Medical", label: "Medical" },
    { value: "B.Pharmacy", label: "B.Pharmacy" },
    { value: "other", label: "Other" },
];

const AppRegister = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        student_name: '',
        email: '',
        mobile: '',
        state: 'Maharashtra',
        city: 'Pune',
        admission_type: 'First Year Engineering',
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [offerAmount, setOfferAmount] = useState<number>(399);
    const [originalPrice, setOriginalPrice] = useState<number>(999);
    const [discountPercent, setDiscountPercent] = useState<number>(60);
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [finalPrice, setFinalPrice] = useState<number>(999);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    useEffect(() => {
        // Initial final price is original price
        setFinalPrice(originalPrice);
    }, [originalPrice]);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await apiService.validateCoupon(couponCode);
            if (res.success) {
                setIsCouponApplied(true);
                setFinalPrice(res.data.final_amount);
                toast({ title: "Coupon Applied", description: res.message });
            } else {
                setIsCouponApplied(false);
                setFinalPrice(originalPrice);
                toast({ title: "Invalid Coupon", description: res.message, variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to validate coupon.", variant: "destructive" });
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await apiService.getAuthConfig();
                if (res.success && res.data) {
                    if (res.data.pre_registration_amount) setOfferAmount(res.data.pre_registration_amount);
                    if (res.data.original_price) setOriginalPrice(res.data.original_price);
                    if (res.data.discount_percentage) setDiscountPercent(res.data.discount_percentage);
                }
            } catch (err) {
                console.error("Failed to fetch auth config", err);
            }
        };
        fetchConfig();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const onSendOTP = async () => {
        if (!formData.email || !formData.student_name || !formData.mobile) {
            toast({ title: "Required Fields", description: "Please fill in all details before verifying.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await apiService.sendOTP(formData.email);
            setOtpSent(true);
            toast({ title: "OTP Sent", description: "Verification code sent to your email." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to send OTP. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async () => {
        if (!otp || otp.length !== 6) {
            toast({ title: "Invalid OTP", description: "Please enter the 6-digit code sent to your email.", variant: "destructive" });
            return;
        }

        setIsVerifying(true);
        try {
            const validateRes = await apiService.validateOTP(formData.email, parseInt(otp));
            if (validateRes.isValidOtp) {
                // Auto register the user
                const registerResponse = await apiService.preRegister({
                    ...formData,
                    otp: parseInt(otp),
                    payment_status: "Pending" // Initial status
                });

                if (registerResponse.success) {
                    toast({
                        title: "Registration Successful",
                        description: "Your account has been created. Grab the special offer now!",
                    });
                    localStorage.setItem('isLoggedIn', 'true');
                    setShowPaymentOptions(true);
                } else {
                    toast({ title: "Registration Failed", description: registerResponse.message || "Something went wrong", variant: "destructive" });
                }
            } else {
                toast({ title: "Validation Failed", description: "Invalid OTP", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Verification failed. Please try again.", variant: "destructive" });
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePayment = async () => {
        setIsProcessingPayment(true);
        try {
            const res = await apiService.initiatePreRegPayment({
                email: formData.email,
                full_name: formData.student_name,
                contact: formData.mobile,
                product_type: 'pre-registration-offer',
                coupon_code: isCouponApplied ? couponCode : undefined,
                amount: finalPrice
            });

            if (res.success && res.data) {
                const options = {
                    key: res.data.razorpay_key,
                    amount: res.data.amount,
                    currency: res.data.currency,
                    name: "Future Bridge",
                    description: "Pre-registration Offer",
                    order_id: res.data.order_id,
                    handler: async (response: any) => {
                        try {
                            const verifyRes = await apiService.verifyPreRegPayment({
                                order_id: res.data.order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                email: formData.email
                            });

                            if (verifyRes.success) {
                                completeRegistration(true);
                            } else {
                                toast({ title: "Payment Verification Failed", variant: "destructive" });
                            }
                        } catch (err) {
                            toast({ title: "Verification Error", variant: "destructive" });
                        }
                    },
                    prefill: {
                        name: formData.student_name,
                        email: formData.email,
                        contact: formData.mobile
                    },
                    theme: { color: "#2563eb" }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            toast({ title: "Payment Initiation Failed", variant: "destructive" });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const completeRegistration = async (isPaid: boolean = false) => {
        setIsLoading(true);
        try {
            toast({
                title: "Welcome to Future Bridge!",
                description: isPaid ? "You've grabbed the special offer." : "Your account is ready.",
            });
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/');
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navigation />
            <div className="container mx-auto px-4 py-8 sm:py-16">
                <div className="mx-auto max-w-xl transition-all duration-500">
                    <div className="grid grid-cols-1 gap-8">
                        <Card className="shadow-2xl border-none bg-white/90 backdrop-blur-md overflow-hidden animate-in zoom-in-95 duration-500">
                            <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 sm:p-10">
                                <div className="flex justify-center mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner ring-1 ring-white/30">
                                        <CheckCircle2 className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight">
                                    Join Future Bridge
                                </CardTitle>
                                <CardDescription className="text-blue-100 text-sm sm:text-base mt-2">
                                    Start your academic journey with AI-powered recommendations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 sm:p-10 space-y-6">
                                {!otpSent ? (
                                    <div className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="student_name" className="text-sm font-bold text-gray-700">Student Name</Label>
                                            <Input
                                                id="student_name"
                                                placeholder="Enter your full name"
                                                value={formData.student_name}
                                                onChange={handleInputChange}
                                                className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="mobile" className="text-sm font-bold text-gray-700">Mobile Number</Label>
                                                <Input
                                                    id="mobile"
                                                    placeholder="10-digit mobile"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    maxLength={10}
                                                    className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="admission_type" className="text-sm font-bold text-gray-700">Admission Interested In</Label>
                                                <SearchableSelect
                                                    options={admissionOptions}
                                                    value={formData.admission_type === 'other' || !admissionOptions.some(o => o.value === formData.admission_type) ? 'other' : formData.admission_type}
                                                    onValueChange={(v) => handleSelectChange('admission_type', v)}
                                                    placeholder="Select admission type"
                                                />
                                                {(formData.admission_type === 'other' || (formData.admission_type && !admissionOptions.some(o => o.value === formData.admission_type))) && (
                                                    <Input
                                                        id="other_admission_type"
                                                        placeholder="Enter admission type"
                                                        value={admissionOptions.some(o => o.value === formData.admission_type) ? '' : formData.admission_type}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, admission_type: e.target.value }))}
                                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-xl mt-2 animate-in fade-in slide-in-from-top-1 duration-300"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="pl-12 h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="state" className="text-sm font-bold text-gray-700">State</Label>
                                                <Input
                                                    id="state"
                                                    placeholder="Enter state"
                                                    value={formData.state}
                                                    onChange={handleInputChange}
                                                    className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="city" className="text-sm font-bold text-gray-700">City</Label>
                                                <Input
                                                    id="city"
                                                    placeholder="Enter city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={onSendOTP}
                                            disabled={isLoading}
                                            className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200 transition-all duration-300 transform hover:scale-[1.01] active:scale-95 group"
                                        >
                                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                                                <>
                                                    Verify & Continue
                                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : !showPaymentOptions ? (
                                    <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                                        <div className="text-center space-y-2">
                                            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-2">
                                                <Mail className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Verify your email</h3>
                                            <p className="text-sm text-gray-500">
                                                Enter the 6-digit code sent to <span className="font-semibold text-blue-600">{formData.email}</span>
                                            </p>
                                        </div>

                                        <div className="flex justify-center">
                                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                                <InputOTPGroup className="gap-2 sm:gap-4">
                                                    <InputOTPSlot index={0} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                    <InputOTPSlot index={1} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                    <InputOTPSlot index={2} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                    <InputOTPSlot index={3} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                    <InputOTPSlot index={4} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                    <InputOTPSlot index={5} className="w-10 h-14 sm:w-14 sm:h-16 text-xl sm:text-2xl border-gray-300 shadow-sm" />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            <Button
                                                onClick={onRegister}
                                                disabled={isVerifying}
                                                className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-100 transition-all duration-300"
                                            >
                                                {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify OTP"}
                                            </Button>
                                            <button
                                                onClick={() => setOtpSent(false)}
                                                className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                                            >
                                                Change email address?
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-tighter rounded-bl-2xl">
                                                Special Offer
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-blue-900">₹{finalPrice}</span>
                                                    {isCouponApplied && (
                                                        <>
                                                            <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Unlock <span className="font-bold text-blue-700">Unlimited AI Recommendations</span> and priority support until results are out!
                                                </p>

                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Enter Coupon Code"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value)}
                                                            className="h-10 border-gray-200 rounded-xl bg-white"
                                                            disabled={isCouponApplied}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant={isCouponApplied ? "secondary" : "default"}
                                                            onClick={handleApplyCoupon}
                                                            disabled={isValidatingCoupon || !couponCode || isCouponApplied}
                                                            className="h-10 px-4 rounded-xl whitespace-nowrap"
                                                        >
                                                            {isValidatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : isCouponApplied ? "Applied" : "Apply"}
                                                        </Button>
                                                    </div>
                                                    {isCouponApplied && (
                                                        <p className="text-[10px] font-bold text-green-600 flex items-center">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Coupon code applied successfully!
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    onClick={handlePayment}
                                                    disabled={isProcessingPayment}
                                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all mt-2"
                                                >
                                                    {isProcessingPayment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCouponApplied ? "Grab the Offer Now 🚀" : "Pay Now")}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm relative overflow-hidden flex flex-col items-center text-center gap-4">
                                            <div className="p-3 bg-blue-50 rounded-2xl">
                                                <GraduationCap className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">See your future colleges</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Check out a preview of how your personalized recommendation list will look.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open('/mock-recommendations', '_blank')}
                                                className="w-full h-12 border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                Check how your recommendation list will look like
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-gray-200"></span>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-white px-2 text-gray-400 font-medium">Or</span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => completeRegistration(false)}
                                            className="w-full h-12 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Registration Only
                                        </Button>

                                        <p className="text-center text-[10px] text-gray-400">
                                            You can always upgrade to premium later from your dashboard.
                                        </p>
                                    </div>
                                )}

                                <p className="text-center text-[11px] text-gray-400 font-medium uppercase tracking-widest px-4 mt-6">
                                    By signing up, you agree to our <span className="underline decoration-blue-200 cursor-pointer">Terms</span> and <span className="underline decoration-blue-200 cursor-pointer">Privacy Policy</span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AppRegister;
