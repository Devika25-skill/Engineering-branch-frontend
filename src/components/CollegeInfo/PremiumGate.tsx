
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Star, CreditCard } from "lucide-react";

interface PremiumGateProps {
  isLoggedIn?: boolean;
  isPremium?: boolean;
  onUpgrade: () => void;
  onLogin?: () => void;
}

const PremiumGate = ({ isLoggedIn = false, isPremium = false, onUpgrade, onLogin }: PremiumGateProps) => {
  if (!isLoggedIn) {
    return (
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} className="text-orange-600" />
          </div>
          <CardTitle className="text-xl text-gray-800">Login Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Please log in to access detailed college information including courses, fees, facilities, and placement details.
          </p>
          <Button 
            onClick={onLogin}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
          >
            Login to Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
            <Crown size={32} className="text-purple-600" />
          </div>
          <CardTitle className="text-xl text-gray-800 flex items-center justify-center gap-2">
            <Star className="text-yellow-500 fill-current" size={20} />
            Premium Content
            <Star className="text-yellow-500 fill-current" size={20} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Unlock detailed information about courses, fee structure, facilities, placement details, and admission requirements.
          </p>
          
          <div className="bg-white/80 p-4 rounded-lg border border-purple-100">
            <h4 className="font-semibold text-gray-800 mb-2">Premium Features Include:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Detailed course information and intake</li>
              <li>• Complete fee breakdown</li>
              <li>• Campus facilities and infrastructure</li>
              <li>• Placement statistics and company list</li>
              <li>• Admission process and requirements</li>
            </ul>
          </div>
          
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 flex items-center gap-2"
          >
            <CreditCard size={16} />
            Upgrade to Premium
          </Button>
          
          <p className="text-xs text-gray-500">
            Starting at ₹99/month • Cancel anytime
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default PremiumGate;
