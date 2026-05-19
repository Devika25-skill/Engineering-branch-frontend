import React, { useState } from 'react';
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePdfDownload } from "@/hooks/usePdfDownload";
import {
    Download,
    MapPin,
    Info,
    AlertCircle,
    Building2,
    Trophy,
    GraduationCap,
    Star,
    ExternalLink,
    TrendingUp,
    Users,
    ArrowRight,
    ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAPFormInstructions } from "./recommendations/CAPFormInstructions";
import { RecommendationDisclaimer } from "./recommendations/RecommendationDisclaimer";
import mockData from '@/data/mock-recommendation-list.json';

// Transformation function to map mock JSON to standard CollegeRecommendation format
const transformMockData = (item: any, category: string) => {
    return {
        college: {
            id: String(item.college.SJ_Institute_Code || "") || String(item.choice_code || "").substring(0, 4),
            name: item.college.College_Name,
            city: item.college.City,
            type: item.college.College_Type || "Private",
            logo: item.college.College_Logo,
            rating: item.college.College_Reviews_out_of_5 || 4.5,
            college_code: String(item.choice_code || "").substring(0, 4),
            fees: item.college["Annual_Fees_(INR)"],
            placement: item.college.Overall_College_Placement_Percentage,
            Student_Intake: item.college.Student_Intake
        },
        course_name: item.course,
        admission_probability: item.admission_probability,
        cutoff_percentile: item.cutoff,
        choice_code: item.choice_code,
        category: category,
        reservation_category: item.category || "GOPENS - State Level"
    };
};

// Local replica of RecommendationCard to match production styling perfectly
const MockRecommendationCard = ({ recommendation, index }: { recommendation: any, index: number }) => {
    const getProbabilityColor = (probability: number) => {
        if (probability >= 80) return "text-green-600";
        if (probability >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getProgressBarColor = (probability: number) => {
        if (probability >= 80) return "bg-green-600";
        if (probability >= 60) return "bg-yellow-600";
        return "bg-red-600";
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Dream":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "Reach":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "Match":
                return "bg-green-100 text-green-800 border-green-200";
            case "Safety":
                return "bg-orange-100 text-orange-800 border-orange-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (!amount) return "Not specified";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white relative w-full overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-start gap-3 pr-16 sm:pr-20 min-w-0">
                    {/* Index Number */}
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                        {index}
                    </div>

                    {/* College Logo */}
                    <div className="flex-shrink-0">
                        {recommendation.college.logo ? (
                            <img
                                src={recommendation.college.logo}
                                alt={`${recommendation.college.name} logo`}
                                className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50 p-1"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-100">
                                <span className="text-gray-600 text-xs font-bold">
                                    {recommendation.college.name.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 block leading-tight truncate">
                                    {recommendation.college.name}
                                </span>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <MapPin size={10} />
                                    <span>{recommendation.college.city}</span>
                                    <span className="mx-1">•</span>
                                    <span>
                                        College Code: {recommendation.college.college_code || recommendation.college.id}
                                    </span>
                                    {recommendation.college.rating && (
                                        <>
                                            <span>•</span>
                                            <span>⭐ {recommendation.college.rating}/5</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Badge
                                className={`${getCategoryColor(recommendation.category)} px-2 py-0.5 text-xs font-medium flex-shrink-0 border`}
                            >
                                {recommendation.category}
                            </Badge>
                        </div>

                        {/* Course Info - More compact */}
                        <div className="bg-blue-50 rounded-lg p-2 mb-2">
                            <div className="text-xs">
                                <div className="font-medium text-blue-900 mb-1">
                                    {recommendation.course_name}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {recommendation.choice_code && (
                                        <span className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-xs border border-blue-200">
                                            Choice Code: {recommendation.choice_code}
                                        </span>
                                    )}
                                    {recommendation.cutoff_percentile && (
                                        <span className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
                                            Previous Year Cutoff: {recommendation.cutoff_percentile}%ile
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category Info */}
                        {recommendation.reservation_category && (
                            <div className="mb-2 px-1">
                                <p className="text-xs text-gray-600">
                                    Category:{" "}
                                    <span className="font-medium text-gray-900">
                                        {recommendation.reservation_category}
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* Metrics Row */}
                        <div className="flex flex-wrap gap-2 mb-2 text-xs">
                            {recommendation.college.fees && (
                                <div className="bg-green-50 rounded-md px-2 py-1 border border-green-100 flex-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-green-800 truncate">
                                            {formatCurrency(recommendation.college.fees)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {recommendation.college.placement && (
                                <div className="bg-purple-50 rounded-md px-2 py-1 border border-purple-100 flex-1">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp size={10} className="text-purple-600" />
                                        <span className="font-medium text-purple-800">
                                            {recommendation.college.placement}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {recommendation.college.Student_Intake && (
                                <div className="bg-blue-50 rounded-md px-2 py-1 border border-blue-100 flex-1">
                                    <div className="flex items-center gap-1">
                                        <Users size={10} className="text-blue-600" />
                                        <span className="font-medium text-blue-800">
                                            {recommendation.college.Student_Intake}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admission Probability */}
                <div className="flex flex-col sm:flex-row items-start justify-between bg-gray-50 rounded-lg p-2 mt-2 gap-2">
                    <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-800">
                                Admission Chances
                            </span>
                            <span
                                className={`text-lg font-bold ${getProbabilityColor(recommendation.admission_probability)}`}
                            >
                                {recommendation.admission_probability}%
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                            Your CET Percentile: 98.5%
                        </p>
                    </div>
                </div>

                {/* External Link Button */}
                <div className="absolute top-3 right-3">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-all duration-200 border-none"
                    >
                        <ExternalLink size={12} />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
};

export const MockRecommendationList = () => {
    const { generatePDF, isGenerating } = usePdfDownload();
    const [activeRound, setActiveRound] = useState("round1");

    const transformedDream = (mockData.data.Dream || []).map(item => transformMockData(item, "Dream"));
    const transformedReach = (mockData.data.Reach || []).map(item => transformMockData(item, "Reach"));
    const transformedMatch = (mockData.data.Match || []).map(item => transformMockData(item, "Match"));
    const transformedSafety = (mockData.data.Safety || []).map(item => transformMockData(item, "Safety"));

    const allTransformed = [
        ...transformedDream,
        ...transformedReach,
        ...transformedMatch,
        ...transformedSafety
    ];

    const handleDownload = () => {
        const mockFormData = {
            preferredStreams: ["Computer Engineering", "IT", "AI & Data Science"],
            preferredCities: ["Pune", "Mumbai", "Nagpur"],
            reservationCategory: "OPEN",
            cetPercentile: 98.5
        };

        generatePDF(allTransformed as any, mockFormData);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Title */}
            <div className="text-center py-4">
                <h1 className="text-2xl sm:text-3xl font-black text-green-700 tracking-tight">
                    Your Personalized Recommendations
                </h1>
            </div>

            {/* Rounds Tabs */}
            <Tabs
                value={activeRound}
                onValueChange={setActiveRound}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 h-12 bg-gray-100/80 p-1 rounded-xl">
                    <TabsTrigger
                        value="round1"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-gray-600 data-[state=active]:text-blue-600 transition-all"
                    >
                        Round 1
                    </TabsTrigger>
                    <TabsTrigger
                        value="round2"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-gray-600 data-[state=active]:text-blue-600 transition-all"
                    >
                        Round 2
                    </TabsTrigger>
                    <TabsTrigger
                        value="round3"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-gray-600 data-[state=active]:text-blue-600 transition-all"
                    >
                        Round 3
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="round1" className="space-y-6 mt-6">
                    <CAPFormInstructions />
                    <RecommendationDisclaimer />

                    {/* Results Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                        <div>
                            <p className="text-lg text-gray-700 font-medium">
                                Found{" "}
                                <span className="font-bold text-blue-600">
                                    300
                                </span>{" "}
                                college recommendations
                            </p>
                        </div>
                        <Button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="w-full sm:w-auto bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-none h-10 px-6 font-bold rounded-lg border border-blue-200 transition-all flex items-center justify-center gap-2"
                        >
                            {isGenerating ? "Generating..." : "Download PDF"}
                        </Button>
                    </div>

                    {/* Results List */}
                    <div className="space-y-4">
                        {allTransformed.map((item, index) => (
                            <MockRecommendationCard key={index} recommendation={item} index={index + 1} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="round2" className="mt-6">
                    <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Round 2 Preview</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Mock Round 2 data will be displayed here based on your preferences.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="round3" className="mt-6">
                    <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Round 3 Preview</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Mock Round 3 data will be displayed here based on your preferences.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MockRecommendationList;
