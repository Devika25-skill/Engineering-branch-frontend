// Pre-registration page for new students
import { useState } from 'react';
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
import { Loader2, CheckCircle2 } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        student_name: '',
        email: '',
        mobile: '',
        state: 'Maharashtra',
        city: 'Pune',
        admission_type: '',
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const onSendOTP = async () => {
        if (!formData.email) {
            toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await apiService.sendOTP(formData.email);
            setOtpSent(true);
            toast({ title: "OTP Sent", description: "Please check your email for the verification code." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to send OTP. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const onRegister = async () => {
        if (!otp || otp.length !== 6) {
            toast({ title: "Error", description: "Please enter a valid 6-digit OTP", variant: "destructive" });
            return;
        }

        setIsVerifying(true);
        try {
            const response = await apiService.preRegister({
                ...formData,
                otp: parseInt(otp)
            });

            if (response.success) {
                toast({
                    title: "Registration Successful",
                    description: "Welcome to Future Bridge! Your account has been created.",
                });
                // Optionally store login state or redirect
                localStorage.setItem('isLoggedIn', 'true');
                navigate('/');
            } else {
                toast({ title: "Registration Failed", description: response.message || "Something went wrong", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Registration failed. Please try again.", variant: "destructive" });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Navigation />
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="shadow-2xl border-blue-100 bg-white/80 backdrop-blur-sm">
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg ring-4 ring-blue-100">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Pre-Registration
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Join Future Bridge and start your academic journey today
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="student_name" className="text-gray-700 font-medium">Student Name</Label>
                                    <Input
                                        id="student_name"
                                        placeholder="Enter full name"
                                        value={formData.student_name}
                                        onChange={handleInputChange}
                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile" className="text-gray-700 font-medium">Mobile Number</Label>
                                    <Input
                                        id="mobile"
                                        placeholder="10-digit mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        maxLength={10}
                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={otpSent}
                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admission_type" className="text-gray-700 font-medium">Admission Type</Label>
                                    <Select onValueChange={(v) => handleSelectChange('admission_type', v)}>
                                        <SelectTrigger className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="engineering">Engineering</SelectItem>
                                            <SelectItem value="medical">Medical</SelectItem>
                                            <SelectItem value="diploma">Diploma</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="h-11 border-gray-200 focus:ring-blue-500 rounded-lg"
                                        disabled
                                    />
                                </div>
                            </div>

                            {!otpSent ? (
                                <Button
                                    onClick={onSendOTP}
                                    disabled={isLoading}
                                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify Identity & Send OTP"}
                                </Button>
                            ) : (
                                <div className="space-y-6 bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col items-center space-y-4">
                                        <Label className="text-blue-900 font-semibold text-center italic">
                                            OTP has been sent to <span className="text-blue-600">{formData.email}</span>
                                        </Label>
                                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                            <InputOTPGroup className="gap-2">
                                                <InputOTPSlot index={0} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                                <InputOTPSlot index={1} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                                <InputOTPSlot index={2} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                                <InputOTPSlot index={3} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                                <InputOTPSlot index={4} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                                <InputOTPSlot index={5} className="w-12 h-14 text-xl border-blue-200 bg-white" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <button
                                            onClick={() => setOtpSent(false)}
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            Change email?
                                        </button>
                                        <Button
                                            onClick={onRegister}
                                            disabled={isVerifying}
                                            className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                                        >
                                            {isVerifying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Complete Registration"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-sm text-gray-500">
                                By registering, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Register;
