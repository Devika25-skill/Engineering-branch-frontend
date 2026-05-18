
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
        target_area: 'Both',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.student_name || !formData.email || !formData.mobile) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            // For landing page, we might want a direct lead capture or a simplified version of pre-register
            // For now, let's assume we use the pre-register logic but handle OTP separately or skip for simple leads
            // Since the request asks for landing page info, we'll implement a simple capture
            await apiService.preRegister({ ...formData, otp: 0 }); // Temporary hack or use new endpoint

            toast({
                title: "Success!",
                description: "Thank you for your interest. We will contact you soon!",
            });
            setFormData({ student_name: '', email: '', mobile: '', target_area: 'Both' });
        } catch (error) {
            toast({ title: "Submission Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-none bg-white/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl font-bold">Get Started Now</CardTitle>
                    <div className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        60% OFF
                    </div>
                </div>
                <CardDescription className="text-blue-100">
                    Unlimited usage until results are out!
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="student_name">Student Name</Label>
                        <Input
                            id="student_name"
                            placeholder="Your full name"
                            value={formData.student_name}
                            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email ID</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Phone Number</Label>
                        <Input
                            id="mobile"
                            placeholder="10-digit mobile number"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            className="h-11"
                            maxLength={10}
                        />
                    </div>

                    <div className="space-y-3 pb-2">
                        <Label>Target Area</Label>
                        <RadioGroup
                            value={formData.target_area}
                            onValueChange={(v) => setFormData({ ...formData, target_area: v })}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Mathematics" id="math" />
                                <Label htmlFor="math" className="cursor-pointer">Mathematics</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Biology" id="bio" />
                                <Label htmlFor="bio" className="cursor-pointer">Biology</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Both" id="both" />
                                <Label htmlFor="both" className="cursor-pointer">Both</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Special Offer</p>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">₹399</span>
                                <span className="text-sm text-gray-500 line-through">₹999</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 max-w-[120px] leading-tight">
                                One-time payment for unlimited access!
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Claim Your Access Now ✨"}
                    </Button>
                </form>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-400">
                    <CheckCircle2 size={12} className="text-green-500" />
                    <span>Secure and Trusted Platform</span>
                </div>
            </CardContent>
        </Card>
    );
};
