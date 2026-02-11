import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  User,
  Award,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useEffect } from "react";

interface AcademicInfoProps {
  reservationCategory?: string;
  grouping?: string;
  tenthMarks?: number;
  twelfthMarks?: number;
  groupingMarks?: number;
  cetPercentile?: number;
  cetRank?: number;
  jeePercentile?: number;
  otherExamName?: string;
  otherExamPercentile?: number;
  sportsAchievements?: string;
  certifications?: string;
  internships?: string;
  otherAchievements?: string;
  district?: string;
  gender?: string;
  // Allow other fields to pass through if needed, or strictly type all.
  [key: string]: any;
}

interface AcademicInfoFormProps {
  data: AcademicInfoProps;
  onUpdate: (data: Partial<AcademicInfoProps>) => void;
  validationErrors?: string[];
}

export const AcademicInfoForm = ({
  data,
  onUpdate,
  validationErrors = [],
}: AcademicInfoFormProps) => {
  const isKarnataka = localStorage.getItem("selected_state") === "Karnataka";

  // Set default values when component mounts
  useEffect(() => {
    const defaultData: any = {
      grouping: data.grouping || "PCM (Physics, Chemistry, Mathematics)",
    };

    // Only update if grouping is missing
    if (!data.grouping) {
      onUpdate({ ...defaultData });
    }
  }, [data.grouping, onUpdate]);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  const handlePercentageChange = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (value === "" || (numValue >= 0 && numValue <= 100)) {
      onUpdate({ [field]: numValue || undefined });
    }
  };

  const isFieldError = (fieldName: string) => {
    return validationErrors.some((error) =>
      error.toLowerCase().includes(fieldName.toLowerCase()),
    );
  };

  const getFieldClassName = (fieldName: string, baseClass: string = "") => {
    return isFieldError(fieldName)
      ? `${baseClass} border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200`
      : baseClass;
  };

  // Karnataka Reservation Categories
  const karnatakaReservationCategories = [
    { code: "1G", label: "1G - 1 GENERAL" },
    { code: "1H", label: "1H - 1 UNDER HYD-KAR QUOTA" },
    { code: "1K", label: "1K - 1 KARNATAKA CANDIDATES" },
    { code: "1KH", label: "1KH - 1 KARNATAKA UNDER HYD-KAR QUOTA" },
    { code: "1R", label: "1R - 1 NRI" },
    { code: "1RH", label: "1RH - 1 NRI UNDER HYD-KAR QUOTA" },
    { code: "2AG", label: "2AG - 2A GENERAL" },
    { code: "2AH", label: "2AH - 2A UNDER HYD-KAR QUOTA" },
    { code: "2AK", label: "2AK - 2A KARNATAKA CANDIDATES" },
    { code: "2AKH", label: "2AKH - 2A KARNATAKA UNDER HYD-KAR QUOTA" },
    { code: "2AR", label: "2AR - 2A NRI" },
    { code: "2ARH", label: "2ARH - 2A NRI UNDER HYD-KAR QUOTA" },
    { code: "2BG", label: "2BG - 2B GENERAL" },
    { code: "2BH", label: "2BH - 2B UNDER HYD-KAR QUOTA" },
    { code: "2BK", label: "2BK - 2B KARNATAKA CANDIDATES" },
    { code: "2BKH", label: "2BKH - 2B KARNATAKA UNDER HYD-KAR QUOTA" },
    { code: "2BR", label: "2BR - 2B NRI" },
    { code: "2BRH", label: "2BRH - 2B NRI UNDER HYD-KAR QUOTA" },
    { code: "3AG", label: "3AG - 3A GENERAL" },
    { code: "3AH", label: "3AH - 3A UNDER HYD-KAR QUOTA" },
    { code: "3AK", label: "3AK - 3A KARNATAKA CANDIDATES" },
    { code: "3AKH", label: "3AKH - 3A KARNATAKA UNDER HYD-KAR QUOTA" },
    { code: "3AR", label: "3AR - 3A NRI" },
    { code: "3ARH", label: "3ARH - 3A NRI UNDER HYD-KAR QUOTA" },
    { code: "3BG", label: "3BG - 3B GENERAL" },
    { code: "3BH", label: "3BH - 3B UNDER HYD-KAR QUOTA" },
    { code: "3BK", label: "3BK - 3B KARNATAKA CANDIDATES" },
    { code: "3BKH", label: "3BKH - 3B KARNATAKA UNDER HYD-KAR QUOTA" },
    { code: "3BR", label: "3BR - 3B NRI" },
    { code: "3BRH", label: "3BRH - 3B NRI UNDER HYD-KAR QUOTA" },
    { code: "GM", label: "GM - GENERAL MERIT" },
    { code: "GMH", label: "GMH - GENERAL MERIT UNDER HYD-KAR QUOTA" },
    { code: "GMK", label: "GMK - GENERAL MERIT KARNATAKA CANDIDATES" },
    {
      code: "GMKH",
      label: "GMKH - GENERAL MERIT KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { code: "GMR", label: "GMR - GENERAL MERIT NRI" },
    { code: "GMRH", label: "GMRH - GENERAL MERIT NRI UNDER HYD-KAR QUOTA" },
    { code: "SCG", label: "SCG - SCHEDULED CASTE GENERAL" },
    { code: "SCH", label: "SCH - SCHEDULED CASTE UNDER HYD-KAR QUOTA" },
    { code: "SCK", label: "SCK - SCHEDULED CASTE KARNATAKA CANDIDATES" },
    {
      code: "SCKH",
      label: "SCKH - SCHEDULED CASTE KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { code: "SCR", label: "SCR - SCHEDULED CASTE NRI" },
    { code: "SCRH", label: "SCRH - SCHEDULED CASTE NRI UNDER HYD-KAR QUOTA" },
    { code: "STG", label: "STG - SCHEDULED TRIBE GENERAL" },
    { code: "STH", label: "STH - SCHEDULED TRIBE UNDER HYD-KAR QUOTA" },
    { code: "STK", label: "STK - SCHEDULED TRIBE KARNATAKA CANDIDATES" },
    {
      code: "STKH",
      label: "STKH - SCHEDULED TRIBE KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { code: "STR", label: "STR - SCHEDULED TRIBE NRI" },
    { code: "STRH", label: "STRH - SCHEDULED TRIBE NRI UNDER HYD-KAR QUOTA" },
  ];

  // Updated reservation categories to match API codes
  const reservationCategories = [
    {
      code: "DEFRNT1S",
      label: "Defence – Reserved – Nomadic Tribe 1 (NT1)",
    },
    {
      code: "DEFRNT2S",
      label: "Defence – Reserved – Nomadic Tribe 2 (NT2)",
    },
    {
      code: "DEFRNT3S",
      label: "Defence – Reserved – Nomadic Tribe 3 (NT3)",
    },
    {
      code: "DEFRSTS",
      label: "Defence – Reserved – Scheduled Tribe (ST)",
    },
    {
      code: "DEFRVJS",
      label: "Defence – Reserved – Vimukta Jati / De-notified Tribes (VJ/DT)",
    },
    { code: "DEFOPENS", label: "Defence – Open" },
    { code: "DEFOBCS", label: "Defence – Other Backward Class (OBC)" },
    { code: "DEFRSEBCS", label: "Defence – Reserved SEBC" },
    { code: "DEFSCS", label: "Defence – Scheduled Caste (SC)" },
    {
      code: "DEFSEBCS",
      label: "Defence – Socially and Educationally Backward Class (SEBC)",
    },
    { code: "EWS", label: "Economically Weaker Sections" },
    { code: "GNT1S", label: "General – Nomadic Tribe 1 (NT1)" },
    { code: "GNT2S", label: "General – Nomadic Tribe 2 (NT2)" },
    { code: "GNT3S", label: "General – Nomadic Tribe 3 (NT3)" },
    { code: "GOPENS", label: "General – Open" },
    { code: "GOBCS", label: "General – Other Backward Class (OBC)" },
    { code: "GSCS", label: "General – Scheduled Caste (SC)" },
    { code: "GSTS", label: "General – Scheduled Tribe (ST)" },
    {
      code: "GSEBCS",
      label: "General – Socially and Educationally Backward Class (SEBC)",
    },
    {
      code: "GVJS",
      label: "General – Vimukta Jati/De-notified Tribes (VJ/DT)",
    },
    { code: "LNT1S", label: "Ladies – Nomadic Tribe 1 (NT1)" },
    { code: "LNT2S", label: "Ladies – Nomadic Tribe 2 (NT2)" },
    { code: "LNT3S", label: "Ladies – Nomadic Tribe 3 (NT3)" },
    { code: "LOPENS", label: "Ladies – Open" },
    { code: "LOBCS", label: "Ladies – Other Backward Class (OBC)" },
    { code: "LSCS", label: "Ladies – Scheduled Caste (SC)" },
    { code: "LSTS", label: "Ladies – Scheduled Tribe (ST)" },
    {
      code: "LSEBCS",
      label: "Ladies – Socially and Educationally Backward Class (SEBC)",
    },
    { code: "LVJS", label: "Ladies – Vimukta Jati/De-notified Tribes (VJ/DT)" },
    { code: "MI", label: "Minority" },
    { code: "ORPHAN", label: "Orphan Category" },
    {
      code: "PWDRNT3S",
      label: "Persons with Disabilities – Nomadic Tribe 3 (NT3)",
    },
    {
      code: "PWDRSEBCS",
      label: "Persons with Disabilities – Reserved – SEBC",
    },
    {
      code: "PWDRVJS",
      label:
        "Persons with Disabilities – Reserved-Vimukta Jati / De-notified Tribes (VJ/DT)",
    },
    {
      code: "PWDSCS",
      label: "Persons with Disabilities – Scheduled Caste (SC)",
    },
    {
      code: "PWDSEBCS",
      label: "Persons with Disabilities – SEBC",
    },
    { code: "PWDOPENS", label: "Persons with Disabilities – Open" },
    {
      code: "PWDOBCS",
      label: "Persons with Disabilities – Other Backward Class (OBC)",
    },
    { code: "PWDROBC", label: "Persons with Disabilities – Reserved OBC" },
    {
      code: "PWDSTS",
      label: "Persons with Disabilities – Scheduled Tribe (ST)",
    },
    { code: "TFWS", label: "Tuition Fee Waiver Scheme" },
  ];

  const groupingOptions = [
    "PCM (Physics, Chemistry, Mathematics)",
    "PCB (Physics, Chemistry, Biology)",
    "PCMB (Physics, Chemistry, Mathematics, Biology)",
  ];

  const districtOptions = [
    "Ahilyanagar (Ahmednagar)",
    "Akola",
    "Amravati",
    "Beed",
    "Bhandara",
    "Buldana",
    "Chandrapur",
    "Chhatrapati Sambhajinagar (Aurangabad)",
    "Dharashiv (Osmanabad)",
    "Dhule",
    "Gadchiroli",
    "Gondia",
    "Hingoli",
    "Jalgaon",
    "Jalna",
    "Kolhapur",
    "Latur",
    "Mumbai City",
    "Mumbai Suburban",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Palghar",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Wardha",
    "Washim",
    "Yavatmal",
  ].map((district) => ({ value: district, label: district }));

  const currentCategories = isKarnataka
    ? karnatakaReservationCategories
    : reservationCategories;

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
                    "h-10 rounded-xl border-2 bg-white",
                  )}
                >
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              <Select
                onValueChange={(value) =>
                  handleChange("reservationCategory", value)
                }
                value={data.reservationCategory || ""}
              >
                <SelectTrigger
                  className={getFieldClassName(
                    "Reservation Category",
                    "h-10 rounded-xl border-2 bg-white",
                  )}
                >
                  <SelectValue placeholder="Select your category" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {currentCategories.map((category) => (
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
                {isFieldError("12th Grade Grouping") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Select
                onValueChange={(value) => handleChange("grouping", value)}
                value={data.grouping || "PCM (Physics, Chemistry, Mathematics)"}
              >
                <SelectTrigger
                  className={getFieldClassName(
                    "12th Grade Grouping",
                    "h-10 rounded-xl border-2 bg-white",
                  )}
                >
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

            {!isKarnataka && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <GraduationCap size={14} />
                  Select the District Where Your Most Recent College Is Located
                  <span className="text-red-500">*</span>
                  {isFieldError("District") && (
                    <AlertCircle size={14} className="text-red-500" />
                  )}
                </Label>
                <SearchableSelect
                  options={districtOptions}
                  value={data.district}
                  onValueChange={(value) => handleChange("district", value)}
                  placeholder="Search and select district..."
                  searchPlaceholder="Type to search district..."
                  className={getFieldClassName(
                    "District",
                    "h-10 rounded-xl border-2 bg-white",
                  )}
                />
              </div>
            )}
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
                className={getFieldClassName(
                  "10th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
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
                className={getFieldClassName(
                  "12th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                )}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                🎯 Grouping Marks (%)
                <span className="text-red-500">*</span>
                {isFieldError("Grouping Marks") && (
                  <AlertCircle size={14} className="text-red-500" />
                )}
              </Label>
              <Input
                type="number"
                placeholder="Enter your grouping marks"
                value={data.groupingMarks || ""}
                onChange={(e) =>
                  handlePercentageChange("groupingMarks", e.target.value)
                }
                className={getFieldClassName(
                  "Grouping Marks",
                  "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                )}
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
                  {isKarnataka ? "CET Rank" : "CET Percentile"}
                  <span className="text-red-500">*</span>
                  {isKarnataka
                    ? isFieldError("CET Rank") && (
                        <AlertCircle size={14} className="text-red-500" />
                      )
                    : isFieldError("CET Percentile") && (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                </Label>
                {isKarnataka ? (
                  <Input
                    type="number"
                    placeholder="Your CET Rank"
                    value={data.cetRank || ""}
                    onChange={(e) =>
                      handleChange("cetRank", parseFloat(e.target.value))
                    }
                    className={getFieldClassName(
                      "CET Rank",
                      "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    )}
                    min="1"
                  />
                ) : (
                  <Input
                    type="number"
                    placeholder="Your CET percentile (0-100)"
                    value={data.cetPercentile || ""}
                    onChange={(e) =>
                      handlePercentageChange("cetPercentile", e.target.value)
                    }
                    className={getFieldClassName(
                      "CET Percentile",
                      "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    )}
                    min="0"
                    max="100"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">
                  JEE Percentile{" "}
                  <span className="text-xs text-slate-500">(Optional)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Your JEE percentile (0-100)"
                  value={data.jeePercentile || ""}
                  onChange={(e) =>
                    handlePercentageChange("jeePercentile", e.target.value)
                  }
                  className="h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">
                  Other Exam Name{" "}
                  <span className="text-xs text-slate-500">(Optional)</span>
                </Label>
                <Input
                  placeholder="e.g., BITSAT, VITEEE, COMEDK"
                  value={data.otherExamName || ""}
                  onChange={(e) =>
                    handleChange("otherExamName", e.target.value)
                  }
                  className="h-10 rounded-xl border-2 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-medium text-sm">
                  Other Exam Score{" "}
                  <span className="text-xs text-slate-500">(Optional)</span>
                </Label>
                <Input
                  type="number"
                  placeholder="Your score/percentile"
                  value={data.otherExamPercentile || ""}
                  onChange={(e) =>
                    handleChange(
                      "otherExamPercentile",
                      parseFloat(e.target.value) || undefined,
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
                  placeholder="State-level cricket, student council president, debate competitions..."
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
                  💻 Certifications & Courses
                </Label>
                <Textarea
                  placeholder="Python certification, web development course, cloud computing..."
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
                  placeholder="Summer internship, part-time job, freelance projects..."
                  value={data.internships || ""}
                  onChange={(e) => handleChange("internships", e.target.value)}
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
