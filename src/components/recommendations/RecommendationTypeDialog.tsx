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
    // Store selection in localStorage
    localStorage.setItem('recommendation_type', type);
    onSelectType(type);
    onOpenChange(false);
  };

  const handleClearPreference = () => {
    localStorage.removeItem('recommendation_type');
    // Show the dialog again to let user choose
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Admission Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 p-4">
          {/* First Year Engineering */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300"
            onClick={() => handleSelect('first-year')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="text-purple-600" size={32} />
              </div>
              <CardTitle className="text-xl text-purple-700">
                First Year Engineering
              </CardTitle>
              <CardDescription className="text-gray-600">
                For students appearing for MHT-CET after 12th grade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span>For 12th pass students</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-purple-500" />
                <span>3 Rounds of admissions</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                <span>Full preference form</span>
              </div>
            </CardContent>
          </Card>

          {/* Direct Second Year */}
          <Card 
            className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-indigo-300"
            onClick={() => handleSelect('direct-second-year')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="text-indigo-600" size={32} />
              </div>
              <CardTitle className="text-xl text-indigo-700">
                Direct Second Year Engineering
              </CardTitle>
              <CardDescription className="text-gray-600">
                For diploma holders seeking direct admission to 2nd year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                <span>For diploma graduates</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2 text-indigo-500" />
                <span>2 Rounds of admissions</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                <span>Simplified form</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button 
            variant="ghost" 
            onClick={handleClearPreference}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Reset Preference
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};