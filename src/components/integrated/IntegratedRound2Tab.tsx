import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

interface IntegratedRound2TabProps {
  admissionType: IntegratedAdmissionType;
}

export const IntegratedRound2Tab = ({ admissionType }: IntegratedRound2TabProps) => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Round 2 Results Coming Soon
              </h3>
              <p className="text-yellow-700 text-sm max-w-md mx-auto">
                Round 2 counseling will begin after Round 1 completion. This round includes seat upgradation 
                and fresh allocation for vacant seats.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-600">
              <Sparkles className="w-4 h-4" />
              <span>Opportunity for better choices awaits!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};