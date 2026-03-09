
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export const LeadForm = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        email: '',
        mobile: '',
        state: 'Maharashtra',
        city: 'Pune',
        target_area: 'Both',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student_name || !formData.email || !formData.mobile) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        if (formData.mobile.length !== 10) {
            toast({ title: "Error", description: "Please enter a valid 10-digit mobile number", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            // Simplified lead capture using the pre-register endpoint with dummy OTP for now
            // Or we can add a dedicated lead capture endpoint if needed.
            const response = await apiService.preRegister({ ...formData, otp: 0 });

            if (response.success || response.message?.includes("OTP")) {
                toast({
                    title: "Registration Started!",
                    description: "Please check your email for verification to complete access.",
                });
            } else {
                toast({ title: "Submission Failed", description: response.message || "Something went wrong", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Submission Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-none bg-white/95 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl sm:text-2xl font-bold">Get Started Now</CardTitle>
                    <div className="bg-yellow-400 text-black text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full animate-pulse whitespace-nowrap">
                        60% OFF
                    </div>
                </div>
                <CardDescription className="text-blue-100 text-sm sm:text-base">
                    Unlimited usage until results are out!
                </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="student_name" className="text-sm font-semibold">Student Name</Label>
                        <Input
                            id="student_name"
                            placeholder="Your full name"
                            value={formData.student_name}
                            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                            className="h-10 sm:h-11 border-gray-200"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-semibold">Email ID</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-10 sm:h-11 border-gray-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="mobile" className="text-sm font-semibold">Phone Number</Label>
                            <Input
                                id="mobile"
                                placeholder="10-digit mobile"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="h-10 sm:h-11 border-gray-200"
                                maxLength={10}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="state" className="text-sm font-semibold">State</Label>
                            <Input
                                id="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="h-10 sm:h-11 border-gray-200"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                            <Input
                                id="city"
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="h-10 sm:h-11 border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pb-1">
                        <Label className="text-sm font-semibold">Target Area</Label>
                        <RadioGroup
                            value={formData.target_area}
                            onValueChange={(v) => setFormData({ ...formData, target_area: v })}
                            className="flex flex-wrap gap-x-6 gap-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Mathematics" id="math" />
                                <Label htmlFor="math" className="cursor-pointer text-sm">Mathematics</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Biology" id="bio" />
                                <Label htmlFor="bio" className="cursor-pointer text-sm">Biology</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Both" id="both" />
                                <Label htmlFor="both" className="cursor-pointer text-sm">Both</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Limited Time Offer</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl sm:text-3xl font-black text-gray-900">₹399</span>
                                <span className="text-sm text-gray-400 line-through font-medium">₹999</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-1">
                                Save ₹600
                            </span>
                            <p className="text-[10px] text-gray-500 max-w-[100px] leading-tight">
                                Unlimited access!
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg shadow-orange-200/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                            <div className="flex items-center justify-center">
                                <Sparkles className="mr-2 h-5 w-5" />
                                Claim Your AccessNow ✨
                            </div>
                        )}
                    </Button>
                </form>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400 font-medium">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>Trusted by 50,000+ students</span>
                </div>
            </CardContent>
        </Card>
    );
};
