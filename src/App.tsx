
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Colleges from "./pages/Colleges";
import Recommendations from "./pages/Recommendations";
import RecommendationSteps from "./pages/RecommendationSteps";
import RecommendationResults from "./pages/RecommendationResults";
import DiplomaRecommendationSteps from "./pages/DiplomaRecommendationSteps";
import DiplomaRecommendationResults from "./pages/DiplomaRecommendationResults";
import CollegeDetails from "./pages/CollegeDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/recommendations/steps" element={<RecommendationSteps />} />
                <Route path="/recommendations/results" element={<RecommendationResults />} />
                <Route path="/diploma-recommendations/steps" element={<DiplomaRecommendationSteps />} />
                <Route path="/diploma-recommendations/results" element={<DiplomaRecommendationResults />} />
                <Route path="/college/:id" element={<CollegeDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
