import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { MockRecommendationList } from "@/components/MockRecommendationList";

const MockRecommendationPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Navigation />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <Button
                        variant="ghost"
                        onClick={() => window.close()}
                        className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Registration
                    </Button>

                    <div className="hidden sm:block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                        Premium Preview Mode
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    <MockRecommendationList />
                </div>
            </div>

            <div className="hidden print:block text-center text-[10px] text-gray-400 mt-10">
                Generated via Future Bridge Mock Portal demo
            </div>
        </div>
    );
};

export default MockRecommendationPage;
