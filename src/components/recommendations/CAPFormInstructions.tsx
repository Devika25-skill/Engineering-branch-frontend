import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Info, Target, CheckCircle, Shield, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const CAPFormInstructions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg mb-6 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 hover:bg-blue-100 text-left"
          >
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600" />

              <span className="font-semibold text-blue-800">Click here to know How to Fill Your CAP Form</span>

            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-blue-600 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-6 text-sm">
            {/* Main Instructions */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-3">📝 Step-by-Step Guide:</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-800">1. Follow the Order, Top to Bottom:</span>
                  <p className="text-gray-600 mt-1">Simply copy the colleges and branches exactly as they appear on this list, from top to bottom, into your official CAP application form.</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-800">2. Dream & Reach First:</span>
                  <p className="text-gray-600 mt-1">The colleges at the top of this list are your "Dream" and "Reach" options. While your score may not match the last year cut-offs of these colleges, placing them first gives you the best opportunity to get into your most desired or higher-ranked institutions in case a position opens up in subsequent rounds.</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-800">3. Match & Safety Next:</span>
                  <p className="text-gray-600 mt-1">The "Match" and "Safety" colleges are next. These are also sequenced based on your chances to get into the best college out of these. These options are strategically placed to ensure that even if you don't make it into top choices in Dream or Reach, you'll secure admission to the best possible college that fits your profile.</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-800">4. No Guesswork, No Mistakes:</span>
                  <p className="text-gray-600 mt-1">This optimized sequence eliminates common errors and guesswork, ensuring you leverage every opportunity without missing out on a valuable seat.</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-center">
                  🎯 By following this recommended order, you're not just filling a form – you're executing a smart strategy for your engineering future. Go ahead, fill your form with confidence!
                </p>
              </div>
            </div>

            {/* Category Explanations */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-4">📊 Understanding the Categories:</h3>
              
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                <div className="p-3 border border-purple-200 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="h-4 w-4 text-purple-600" />
                    <span className="font-semibold text-purple-800">Dream Colleges</span>
                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{'<50% chance'}</span>
                  </div>
                  <p className="text-purple-700 text-xs">These are colleges that perfectly align with your preferences but your percentile is below their typical cut-off. Challenging but worth including for your highest aspirations.</p>
                </div>

                <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-800">Reach Colleges</span>
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">50-70% chance</span>
                  </div>
                  <p className="text-orange-700 text-xs">Ambitious but within grasp. Your percentile is close to their cut-off. You have a solid chance with these excellent options.</p>
                </div>

                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">Match Colleges</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">75-90% chance</span>
                  </div>
                  <p className="text-green-700 text-xs">Great fit for your profile. Your percentile is comfortably within their range. Very strong likelihood of admission.</p>
                </div>

                <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Safety Colleges</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{'>90% chance'}</span>
                  </div>
                  <p className="text-blue-700 text-xs">Highly probable admission. Your percentile is well above their cut-off. These provide peace of mind and guaranteed admission.</p>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};