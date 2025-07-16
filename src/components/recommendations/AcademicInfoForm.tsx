
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, User, Award, AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface AcademicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const AcademicInfoForm = ({ data, onUpdate, validationErrors = [] }: AcademicInfoFormProps) => {
  // Set default values when component mounts
  useEffect(() => {
    const defaultData = {
      reservationCategory: data.reservationCategory || "GOPENS",
      grouping: data.grouping || "PCM (Physics, Chemistry, Mathematics)"
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
    { code: "GOPENS", label: "General – Open" },
    { code: "GSCS", label: "General – Scheduled Caste (SC)" },
    { code: "GSTS", label: "General – Scheduled Tribe (ST)" },
    { code: "GVJS", label: "General – Vimukta Jati/De-notified Tribes (VJ/DT)" },
    { code: "GNT1S", label: "General – Nomadic Tribe 1 (NT1)" },
    { code: "GNT2S", label: "General – Nomadic Tribe 2 (NT2)" },
    { code: "GNT3S", label: "General – Nomadic Tribe 3 (NT3)" },
    { code: "GOBCS", label: "General – Other Backward Class (OBC)" },
    { code: "LOPENS", label: "Ladies – Open" },
    { code: "LSCS", label: "Ladies – Scheduled Caste (SC)" },
    { code: "LNT2S", label: "Ladies – Nomadic Tribe 2 (NT2)" },
    { code: "LOBCS", label: "Ladies – Other Backward Class (OBC)" },
    { code: "DEFOPENS", label: "Defence – Open" },
    { code: "TFWS", label: "Tuition Fee Waiver Scheme" },
    { code: "DEFROBCS", label: "Defence – Other Backward Class (OBC)" },
    { code: "EWS", label: "Economically Weaker Sections" }
  ];

  const groupingOptions = [
    "PCM (Physics, Chemistry, Mathematics)", 
    "PCB (Physics, Chemistry, Biology)",
    "PCMB (Physics, Chemistry, Mathematics, Biology)"
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
                <SelectContent>
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
                value={data.grouping || "PCM (Physics, Chemistry, Mathematics)"}
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
                🎯 Grouping Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError('Grouping Marks') && <AlertCircle size={14} className="text-red-500" />}
              </Label>
              <Input
                type="number"
                placeholder="Enter your grouping marks"
                value={data.groupingMarks || ''}
                onChange={(e) => handlePercentageChange('groupingMarks', e.target.value)}
                className={getFieldClassName('Grouping Marks', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Entrance Exams - Making CET required */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
              🎯 Entrance Exam Scores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  CET Percentile
                  <span className="text-red-500">*</span>
                  {isFieldError('CET Percentile') && <AlertCircle size={14} className="text-red-500" />}
                </Label>
                <Input
                  type="number"
                  placeholder="Your CET percentile (0-100)"
                  value={data.cetPercentile || ''}
                  onChange={(e) => handlePercentageChange('cetPercentile', e.target.value)}
                  className={getFieldClassName('CET Percentile', "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none")}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">JEE Percentile <span className="text-xs text-slate-500">(Optional)</span></Label>
                <Input
                  type="number"
                  placeholder="Your JEE percentile (0-100)"
                  value={data.jeePercentile || ''}
                  onChange={(e) => handlePercentageChange('jeePercentile', e.target.value)}
                  className="h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">Other Exam Name <span className="text-xs text-slate-500">(Optional)</span></Label>
                <Input
                  placeholder="e.g., BITSAT, VITEEE, COMEDK"
                  value={data.otherExamName || ''}
                  onChange={(e) => handleChange('otherExamName', e.target.value)}
                  className="h-10 rounded-xl border-2 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">Other Exam Score <span className="text-xs text-slate-500">(Optional)</span></Label>
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

      {/* Achievements Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Award className="text-white" size={16} />
            </div>
            Your Achievements <span className="text-sm text-slate-500 font-normal">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                🏆 Sports & Leadership
              </Label>
              <Textarea
                placeholder="State-level cricket, student council president, debate competitions..."
                value={data.sportsAchievements || ''}
                onChange={(e) => handleChange('sportsAchievements', e.target.value)}
                rows={2}
                className="rounded-xl border-2 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                💻 Certifications & Courses
              </Label>
              <Textarea
                placeholder="Python certification, web development course, cloud computing..."
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
                placeholder="Summer internship, part-time job, freelance projects..."
                value={data.internships || ''}
                onChange={(e) => handleChange('internships', e.target.value)}
                rows={2}
                className="rounded-xl border-2 bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium flex items-center gap-2 text-sm">
                ⭐ Other Cool Stuff
              </Label>
              <Textarea
                placeholder="Hackathon winner, published research, volunteer work..."
                value={data.otherAchievements || ''}
                onChange={(e) => handleChange('otherAchievements', e.target.value)}
                rows={2}
                className="rounded-xl border-2 bg-white resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
