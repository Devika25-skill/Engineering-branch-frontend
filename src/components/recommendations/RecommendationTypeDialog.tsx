import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Calendar, MapPin } from "lucide-react";

interface RecommendationTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'first-year' | 'direct-second-year') => void;
}

export const RecommendationTypeDialog = ({ 
  open, 
  onOpenChange, 
  onSelectType 
}: RecommendationTypeDialogProps) => {
  const [selectedType, setSelectedType] = useState<'first-year' | 'direct-second-year' | null>(null);

  const handleSelect = (type: 'first-year' | 'direct-second-year') => {
    setSelectedType(type);
    localStorage.setItem('recommendation_type', type);
    onSelectType(type);
    onOpenChange(false);
  };

  const handleClearPreference = () => {
    localStorage.removeItem('recommendation_type');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-3 sm:p-4">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Choose Admission Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {/* First Year Engineering */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] border-2 hover:border-purple-300 touch-manipulation"
            onClick={() => handleSelect('first-year')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-2">
                <GraduationCap className="text-purple-600" size={20} />
              </div>
              <CardTitle className="text-base font-semibold text-purple-700 leading-tight">
                First Year Engineering
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 px-1">
                After 12th grade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0 pb-3">
              <div className="flex items-center text-xs text-gray-600">
                <Users className="w-3 h-3 mr-1.5 text-purple-500 flex-shrink-0" />
                <span>3 Rounds</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-1.5 text-purple-500 flex-shrink-0" />
                <span>Full form</span>
              </div>
            </CardContent>
          </Card>

          {/* Direct Second Year */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] border-2 hover:border-indigo-300 touch-manipulation"
            onClick={() => handleSelect('direct-second-year')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-2">
                <GraduationCap className="text-indigo-600" size={20} />
              </div>
              <CardTitle className="text-base font-semibold text-indigo-700 leading-tight">
                Direct Second Year
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 px-1">
                After diploma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0 pb-3">
              <div className="flex items-center text-xs text-gray-600">
                <Users className="w-3 h-3 mr-1.5 text-indigo-500 flex-shrink-0" />
                <span>2 Rounds</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-1.5 text-indigo-500 flex-shrink-0" />
                <span>Simple form</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="min-h-[40px] text-sm touch-manipulation"
          >
            Cancel
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleClearPreference}
            className="text-xs text-gray-500 hover:text-gray-700 min-h-[32px] touch-manipulation"
          >
            Reset Preference
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};