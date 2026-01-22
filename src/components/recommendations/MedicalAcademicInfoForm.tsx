import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  GraduationCap,
  User,
  Award,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  ReservationCategory,
  Gender,
  Stream,
  KarnatakaFirstYearMedicalQuota,
} from "@/types/medical";

interface MedicalAcademicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const MedicalAcademicInfoForm = ({
  data,
  onUpdate,
  validationErrors = [],
}: MedicalAcademicInfoFormProps) => {
  // Get selected state from localStorage
  const [selectedState, setSelectedState] = useState<string>("");

  useEffect(() => {
    const state = localStorage.getItem("selected_state") || "";
    setSelectedState(state);
  }, []);

  // Set default values when component mounts
  useEffect(() => {
    const isKarnataka = selectedState === "Karnataka";
    const defaultCategory = isKarnataka ? "GM" : "OPEN";

    const defaultData = {
      reservationCategory: data.reservationCategory || defaultCategory,
      grouping: data.grouping || "PCB (Physics, Chemistry, Biology)",
    };

    // Only update if the values are different from current data
    if (!data.reservationCategory || !data.grouping) {
      onUpdate(defaultData);
    }
  }, [selectedState]);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePercentageChange = (field: string, value: string) => {
    // Allow empty string
    if (value === "") {
      onUpdate({ [field]: undefined });
      return;
    }

    // Validate input: only digits and one optional decimal point
    // Reject multiple dots, special characters like --, ++, etc.
    const validPattern = /^\d*\.?\d*$/;
    if (!validPattern.test(value)) {
      return; // Reject invalid input
    }

    const numValue = parseFloat(value);
    // Validate 0-100 range
    if (numValue >= 0 && numValue <= 100) {
      // Check for max 2 decimal places
      const decimalParts = value.split(".");
      if (
        decimalParts.length === 1 ||
        (decimalParts[1] && decimalParts[1].length <= 2)
      ) {
        onUpdate({ [field]: numValue });
      }
    }
  };

  const handleRankChange = (field: string, value: string) => {
    // Allow empty string
    if (value === "") {
      onUpdate({ [field]: undefined });
      return;
    }

    // Validate input: only digits, no decimal points or special characters
    // Reject 'e', '--', '++', '.', etc.
    const validPattern = /^\d+$/;
    if (!validPattern.test(value)) {
      return; // Reject invalid input
    }

    const numValue = parseInt(value);
    // NEET All India Rank must be >= 1
    if (numValue >= 1) {
      onUpdate({ [field]: numValue });
    }
  };

  const handleRollNumberChange = (value: string) => {
    // Allow empty string
    if (value === "") {
      onUpdate({ neetRollNumber: undefined });
      return;
    }

    // Restrict to maximum 10 digits
    if (value.length > 10) {
      return; // Reject input longer than 10 digits
    }

    // Validate input: only digits, no decimal points or special characters
    // Reject 'e', '--', '++', '.', etc.
    const validPattern = /^\d+$/;
    if (!validPattern.test(value)) {
      return; // Reject invalid input
    }

    const numValue = parseInt(value);
    // Allow any valid number while typing (up to 10 digits)
    if (numValue >= 0) {
      onUpdate({ neetRollNumber: numValue });
    }
  };

  const isFieldError = (fieldName: string) => {
    return validationErrors.some((error) =>
      error.toLowerCase().includes(fieldName.toLowerCase())
    );
  };

  const getFieldClassName = (fieldName: string, baseClass: string = "") => {
    return isFieldError(fieldName)
      ? `${baseClass} border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200`
      : baseClass;
  };

  // Prevent invalid characters for percentage fields (allows digits and decimal point)
  const preventInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidChars = ["e", "E", "+", "-"];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Prevent invalid characters for integer fields (only digits allowed)
  const preventInvalidCharsInteger = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const invalidChars = ["e", "E", "+", "-", "."];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Prevent invalid paste for percentage fields
  const preventInvalidPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const validPattern = /^\d*\.?\d*$/;
    if (!validPattern.test(pastedText)) {
      e.preventDefault();
    }
  };

  // Prevent invalid paste for integer fields
  const preventInvalidPasteInteger = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText = e.clipboardData.getData("text");
    const validPattern = /^\d+$/;
    if (!validPattern.test(pastedText)) {
      e.preventDefault();
    }
  };

  // Maharashtra reservation categories from medical.ts enum
  const maharashtraReservationCategories: ReservationCategory[] = [
    "DEF1",
    "DEF1-(W)",
    "DEF2",
    "DEF2-(W)",
    "DEF3",
    "DEF3-(W)",
    "EMNTB",
    "EMNTB-(W)",
    "EMNTC",
    "EMNTC-(W)",
    "EMNTD",
    "EMNTD-(W)",
    "EMOBC",
    "EMOBC-(W)",
    "EMSC",
    "EMSC-(W)",
    "EMSEBC",
    "EMSEBC-(W)",
    "EMST",
    "EMST-(W)",
    "EMVJA",
    "EMVJA-(W)",
    "EWS",
    "EWS-(W)",
    "HEM-OBC",
    "HEM-OBC-(W)",
    "HEWS",
    "HEWS-(W)",
    "HNTB",
    "HNTB-(W)",
    "HNTC",
    "HNTC-(W)",
    "HNTD",
    "HNTD-(W)",
    "HOBC",
    "HOBC-(W)",
    "HOPEN",
    "HOPEN-(W)",
    "HSC",
    "HSC-(W)",
    "HSEBC",
    "HSEBC-(W)",
    "HST",
    "HST-(W)",
    "HVJA",
    "HVJA-(W)",
    "I.Q",
    "I.Q-MINO",
    "MKB",
    "MKB-(W)",
    "NTB",
    "NTB-(W)",
    "NTC",
    "NTC-(W)",
    "NTD",
    "NTD-(W)",
    "OBC",
    "OBC-(W)",
    "OPEN",
    "OPEN-(W)",
    "OPEN-(W)-MINO",
    "OPEN-MINO",
    "ORPHAN",
    "ORPHAN-EWS",
    "ORPHAN-NTC",
    "ORPHAN-NTD",
    "ORPHAN-OBC",
    "ORPHAN-SC",
    "ORPHAN-SEB",
    "ORPHAN-ST",
    "ORPHAN-VJA",
    "ORPHANC",
    "ORPHANC-EW",
    "ORPHANC-NT",
    "ORPHANC-OB",
    "ORPHANC-SC",
    "ORPHANC-SE",
    "ORPHANC-ST",
    "ORPHANC-VJ",
    "PEM-NTC-PH",
    "PEM-OBC",
    "PEM-OBC-PH",
    "PEM-SC-PH",
    "PEM-SEBC",
    "PEM-SEBC-PH",
    "PWD",
    "PWD-EWS",
    "PWD-EWS-PH",
    "PWD-EWS-PHEWS",
    "PWD-NTB",
    "PWD-NTB-PH",
    "PWD-NTB-PHNT1",
    "PWD-NTC",
    "PWD-NTC-PH",
    "PWD-NTC-PHNT2",
    "PWD-NTD-PH",
    "PWD-NTD-PHNT3",
    "PWD-OBC",
    "PWD-OBC-PH",
    "PWD-OBC-PHOBC",
    "PWD-OPEN",
    "PWD-OPEN-PH",
    "PWD-PH",
    "PWD-SC",
    "PWD-SC-PH",
    "PWD-SEB",
    "PWD-SEB-PHSEBC",
    "PWD-SEBC",
    "PWD-SEBC-PH",
    "PWD-ST",
    "PWD-ST-PH",
    "PWD-VJA",
    "PWD-VJA-PH",
    "PWD-VJA-PHVJ",
    "SC",
    "SC-(W)",
    "SEBC",
    "SEBC-(W)",
    "ST",
    "ST-(W)",
    "VJA",
    "VJA-(W)",
  ];

  // Karnataka First-Year Medical quota categories
  const karnatakaReservationCategories: KarnatakaFirstYearMedicalQuota[] = [
    "1G",
    "1H",
    "1K",
    "1KH",
    "1R",
    "1RH",
    "2AG",
    "2AH",
    "2AK",
    "2AKH",
    "2AR",
    "2ARH",
    "2BG",
    "2BH",
    "2BK",
    "2BKH",
    "2BR",
    "2BRH",
    "3AG",
    "3AH",
    "3AK",
    "3AKH",
    "3AR",
    "3ARH",
    "3BG",
    "3BH",
    "3BK",
    "3BKH",
    "3BR",
    "3BRH",
    "CAP",
    "D",
    "GM",
    "GMH",
    "GMK",
    "GMKH",
    "GMP",
    "GMPH",
    "GMR",
    "GMRH",
    "JK",
    "MA",
    "MC",
    "ME",
    "MEH",
    "MK",
    "MM",
    "MMH",
    "MU",
    "NCC",
    "NRI",
    "OPN",
    "OTH",
    "PHM",
    "RC1",
    "RC2",
    "RC3",
    "RC4",
    "RC5",
    "RC6",
    "RC7",
    "S-G",
    "SCG",
    "SCH",
    "SCK",
    "SCKH",
    "SCR",
    "SCRH",
    "SPO",
    "STG",
    "STH",
    "STK",
    "STKH",
    "STR",
    "STRH",
    "XD",
  ];

  // Select appropriate categories based on state
  const isKarnataka = selectedState === "Karnataka";
  const reservationCategories = isKarnataka
    ? karnatakaReservationCategories
    : maharashtraReservationCategories;

  const reservationCategoryOptions = reservationCategories.map((category) => ({
    value: category,
    label: category,
  }));

  // Stream options from medical.ts Stream type
  const streamOptions: Stream[] = [
    "PCB (Physics, Chemistry, Biology)",
    "PCMB (Physics, Chemistry, Mathematics, Biology)",
  ];

  // Gender options
  const genderOptions: Array<{ value: Gender; label: string }> = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <User size={14} />
                Gender
                <span className="text-red-500">*</span>
                {isFieldError("Gender") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Select
                onValueChange={(value) => handleChange("gender", value)}
                value={data.gender ?? ""}
              >
                <SelectTrigger
                  className={getFieldClassName(
                    "Gender",
                    "h-10 rounded-xl border-2 bg-white"
                  )}
                >
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <GraduationCap size={14} />
                Reservation Category
                <span className="text-red-500">*</span>
                {isFieldError("Reservation Category") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <SearchableSelect
                options={reservationCategoryOptions}
                value={
                  data.reservationCategory || (isKarnataka ? "GM" : "OPEN")
                }
                onValueChange={(value) =>
                  handleChange("reservationCategory", value)
                }
                placeholder="Select your category"
                searchPlaceholder="Search category..."
                className={getFieldClassName(
                  "Reservation Category",
                  "h-10 rounded-xl border-2 bg-white"
                )}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <GraduationCap size={14} />
                12th Grade Grouping
                <span className="text-red-500">*</span>
                {isFieldError("12th Grade Grouping") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Select
                onValueChange={(value) => handleChange("grouping", value)}
                value={data.grouping || "PCB (Physics, Chemistry, Biology)"}
              >
                <SelectTrigger
                  className={getFieldClassName(
                    "12th Grade Grouping",
                    "h-10 rounded-xl border-2 bg-white"
                  )}
                >
                  <SelectValue placeholder="What did you study in 12th?" />
                </SelectTrigger>
                <SelectContent>
                  {streamOptions.map((stream) => (
                    <SelectItem key={stream} value={stream}>
                      {stream}
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
                {isFieldError("10th Grade Marks") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Input
                type="number"
                placeholder="Enter your 10th percentage"
                value={data.tenthMarks || ""}
                onChange={(e) =>
                  handlePercentageChange("tenthMarks", e.target.value)
                }
                onKeyDown={preventInvalidChars}
                onPaste={preventInvalidPaste}
                className={getFieldClassName(
                  "10th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                📈 12th Grade Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError("12th Grade Marks") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Input
                type="number"
                placeholder="Enter your 12th percentage"
                value={data.twelfthMarks || ""}
                onChange={(e) =>
                  handlePercentageChange("twelfthMarks", e.target.value)
                }
                onKeyDown={preventInvalidChars}
                onPaste={preventInvalidPaste}
                className={getFieldClassName(
                  "12th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                🎯 Grouping (PCB) Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError("Grouping Marks") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Input
                type="number"
                placeholder="Enter PCB marks"
                value={data.groupingMarks || ""}
                onChange={(e) =>
                  handlePercentageChange("groupingMarks", e.target.value)
                }
                onKeyDown={preventInvalidChars}
                onPaste={preventInvalidPaste}
                className={getFieldClassName(
                  "Grouping Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                )}
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
                  {isFieldError("NEET Percentile") && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                </Label>
                <Input
                  type="number"
                  placeholder="Your NEET percentile (0-100)"
                  value={data.neetPercentile || ""}
                  onChange={(e) =>
                    handlePercentageChange("neetPercentile", e.target.value)
                  }
                  onKeyDown={preventInvalidChars}
                  onPaste={preventInvalidPaste}
                  className={getFieldClassName(
                    "NEET Percentile",
                    "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  )}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  All India Rank
                  <span className="text-red-500">*</span>
                  {isFieldError("All India Rank") && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                </Label>
                <Input
                  type="number"
                  placeholder="Your NEET AIR"
                  value={data.neetAllIndiaRank || ""}
                  onChange={(e) =>
                    handleRankChange("neetAllIndiaRank", e.target.value)
                  }
                  onKeyDown={preventInvalidCharsInteger}
                  onPaste={preventInvalidPasteInteger}
                  className={getFieldClassName(
                    "All India Rank",
                    "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  )}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  NEET Roll Number
                  <span className="text-red-500">*</span>
                  {isFieldError("NEET Roll Number") && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                </Label>
                <Input
                  type="number"
                  placeholder="10-digit NEET Roll Number"
                  value={data.neetRollNumber || ""}
                  onChange={(e) => handleRollNumberChange(e.target.value)}
                  onKeyDown={preventInvalidCharsInteger}
                  onPaste={preventInvalidPasteInteger}
                  className={getFieldClassName(
                    "NEET Roll Number",
                    "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  )}
                  min="1000000000"
                  max="9999999999"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  Another Exam Name{" "}
                  <span className="text-xs text-slate-500 font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  placeholder="e.g., AIIMS, JIPMER"
                  value={data.otherExamName || ""}
                  onChange={(e) =>
                    handleChange("otherExamName", e.target.value)
                  }
                  className="h-10 rounded-xl border-2 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  Another Exam Score{" "}
                  <span className="text-xs text-slate-500 font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  type="number"
                  placeholder="Your score/percentile"
                  value={data.otherExamPercentile || ""}
                  onChange={(e) =>
                    handleChange(
                      "otherExamPercentile",
                      parseFloat(e.target.value) || undefined
                    )
                  }
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
                Your Achievements{" "}
                <span className="text-sm text-slate-500 font-normal">
                  (Optional)
                </span>
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
                  value={data.sportsAchievements || ""}
                  onChange={(e) =>
                    handleChange("sportsAchievements", e.target.value)
                  }
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
                  value={data.certifications || ""}
                  onChange={(e) =>
                    handleChange("certifications", e.target.value)
                  }
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
                  value={data.internships || ""}
                  onChange={(e) => handleChange("internships", e.target.value)}
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
                  value={data.otherAchievements || ""}
                  onChange={(e) =>
                    handleChange("otherAchievements", e.target.value)
                  }
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
