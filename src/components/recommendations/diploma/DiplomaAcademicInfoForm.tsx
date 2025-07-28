import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, User, AlertCircle } from "lucide-react";

interface DiplomaAcademicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const DiplomaAcademicInfoForm = ({ data, onUpdate, validationErrors = [] }: DiplomaAcademicInfoFormProps) => {
  // Set default values when component mounts
  useEffect(() => {
    const defaultData = {
      reservationCategory: data.reservationCategory || "GOPENS"
    };
    
    // Only update if the values are different from current data
    if (!data.reservationCategory) {
      onUpdate(defaultData);
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePercentageChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      onUpdate({ [field]: numValue || undefined });
    }
  };

  const isFieldError = (fieldName: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  const getFieldClassName = (fieldName: string, baseClass: string = "") => {
    return isFieldError(fieldName) 
      ? `${baseClass} border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200` 
      : baseClass;
  };

  // Updated reservation categories to match API codes
  const reservationCategories = [
  { "code": "GOPEN", "label": "General – Open" },
  { "code": "GOBC", "label": "General – Other Backward Class (OBC)" },
  { "code": "GNTA", "label": "General – Nomadic Tribe A (NT-A)" },
  { "code": "GNTB", "label": "General – Nomadic Tribe B (NT-B)" },
  { "code": "GNTC", "label": "General – Nomadic Tribe C (NT-C)" },
  { "code": "GNTD", "label": "General – Nomadic Tribe D (NT-D)" },
  { "code": "GSC", "label": "General – Scheduled Caste (SC)" },
  { "code": "GSEBC", "label": "General – Socially and Educationally Backward Class (SEBC)" },
  { "code": "GST", "label": "General – Scheduled Tribe (ST)" },
  { "code": "LNTA", "label": "Ladies – Nomadic Tribe A (NT-A)" },
  { "code": "LNTB", "label": "Ladies – Nomadic Tribe B (NT-B)" },
  { "code": "LNTC", "label": "Ladies – Nomadic Tribe C (NT-C)" },
  { "code": "LNTD", "label": "Ladies – Nomadic Tribe D (NT-D)" },
  { "code": "LOBC", "label": "Ladies – Other Backward Class (OBC)" },
  { "code": "LOPEN", "label": "Ladies – Open" },
  { "code": "LSC", "label": "Ladies – Scheduled Caste (SC)" },
  { "code": "LSEBC", "label": "Ladies – Socially and Educationally Backward Class (SEBC)" },
  { "code": "DEF-O", "label": "Defence – Open" },
  { "code": "DEF-OBC", "label": "Defence – Other Backward Class (OBC)" },
  { "code": "DEFR-NTA", "label": "Defence – Reserved – Nomadic Tribe A (NT-A)" },
  { "code": "DEFR-NTB", "label": "Defence – Reserved – Nomadic Tribe B (NT-B)" },
  { "code": "DEFR-OBC", "label": "Defence – Reserved – Other Backward Class (OBC)" },
  { "code": "DEFR-SC", "label": "Defence – Reserved – Scheduled Caste (SC)" },
  { "code": "DEFR-SEBC", "label": "Defence – Reserved – Socially and Educationally Backward Class (SEBC)" },
  { "code": "DEFR-ST", "label": "Defence – Reserved – Scheduled Tribe (ST)" },
  { "code": "EWS", "label": "Economically Weaker Sections" },
  { "code": "LST", "label": "Ladies – Scheduled Tribe (ST)" },
  { "code": "MI", "label": "Minority Institute" },
  { "code": "ORP", "label": "Orphan Category" },
  { "code": "PWD-O", "label": "Persons with Disabilities – Open" },
  { "code": "PWD-OBC", "label": "Persons with Disabilities – Other Backward Class (OBC)" },
  { "code": "PWDR-OBC", "label": "Persons with Disabilities – Reserved – OBC" },
  { "code": "PWDR-SC", "label": "Persons with Disabilities – Reserved – Scheduled Caste (SC)" },
  { "code": "PWDR-SEBC", "label": "Persons with Disabilities – Reserved – SEBC" },
  { "code": "VLSI", "label": "Very Large Scale Integration (VLSI) Quota or Branch" }
];

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <GraduationCap size={14} />
              Reservation Category
              <span className="text-red-500">*</span>
              {isFieldError('Reservation Category') && <AlertCircle size={14} className="text-red-500" />}
            </Label>
            <Select 
              onValueChange={(value) => handleChange('reservationCategory', value)} 
              value={data.reservationCategory || "GOPENS"}
            >
              <SelectTrigger className={getFieldClassName('Reservation Category', "h-10 rounded-xl border-2 bg-white")}>
                <SelectValue placeholder="Select your category" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {reservationCategories.map((category) => (
                  <SelectItem key={category.code} value={category.code}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <GraduationCap className="text-white" size={16} />
            </div>
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              📊 Last Year Diploma Percentage
              <span className="text-red-500">*</span>
              {isFieldError('Last Year Diploma Percentage') && <AlertCircle size={14} className="text-red-500" />}
            </Label>
            <Input
              type="number"
              placeholder="Enter your diploma percentage"
              value={data.diplomaPercentage || ''}
              onChange={(e) => handlePercentageChange('diplomaPercentage', e.target.value)}
              className={getFieldClassName('Last Year Diploma Percentage', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
              min="0"
              max="100"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};