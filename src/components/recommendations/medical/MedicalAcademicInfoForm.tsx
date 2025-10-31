import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, GraduationCap, Trophy, Award, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { medicalGroupings } from "@/types/medical";

interface MedicalAcademicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const MedicalAcademicInfoForm = ({ data, onUpdate, validationErrors = [] }: MedicalAcademicInfoFormProps) => {
  
  useEffect(() => {
    if (!data.reservationCategory) {
      onUpdate({ reservationCategory: 'GOPENS' });
    }
    if (!data.grouping) {
      onUpdate({ grouping: 'PCB (Physics, Chemistry, Biology)' });
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePercentageChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onUpdate({ [field]: numValue });
    } else if (value === '') {
      onUpdate({ [field]: undefined });
    }
  };

  const isFieldError = (fieldNames: string[]) => {
    return validationErrors.some(error => 
      fieldNames.some(field => error.toLowerCase().includes(field.toLowerCase()))
    );
  };

  const getFieldClassName = (fieldNames: string[]) => {
    return isFieldError(fieldNames) ? "border-red-500 focus:border-red-500" : "";
  };

  const reservationCategories = [
    { code: 'GOPENS', label: 'GOPENS - General Open' },
    { code: 'GSCS', label: 'GSCS - General SC' },
    { code: 'GSTS', label: 'GSTS - General ST' },
    { code: 'GVJS', label: 'GVJS - General VJ/DT(A)/NT(B)' },
    { code: 'GNT1S', label: 'GNT1S - General NT(C)' },
    { code: 'GNT2S', label: 'GNT2S - General NT(D)' },
    { code: 'GOBCS', label: 'GOBCS - General OBC' },
    { code: 'EWSO', label: 'EWSO - Economically Weaker Section Open' },
    { code: 'LOPENS', label: 'LOPENS - Linguistic Minority Open' },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <GraduationCap className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reservationCategory">
                Reservation Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.reservationCategory || 'GOPENS'}
                onValueChange={(value) => handleChange('reservationCategory', value)}
              >
                <SelectTrigger className={getFieldClassName(['reservation'])}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {reservationCategories.map((cat) => (
                    <SelectItem key={cat.code} value={cat.code}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grouping">
                12th Grade Grouping <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.grouping || 'PCB (Physics, Chemistry, Biology)'}
                onValueChange={(value) => handleChange('grouping', value)}
              >
                <SelectTrigger className={getFieldClassName(['grouping'])}>
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  {medicalGroupings.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <BookOpen className="h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tenthMarks">
                10th Grade Marks (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tenthMarks"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 85.5"
                value={data.tenthMarks || ''}
                onChange={(e) => handlePercentageChange('tenthMarks', e.target.value)}
                className={getFieldClassName(['10th', 'tenth'])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twelfthMarks">
                12th Grade Marks (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="twelfthMarks"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 90.0"
                value={data.twelfthMarks || ''}
                onChange={(e) => handlePercentageChange('twelfthMarks', e.target.value)}
                className={getFieldClassName(['12th', 'twelfth'])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupingMarks">
                Grouping (PCB) Marks (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="groupingMarks"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 88.5"
                value={data.groupingMarks || ''}
                onChange={(e) => handlePercentageChange('groupingMarks', e.target.value)}
                className={getFieldClassName(['grouping marks', 'pcb'])}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ugNeetPercentile">
                UG-NEET Percentile (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ugNeetPercentile"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 95.5"
                value={data.ugNeetPercentile || ''}
                onChange={(e) => handlePercentageChange('ugNeetPercentile', e.target.value)}
                className={getFieldClassName(['neet', 'percentile'])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allIndiaRank">
                All India Rank <span className="text-red-500">*</span>
              </Label>
              <Input
                id="allIndiaRank"
                type="number"
                min="1"
                placeholder="e.g., 12345"
                value={data.allIndiaRank || ''}
                onChange={(e) => handleChange('allIndiaRank', e.target.value ? parseInt(e.target.value) : undefined)}
                className={getFieldClassName(['rank', 'all india'])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neetRollNumber">
              NEET Roll Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="neetRollNumber"
              type="text"
              placeholder="e.g., 1234567890"
              value={data.neetRollNumber || ''}
              onChange={(e) => handleChange('neetRollNumber', e.target.value)}
              className={getFieldClassName(['roll', 'roll number'])}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="otherExamName">Another Exam Name (Optional)</Label>
              <Input
                id="otherExamName"
                type="text"
                placeholder="e.g., State CET"
                value={data.otherExamName || ''}
                onChange={(e) => handleChange('otherExamName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherExamScore">Another Exam Score (Optional)</Label>
              <Input
                id="otherExamScore"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 150"
                value={data.otherExamScore || ''}
                onChange={(e) => handleChange('otherExamScore', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Achievements (Optional) */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Trophy className="h-5 w-5" />
            Your Achievements (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="sportsAchievements" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-red-500" />
              Sports & Leadership
            </Label>
            <Textarea
              id="sportsAchievements"
              placeholder="List any sports achievements, leadership roles, or extracurricular activities..."
              value={data.sportsAchievements || ''}
              onChange={(e) => handleChange('sportsAchievements', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-red-500" />
              Certifications & Courses
            </Label>
            <Textarea
              id="certifications"
              placeholder="List any relevant certifications, courses, or training programs..."
              value={data.certifications || ''}
              onChange={(e) => handleChange('certifications', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internships" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-red-500" />
              Work Experience
            </Label>
            <Textarea
              id="internships"
              placeholder="Describe any internships, volunteer work, or relevant experience..."
              value={data.internships || ''}
              onChange={(e) => handleChange('internships', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherAchievements" className="flex items-center gap-2">
              <Award className="h-4 w-4 text-red-500" />
              Other Unique Achievements
            </Label>
            <Textarea
              id="otherAchievements"
              placeholder="Any other achievements, awards, or unique experiences you'd like to highlight..."
              value={data.otherAchievements || ''}
              onChange={(e) => handleChange('otherAchievements', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
