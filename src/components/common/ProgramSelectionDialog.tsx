import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, MapPin, Building, Pill, Heart, LucideIcon } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

type RecommendationType = 'first-year' | 'direct-second-year';
export type ProgramType = RecommendationType | IntegratedAdmissionType;

interface ProgramOption {
  id: ProgramType;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  details: string[];
}

interface ProgramSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectProgram: (program: ProgramType) => void;
}

const allPrograms: ProgramOption[] = [
  // Engineering Programs (First Year & Direct Second Year)
  {
    id: 'first-year' as const,
    title: 'First Year Engineering',
    description: 'After 12th grade',
    icon: GraduationCap,
    gradient: 'from-purple-500 to-purple-600',
    details: ['3 Rounds', 'Full form']
  },
  {
    id: 'direct-second-year' as const,
    title: 'Direct Second Year',
    description: 'After diploma',
    icon: GraduationCap,
    gradient: 'from-indigo-500 to-indigo-600',
    details: ['2 Rounds', 'Simple form']
  },
  // Integrated Programs
  {
    id: 'BCA_MCA_Int' as const,
    title: 'BCA/MCA (Integrated)',
    description: 'Bachelor of Computer Applications with integrated Master\'s',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-cyan-500',
    details: ['3 Rounds', 'Integrated program']
  },
  {
    id: 'BBA_BMS_BBM_MBA_Int' as const,
    title: 'BBA/BMS/BBM/MBA (Int.)',
    description: 'Business Administration programs with integrated MBA',
    icon: Building,
    gradient: 'from-emerald-500 to-teal-500',
    details: ['3 Rounds', 'Business focus']
  },
  {
    id: 'B_and_D_Pharmacy' as const,
    title: 'B.Pharmacy/Pharm D',
    description: 'Bachelor of Pharmacy and Doctor of Pharmacy programs',
    icon: Pill,
    gradient: 'from-green-500 to-emerald-500',
    details: ['3 Rounds', 'Healthcare sector']
  },
  {
    id: 'First_Year_Medical' as const,
    title: 'First Year Medical',
    description: 'Medical and allied health sciences programs',
    icon: Heart,
    gradient: 'from-red-500 to-pink-500',
    details: ['3 Rounds', 'Medical programs']
  }
];

export function ProgramSelectionDialog({
  open,
  onOpenChange,
  onSelectProgram
}: ProgramSelectionDialogProps) {
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);

  const handleSelect = (program: ProgramType) => {
    console.log('ProgramSelectionDialog - Selected program:', program);
    console.log('ProgramSelectionDialog - onSelectProgram exists?', typeof onSelectProgram);
    setSelectedProgram(program);
    
    // Store selected program for future reference
    if (program === 'first-year' || program === 'direct-second-year') {
      localStorage.setItem('recommendation_type', program as RecommendationType);
      console.log('ProgramSelectionDialog - Stored as recommendation_type:', program);
    } else {
      localStorage.setItem('integrated_admission_type', program as IntegratedAdmissionType);
      console.log('ProgramSelectionDialog - Stored as integrated_admission_type:', program);
    }
    
    // Close dialog immediately
    onOpenChange(false);
    
    // Call the callback in the next tick to ensure dialog is closed
    requestAnimationFrame(() => {
      console.log('ProgramSelectionDialog - About to call onSelectProgram with:', program);
      try {
        onSelectProgram(program);
        console.log('ProgramSelectionDialog - onSelectProgram called successfully');
      } catch (error) {
        console.error('ProgramSelectionDialog - Error calling onSelectProgram:', error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-lg border-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-center leading-tight">
            Choose Your Program Type
          </DialogTitle>
          <p className="text-muted-foreground text-center mt-2 text-sm sm:text-base">
            Select the program that matches your educational background
          </p>
        </DialogHeader>
        
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {allPrograms.map((program) => {
            const Icon = program.icon;
            return (
              <Card 
                key={program.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-2 hover:border-primary/50 bg-gradient-to-r from-background to-background/50 touch-manipulation"
                onClick={() => handleSelect(program.id)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${program.gradient} text-white flex-shrink-0`}>
                      <Icon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight">
                        {program.title}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">
                        {program.description}
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                        {program.details.map((detail, index) => (
                          <div key={index} className="flex items-center text-xs text-muted-foreground">
                            {index === 0 && <Users className="w-3 h-3 mr-1 flex-shrink-0" />}
                            {index === 1 && <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />}
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <div className="flex justify-center pt-2 sm:pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-6 sm:px-8 min-h-[40px] touch-manipulation"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}