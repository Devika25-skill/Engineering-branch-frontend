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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Choose Your Admission Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
          {/* First Year Engineering */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] border-2 hover:border-purple-300 touch-manipulation"
            onClick={() => handleSelect('first-year')}
          >
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <GraduationCap className="text-purple-600" size={24} />
              </div>
              <CardTitle className="text-lg sm:text-xl text-purple-700 leading-tight">
                First Year Engineering
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 px-2">
                For students appearing for MHT-CET after 12th grade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span>For 12th pass students</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span>3 Rounds of admissions</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                <span>Full preference form</span>
              </div>
            </CardContent>
          </Card>

          {/* Direct Second Year */}
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] border-2 hover:border-indigo-300 touch-manipulation"
            onClick={() => handleSelect('direct-second-year')}
          >
            <CardHeader className="text-center pb-3 sm:pb-4">
              <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <GraduationCap className="text-indigo-600" size={24} />
              </div>
              <CardTitle className="text-lg sm:text-xl text-indigo-700 leading-tight">
                Direct Second Year Engineering
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 px-2">
                For diploma holders seeking direct admission to 2nd year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 pt-0">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>For diploma graduates</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>2 Rounds of admissions</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                <span>Simplified form</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t">
          <Button 
            variant="ghost" 
            onClick={handleClearPreference}
            className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px] touch-manipulation"
          >
            Reset Preference
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] px-8 touch-manipulation"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};