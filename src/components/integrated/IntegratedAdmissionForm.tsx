import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/hooks/use-toast';
import { IntegratedAdmissionFormData, IntegratedAdmissionType } from '@/types/integratedAdmission';
import { categoryOptions, districtOptions } from '@/data/integratedAdmissionConfig';
import { GraduationCap, Building, Pill } from 'lucide-react';

interface IntegratedAdmissionFormProps {
  admissionType: IntegratedAdmissionType;
  onSubmit: (data: IntegratedAdmissionFormData) => void;
  isLoading?: boolean;
}

const getAdmissionTypeInfo = (type: IntegratedAdmissionType) => {
  switch (type) {
    case 'BCA_MCA_Int':
      return { 
        title: 'BCA/MCA (Integrated)', 
        icon: GraduationCap,
        gradient: 'from-blue-500 to-cyan-500'
      };
    case 'BBA_BMS_BBM_MBA_Int':
      return { 
        title: 'BBA/BMS/BBM/MBA (Int.)', 
        icon: Building,
        gradient: 'from-purple-500 to-pink-500'
      };
    case 'B_and_D_Pharmacy':
      return { 
        title: 'B.Pharmacy/Pharm D', 
        icon: Pill,
        gradient: 'from-green-500 to-emerald-500'
      };
  }
};

export function IntegratedAdmissionForm({ 
  admissionType, 
  onSubmit, 
  isLoading = false 
}: IntegratedAdmissionFormProps) {
  const [formData, setFormData] = useState<IntegratedAdmissionFormData>({
    exam_type: admissionType,
    category: '',
    district: '',
    tenth_percentage: undefined,
    twelth_percentage: undefined,
    score: undefined // Changed from 0 to undefined for better UX
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const admissionInfo = getAdmissionTypeInfo(admissionType);
  const Icon = admissionInfo.icon;

  useEffect(() => {
    // Load saved data from localStorage first (for form persistence)
    const savedData = localStorage.getItem(`integrated_form_${admissionType}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);
    }
  }, [admissionType]);

  // Add effect to load existing configuration from API
  useEffect(() => {
    const loadExistingConfiguration = async () => {
      try {
        const { integratedAdmissionApi } = await import('@/services/integratedAdmissionApi');
        const response = await integratedAdmissionApi.getConfiguration();
        
        if (response.success && response.data.length > 0) {
          // Find configuration for current admission type
          const currentConfig = response.data.find(config => config.exam_type === admissionType);
          
          if (currentConfig) {
            const newFormData = {
              exam_type: currentConfig.exam_type,
              category: currentConfig.category,
              district: currentConfig.district || undefined,
              tenth_percentage: currentConfig.tenth_percentage || undefined,
              twelth_percentage: currentConfig.twelth_percentage || undefined,
              score: currentConfig.score
            };
            setFormData(newFormData);
            localStorage.setItem(`integrated_form_${admissionType}`, JSON.stringify(newFormData));
          }
        }
      } catch (error) {
        console.error('Error loading existing configuration:', error);
        // Don't show error to user, just continue with empty form
      }
    };

    // Only load from API if we're logged in
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      loadExistingConfiguration();
    }
  }, [admissionType]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.district) {
          newErrors.district = 'District is required';
        }
    if (formData.score === undefined || formData.score === null) {
      newErrors.score = 'MHT-CET score is required';
    } else if (formData.score < 0 || formData.score > 100) {
      newErrors.score = 'MHT-CET score must be between 0 and 100';
    }

    if (formData.tenth_percentage !== undefined && formData.tenth_percentage !== null) {
      if (formData.tenth_percentage < 0 || formData.tenth_percentage > 100) {
        newErrors.tenth_percentage = '10th marks must be between 0 and 100';
      }
    }

    if (formData.twelth_percentage !== undefined && formData.twelth_percentage !== null) {
      if (formData.twelth_percentage < 0 || formData.twelth_percentage > 100) {
        newErrors.twelth_percentage = '12th marks must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again.",
        variant: "destructive"
      });
      return;
    }

    // Save form data
    localStorage.setItem(`integrated_form_${admissionType}`, JSON.stringify(formData));
    
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof IntegratedAdmissionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Simplified handler for number inputs with proper decimal validation
  const handleNumberInputChange = (field: keyof IntegratedAdmissionFormData, inputValue: string) => {
    // Allow empty input
    if (inputValue === '' || inputValue === null) {
      handleInputChange(field, undefined);
      return;
    }
    handleInputChange(field, inputValue);

  };

  // Simplified keydown handler for better decimal support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys, backspace, delete, etc.
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'Home' || e.key === 'End' || e.ctrlKey || e.metaKey) {
      return;
    }

    // Allow decimal point only if there isn't one already
    if (e.key === '.' && !e.currentTarget.value.includes('.')) {
      return;
    }

    // Only allow digits
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    // Check if adding this digit would create a value over 100
    const currentString = e.currentTarget.value;
    const cursorPosition = e.currentTarget.selectionStart || 0;
    const newValue = currentString.slice(0, cursorPosition) + e.key + currentString.slice(e.currentTarget.selectionEnd || 0);
    
    // Parse the potential new value - only prevent if it's clearly over 100
    const newNumericValue = parseFloat(newValue);
    if (!isNaN(newNumericValue) && newNumericValue > 100) {
      e.preventDefault();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="border-2 border-border/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full bg-gradient-to-r ${admissionInfo.gradient} text-white`}>
              <Icon size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {admissionInfo.title}
          </CardTitle>
          <CardDescription className="text-lg">
            Enter your academic details to get personalized recommendations
          </CardDescription>
        </CardHeader>

        <CardContent>  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Reservation Category *
              </Label>
              <SearchableSelect
                key={`${admissionType}-${formData.category}`}
                options={categoryOptions[admissionType]}
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                placeholder="Select your category"
                searchPlaceholder="Search categories..."
                className={errors.category ? 'border-destructive' : ''}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Select The District Where Your Most Recent College Is Located *
              </Label>
              <SearchableSelect
                key={`${admissionType}-${formData.district}`}
                options={districtOptions[admissionType]}
                value={formData.district}
                onValueChange={(value) => handleInputChange('district', value)}
                placeholder="Select your district"
                searchPlaceholder="Search districts..."
                className={errors.district ? 'border-destructive' : ''}
              />
              {errors.district && (
                <p className="text-sm text-destructive">{errors.district}</p>
              )}
            </div>

            {/* MHT-CET Score */}
            <div className="space-y-2">
              <Label htmlFor="score" className="text-sm font-medium">
                MHT-CET Score * (0-100)
              </Label>
              <Input
                id="score"
                type="float"
                min="0"
                max="100.000"
                value={formData.score ?? ''}
                onChange={(e) => handleNumberInputChange('score', e.target.value)}
                onKeyDown={handleKeyDown}
                className={errors.score ? 'border-destructive' : ''}
                placeholder="Enter your MHT-CET score (0-100)"
              />
              {errors.score && (
                <p className="text-sm text-destructive">{errors.score}</p>
              )}
            </div>

            {/* 10th Marks */}
            <div className="space-y-2">
              <Label htmlFor="tenth" className="text-sm font-medium">
                10th Grade Marks (%) - Optional
              </Label>
              <Input
                id="tenth"
                type="float"
                min="0"
                max="100.000"
                value={formData.tenth_percentage ?? ''}
                onChange={(e) => handleNumberInputChange('tenth_percentage', e.target.value)}
                onKeyDown={handleKeyDown}
                className={errors.tenth_percentage ? 'border-destructive' : ''}
                placeholder="Enter your 10th grade percentage"
              />
              {errors.tenth_percentage && (
                <p className="text-sm text-destructive">{errors.tenth_percentage}</p>
              )}
            </div>

            {/* 12th Marks */}
            <div className="space-y-2">
              <Label htmlFor="twelth" className="text-sm font-medium">
                12th Grade Marks (%) - Optional
              </Label>
              <Input
                id="twelth"
                type="float"
                min="0"
                max="100"
                step="0.01"
                value={formData.twelth_percentage ?? ''}
                onChange={(e) => handleNumberInputChange('twelth_percentage', e.target.value)}
                onKeyDown={handleKeyDown}
                className={errors.twelth_percentage ? 'border-destructive' : ''}
                placeholder="Enter your 12th grade percentage"
              />
              {errors.twelth_percentage && (
                <p className="text-sm text-destructive">{errors.twelth_percentage}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Preferences & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}