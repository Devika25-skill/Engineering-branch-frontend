import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Building, Pill } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

interface IntegratedAdmissionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: IntegratedAdmissionType) => void;
}

const admissionTypes = [
  {
    type: 'BCA_MCA_Int' as const,
    title: 'BCA/MCA (Integrated)',
    description: 'Bachelor of Computer Applications with integrated Master\'s',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'BBA_BMS_BBM_MBA_Int' as const,
    title: 'BBA/BMS/BBM/MBA (Int.)',
    description: 'Business Administration programs with integrated MBA',
    icon: Building,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    type: 'B_and_D_Pharmacy' as const,
    title: 'B.Pharmacy/Pharm D',
    description: 'Bachelor of Pharmacy and Doctor of Pharmacy programs',
    icon: Pill,
    gradient: 'from-green-500 to-emerald-500'
  }
];

export function IntegratedAdmissionTypeDialog({ 
  open, 
  onOpenChange, 
  onSelectType 
}: IntegratedAdmissionTypeDialogProps) {
  const [selectedType, setSelectedType] = useState<IntegratedAdmissionType | null>(null);

  const handleSelect = (type: IntegratedAdmissionType) => {
    setSelectedType(type);
    // Store selected type for future reference
    localStorage.setItem('integrated_admission_type', type);
    onSelectType(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-lg border-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-center">
            Choose Your Program Type
          </DialogTitle>
          <p className="text-muted-foreground text-center mt-2">
            Select the integrated program you're interested in
          </p>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          {admissionTypes.map((admission) => {
            const Icon = admission.icon;
            return (
              <Card 
                key={admission.type}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50 bg-gradient-to-r from-background to-background/50"
                onClick={() => handleSelect(admission.type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${admission.gradient} text-white`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">
                        {admission.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {admission.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}