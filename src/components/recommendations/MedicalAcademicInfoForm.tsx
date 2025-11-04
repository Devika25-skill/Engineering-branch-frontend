import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, User, Award, AlertCircle, ChevronDown } from "lucide-react";
import { useEffect } from "react";

interface MedicalAcademicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const MedicalAcademicInfoForm = ({ data, onUpdate, validationErrors = [] }: MedicalAcademicInfoFormProps) => {
  // Set default values when component mounts
  useEffect(() => {
    const defaultData = {
      reservationCategory: data.reservationCategory || "GOPENS",
      grouping: data.grouping || "PCB (Physics, Chemistry, Biology)"
    };
    
    // Only update if the values are different from current data
    if (!data.reservationCategory || !data.grouping) {
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

  const handleRankChange = (field: string, value: string) => {
    const numValue = parseInt(value);
    if (value === '' || numValue > 0) {
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

  const reservationCategories = [
    { "code": "GOPENS", "label": "General – Open" },
    { "code": "GSCS", "label": "General – Scheduled Caste (SC)" },
    { "code": "GSTS", "label": "General – Scheduled Tribe (ST)" },
    { "code": "GVJS", "label": "General – Vimukta Jati/De-notified Tribes (VJ/DT)" },
    { "code": "GNT1S", "label": "General – Nomadic Tribe 1 (NT1)" },
    { "code": "GNT2S", "label": "General – Nomadic Tribe 2 (NT2)" },
    { "code": "GNT3S", "label": "General – Nomadic Tribe 3 (NT3)" },
    { "code": "GOBCS", "label": "General – Other Backward Class (OBC)" },
    { "code": "GSEBCS", "label": "General – Socially and Educationally Backward Class (SEBC)" },
    { "code": "LOPENS", "label": "Ladies – Open" },
    { "code": "LSCS", "label": "Ladies – Scheduled Caste (SC)" },
    { "code": "LSTS", "label": "Ladies – Scheduled Tribe (ST)" },
    { "code": "LVJS", "label": "Ladies – Vimukta Jati/De-notified Tribes (VJ/DT)" },
    { "code": "LNT1S", "label": "Ladies – Nomadic Tribe 1 (NT1)" },
    { "code": "LNT2S", "label": "Ladies – Nomadic Tribe 2 (NT2)" },
    { "code": "LOBCS", "label": "Ladies – Other Backward Class (OBC)" },
    { "code": "LSEBCS", "label": "Ladies – Socially and Educationally Backward Class (SEBC)" },
    { "code": "PWDOPENS", "label": "Persons with Disabilities – Open" },
    { "code": "PWDOBCS", "label": "Persons with Disabilities – Other Backward Class (OBC)" },
    { "code": "DEFOPENS", "label": "Defence – Open" },
    { "code": "DEFSCS", "label": "Defence – Scheduled Caste (SC)" },
    { "code": "DEFOBCS", "label": "Defence – Other Backward Class (OBC)" },
    { "code": "DEFSEBCS", "label": "Defence – Socially and Educationally Backward Class (SEBC)" },
    { "code": "TFWS", "label": "Tuition Fee Waiver Scheme" },
    { "code": "PWDRNT3S", "label": "Persons with Disabilities – Nomadic Tribe 3 (NT3)" },
    { "code": "DEFRNT3S", "label": "Defence – Nomadic Tribe 3 (NT3)" },
    { "code": "PWDROBC", "label": "Persons with Disabilities – Reserved OBC" },
    { "code": "DEFRSEBCS", "label": "Defence – Reserved SEBC" },
    { "code": "ORPHAN", "label": "Orphan Category" },
    { "code": "EWS", "label": "Economically Weaker Sections" }
  ];

  const groupingOptions = [
    "PCB (Physics, Chemistry, Biology)",
    "PCMB (Physics, Chemistry, Mathematics, Biology)",
    "PCM (Physics, Chemistry, Mathematics)"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <GraduationCap size={14} />
                12th Grade Grouping
                <span className="text-red-500">*</span>
                {isFieldError('12th Grade Grouping') && <AlertCircle size={14} className="text-red-500" />}
              </Label>
              <Select 
                onValueChange={(value) => handleChange('grouping', value)} 
                value={data.grouping || "PCB (Physics, Chemistry, Biology)"}
              >
                <SelectTrigger className={getFieldClassName('12th Grade Grouping', "h-10 rounded-xl border-2 bg-white")}>
                  <SelectValue placeholder="What did you study in 12th?" />
                </SelectTrigger>
                <SelectContent>
                  {groupingOptions.map((grouping) => (
                    <SelectItem key={grouping} value={grouping}>
                      {grouping}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                📊 10th Grade Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError('10th Grade Marks') && <AlertCircle size={14} className="text-red-500" />}
              </Label>
              <Input
                type="number"
                placeholder="Enter your 10th percentage"
                value={data.tenthMarks || ''}
                onChange={(e) => handlePercentageChange('tenthMarks', e.target.value)}
                className={getFieldClassName('10th Grade Marks', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                📈 12th Grade Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError('12th Grade Marks') && <AlertCircle size={14} className="text-red-500" />}
              </Label>
              <Input
                type="number"
                placeholder="Enter your 12th percentage"
                value={data.twelfthMarks || ''}
                onChange={(e) => handlePercentageChange('twelfthMarks', e.target.value)}
                className={getFieldClassName('12th Grade Marks', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                🎯 Grouping (PCB) Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError('Grouping Marks') && <AlertCircle size={14} className="text-red-500" />}
              </Label>
              <Input
                type="number"
                placeholder="Enter PCB marks"
                value={data.groupingMarks || ''}
                onChange={(e) => handlePercentageChange('groupingMarks', e.target.value)}
                className={getFieldClassName('Grouping Marks', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Entrance Exams - Medical specific */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
              🎯 Entrance Exam Scores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  UG-NEET Percentile (%)
                  <span className="text-red-500">*</span>
                  {isFieldError('NEET Percentile') && <AlertCircle size={14} className="text-red-500" />}
                </Label>
                <Input
                  type="number"
                  placeholder="Your NEET percentile (0-100)"
                  value={data.neetPercentile || ''}
                  onChange={(e) => handlePercentageChange('neetPercentile', e.target.value)}
                  className={getFieldClassName('NEET Percentile', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  All India Rank
                  <span className="text-red-500">*</span>
                  {isFieldError('All India Rank') && <AlertCircle size={14} className="text-red-500" />}
                </Label>
                <Input
                  type="number"
                  placeholder="Your NEET AIR"
                  value={data.neetAllIndiaRank || ''}
                  onChange={(e) => handleRankChange('neetAllIndiaRank', e.target.value)}
                  className={getFieldClassName('All India Rank', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  NEET Roll Number
                  <span className="text-red-500">*</span>
                  {isFieldError('NEET Roll Number') && <AlertCircle size={14} className="text-red-500" />}
                </Label>
                <Input
                  placeholder="Enter your NEET roll number"
                  value={data.neetRollNumber || ''}
                  onChange={(e) => handleChange('neetRollNumber', e.target.value)}
                  className={getFieldClassName('NEET Roll Number', "h-10 rounded-xl border-2 bg-white")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">Another Exam Name <span className="text-xs text-slate-500">(Optional)</span></Label>
                <Input
                  placeholder="e.g., AIIMS, JIPMER"
                  value={data.otherExamName || ''}
                  onChange={(e) => handleChange('otherExamName', e.target.value)}
                  className="h-10 rounded-xl border-2 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">Another Exam Score <span className="text-xs text-slate-500">(Optional)</span></Label>
                <Input
                  type="number"
                  placeholder="Your score/percentile"
                  value={data.otherExamPercentile || ''}
                  onChange={(e) => handleChange('otherExamPercentile', parseFloat(e.target.value) || undefined)}
                  className="h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Card - Collapsible */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
        <details className="group">
          <summary className="cursor-pointer p-6 pb-4 hover:bg-purple-50/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold text-slate-800">
                Your Achievements <span className="text-sm text-slate-500 font-normal">(Optional)</span>
              </span>
              <div className="ml-auto transform transition-transform duration-200 group-open:rotate-180">
                <ChevronDown className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </summary>
          
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                  🏆 Sports & Leadership
                </Label>
                <Textarea
                  placeholder="State-level sports, student council, volunteer work..."
                  value={data.sportsAchievements || ''}
                  onChange={(e) => handleChange('sportsAchievements', e.target.value)}
                  rows={2}
                  className="rounded-xl border-2 bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                  📚 Certifications & Courses
                </Label>
                <Textarea
                  placeholder="First aid certification, medical workshops, biology olympiad..."
                  value={data.certifications || ''}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  rows={2}
                  className="rounded-xl border-2 bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                  💼 Work Experience
                </Label>
                <Textarea
                  placeholder="Hospital volunteering, health camp participation, research..."
                  value={data.internships || ''}
                  onChange={(e) => handleChange('internships', e.target.value)}
                  rows={2}
                  className="rounded-xl border-2 bg-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                  ⭐ Other Unique Achievements
                </Label>
                <Textarea
                  placeholder="Research papers, science exhibitions, community service..."
                  value={data.otherAchievements || ''}
                  onChange={(e) => handleChange('otherAchievements', e.target.value)}
                  rows={2}
                  className="rounded-xl border-2 bg-white resize-none"
                />
              </div>
            </div>
          </div>
        </details>
      </Card>
    </div>
  );
};
