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

// Internal NumberInput component for strict 2-decimal validation
const NumberInput = ({
  value,
  onChange,
  placeholder,
  className,
  min = 0,
  max,
}: {
  value: number | undefined;
  onChange: (val: number | undefined) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}) => {
  const [localValue, setLocalValue] = useState<string>(
    value !== undefined ? value.toString() : "",
  );

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    if (value === undefined) {
      setLocalValue("");
    } else {
      // Only update if number representation differs (avoids cursor jumps on valid inputs like "10.")
      const parsedLocal = parseFloat(localValue);
      if (isNaN(parsedLocal) || parsedLocal !== value) {
        setLocalValue(value.toString());
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;

    // Allow empty
    if (newVal === "") {
      setLocalValue("");
      onChange(undefined);
      return;
    }

    // Validate regex: allow digits and one dot, max 2 decimals
    // ^\d*(\.\d{0,2})?$ matches: "12", "12.", "12.3", "12.34"
    const validPattern = /^\d*(\.\d{0,2})?$/;
    if (!validPattern.test(newVal)) {
      return; // Reject invalid chars or too many decimals
    }

    // RANGE check
    const parsed = parseFloat(newVal);
    if (!isNaN(parsed)) {
      if (parsed < min || (max !== undefined && parsed > max)) {
        return; // Reject out of range
      }
      setLocalValue(newVal);
      onChange(parsed);
    }
  };

  const preventInvalidChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onKeyDown={preventInvalidChars}
      placeholder={placeholder}
      className={className}
    />
  );
};

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
  // Set default values when component mounts
  useEffect(() => {
    // Only update if the values are different from current data
    if (!data.grouping) {
      onUpdate({ grouping: "PCB (Physics, Chemistry, Biology)" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
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

    // Restrict to maximum 7 digits
    if (value.length > 7) {
      return;
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
      error.toLowerCase().includes(fieldName.toLowerCase()),
    );
  };

  const getFieldClassName = (fieldName: string, baseClass: string = "") => {
    return isFieldError(fieldName)
      ? `${baseClass} border-red-300 ring-red-200 focus:border-red-500 focus:ring-red-200`
      : baseClass;
  };

  // Prevent invalid characters for integer fields (only digits allowed)
  const preventInvalidCharsInteger = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const invalidChars = ["e", "E", "+", "-", "."];
    if (invalidChars.includes(e.key)) {
      e.preventDefault();
    }
  };

  // Prevent invalid paste for integer fields
  const preventInvalidPasteInteger = (
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pastedText = e.clipboardData.getData("text");
    const validPattern = /^\d+$/;
    if (!validPattern.test(pastedText)) {
      e.preventDefault();
    }
  };

  // Maharashtra reservation categories from medical.ts enum
  const maharashtraReservationCategories: {
    value: ReservationCategory;
    label: string;
  }[] = [
    {
      value: "DEF1",
      label: "DEF1 - Defence Category 1 (Ward of Ex-Servicemen)",
    },
    {
      value: "DEF1-(W)",
      label: "DEF1-(W) - Defence Category 1 (Ward of Ex-Servicemen) – Women",
    },
    {
      value: "DEF2",
      label: "DEF2 - Defence Category 2 (Ward of Serving Defence Personnel)",
    },
    {
      value: "DEF2-(W)",
      label:
        "DEF2-(W) - Defence Category 2 (Ward of Serving Defence Personnel) – Women",
    },
    {
      value: "DEF3",
      label:
        "DEF3 - Defence Category 3 (Ward of Defence Personnel Killed/Disabled in Action)",
    },
    {
      value: "DEF3-(W)",
      label:
        "DEF3-(W) - Defence Category 3 (Ward of Defence Personnel Killed/Disabled in Action) – Women",
    },
    {
      value: "EMNTB",
      label: "EMNTB - Economically Backward – Nomadic Tribe Category B",
    },
    {
      value: "EMNTB-(W)",
      label:
        "EMNTB-(W) - Economically Backward – Nomadic Tribe Category B – Women",
    },
    {
      value: "EMNTC",
      label: "EMNTC - Economically Backward – Nomadic Tribe Category C",
    },
    {
      value: "EMNTC-(W)",
      label:
        "EMNTC-(W) - Economically Backward – Nomadic Tribe Category C – Women",
    },
    {
      value: "EMNTD",
      label: "EMNTD - Economically Backward – Nomadic Tribe Category D",
    },
    {
      value: "EMNTD-(W)",
      label:
        "EMNTD-(W) - Economically Backward – Nomadic Tribe Category D – Women",
    },
    {
      value: "EMOBC",
      label: "EMOBC - Economically Backward – Other Backward Class",
    },
    {
      value: "EMOBC-(W)",
      label: "EMOBC-(W) - Economically Backward – Other Backward Class – Women",
    },
    { value: "EMSC", label: "EMSC - Economically Backward – Scheduled Caste" },
    {
      value: "EMSC-(W)",
      label: "EMSC-(W) - Economically Backward – Scheduled Caste – Women",
    },
    {
      value: "EMSEBC",
      label:
        "EMSEBC - Economically Backward – Socially and Educationally Backward Class",
    },
    {
      value: "EMSEBC-(W)",
      label:
        "EMSEBC-(W) - Economically Backward – Socially and Educationally Backward Class – Women",
    },
    { value: "EMST", label: "EMST - Economically Backward – Scheduled Tribe" },
    {
      value: "EMST-(W)",
      label: "EMST-(W) - Economically Backward – Scheduled Tribe – Women",
    },
    {
      value: "EMVJA",
      label:
        "EMVJA - Economically Backward – Vimukta Jati (Denotified Tribes – NT-A)",
    },
    {
      value: "EMVJA-(W)",
      label:
        "EMVJA-(W) - Economically Backward – Vimukta Jati (Denotified Tribes – NT-A) – Women",
    },
    { value: "EWS", label: "EWS - Economically Weaker Section" },
    {
      value: "EWS-(W)",
      label: "EWS-(W) - Economically Weaker Section – Women",
    },
    {
      value: "HEM-OBC",
      label:
        "HEM-OBC - Home University – Economically Backward – Other Backward Class",
    },
    {
      value: "HEM-OBC-(W)",
      label:
        "HEM-OBC-(W) - Home University – Economically Backward – Other Backward Class – Women",
    },
    {
      value: "HEWS",
      label: "HEWS - Home University – Economically Weaker Section",
    },
    {
      value: "HEWS-(W)",
      label: "HEWS-(W) - Home University – Economically Weaker Section – Women",
    },
    {
      value: "HNTB",
      label: "HNTB - Home University – Nomadic Tribe Category B",
    },
    {
      value: "HNTB-(W)",
      label: "HNTB-(W) - Home University – Nomadic Tribe Category B – Women",
    },
    {
      value: "HNTC",
      label: "HNTC - Home University – Nomadic Tribe Category C",
    },
    {
      value: "HNTC-(W)",
      label: "HNTC-(W) - Home University – Nomadic Tribe Category C – Women",
    },
    {
      value: "HNTD",
      label: "HNTD - Home University – Nomadic Tribe Category D",
    },
    {
      value: "HNTD-(W)",
      label: "HNTD-(W) - Home University – Nomadic Tribe Category D – Women",
    },
    { value: "HOBC", label: "HOBC - Home University – Other Backward Class" },
    {
      value: "HOBC-(W)",
      label: "HOBC-(W) - Home University – Other Backward Class – Women",
    },
    {
      value: "HOPEN",
      label: "HOPEN - Home University – Open Category (General)",
    },
    {
      value: "HOPEN-(W)",
      label: "HOPEN-(W) - Home University – Open Category – Women",
    },
    { value: "HSC", label: "HSC - Home University – Scheduled Caste" },
    {
      value: "HSC-(W)",
      label: "HSC-(W) - Home University – Scheduled Caste – Women",
    },
    {
      value: "HSEBC",
      label:
        "HSEBC - Home University – Socially and Educationally Backward Class",
    },
    {
      value: "HSEBC-(W)",
      label:
        "HSEBC-(W) - Home University – Socially and Educationally Backward Class – Women",
    },
    { value: "HST", label: "HST - Home University – Scheduled Tribe" },
    {
      value: "HST-(W)",
      label: "HST-(W) - Home University – Scheduled Tribe – Women",
    },
    {
      value: "HVJA",
      label: "HVJA - Home University – Vimukta Jati (Denotified Tribes – NT-A)",
    },
    {
      value: "HVJA-(W)",
      label: "HVJA-(W) - Home University – Vimukta Jati – Women",
    },
    { value: "I.Q", label: "I.Q - Institutional Quota" },
    { value: "I.Q-MINO", label: "I.Q-MINO - Institutional Quota – Minority" },
    { value: "MKB", label: "MKB - Maharashtra Karnataka Border Candidate" },
    {
      value: "MKB-(W)",
      label: "MKB-(W) - Maharashtra Karnataka Border Candidate – Women",
    },
    { value: "NTB", label: "NTB - Nomadic Tribe Category B" },
    { value: "NTB-(W)", label: "NTB-(W) - Nomadic Tribe Category B – Women" },
    { value: "NTC", label: "NTC - Nomadic Tribe Category C" },
    { value: "NTC-(W)", label: "NTC-(W) - Nomadic Tribe Category C – Women" },
    { value: "NTD", label: "NTD - Nomadic Tribe Category D" },
    { value: "NTD-(W)", label: "NTD-(W) - Nomadic Tribe Category D – Women" },
    { value: "OBC", label: "OBC - Other Backward Class" },
    { value: "OBC-(W)", label: "OBC-(W) - Other Backward Class – Women" },
    { value: "OPEN", label: "OPEN - Open Category (General)" },
    { value: "OPEN-(W)", label: "OPEN-(W) - Open Category (General) – Women" },
    {
      value: "OPEN-(W)-MINO",
      label: "OPEN-(W)-MINO - Open Category – Minority – Women",
    },
    { value: "OPEN-MINO", label: "OPEN-MINO - Open Category – Minority" },
    { value: "ORPHAN", label: "ORPHAN - Orphan (Open Category)" },
    {
      value: "ORPHAN-EWS",
      label: "ORPHAN-EWS - Orphan – Economically Weaker Section",
    },
    {
      value: "ORPHAN-NTC",
      label: "ORPHAN-NTC - Orphan – Nomadic Tribe Category C",
    },
    {
      value: "ORPHAN-NTD",
      label: "ORPHAN-NTD - Orphan – Nomadic Tribe Category D",
    },
    {
      value: "ORPHAN-OBC",
      label: "ORPHAN-OBC - Orphan – Other Backward Class",
    },
    { value: "ORPHAN-SC", label: "ORPHAN-SC - Orphan – Scheduled Caste" },
    {
      value: "ORPHAN-SEB",
      label: "ORPHAN-SEB - Orphan – Socially and Educationally Backward Class",
    },
    { value: "ORPHAN-ST", label: "ORPHAN-ST - Orphan – Scheduled Tribe" },
    { value: "ORPHAN-VJA", label: "ORPHAN-VJA - Orphan – Vimukta Jati" },
    {
      value: "ORPHANC",
      label: "ORPHANC - Orphan Category (CAP Round Specific – Open)",
    },
    {
      value: "ORPHANC-EW",
      label:
        "ORPHANC-EW - Orphan Category (CAP Round Specific – Economically Weaker Section)",
    },
    {
      value: "ORPHANC-NT",
      label:
        "ORPHANC-NT - Orphan Category (CAP Round Specific – Nomadic Tribe)",
    },
    {
      value: "ORPHANC-OB",
      label:
        "ORPHANC-OB - Orphan Category (CAP Round Specific – Other Backward Class)",
    },
    {
      value: "ORPHANC-SC",
      label:
        "ORPHANC-SC - Orphan Category (CAP Round Specific – Scheduled Caste)",
    },
    {
      value: "ORPHANC-SE",
      label:
        "ORPHANC-SE - Orphan Category (CAP Round Specific – Socially and Educationally Backward Class)",
    },
    {
      value: "ORPHANC-ST",
      label:
        "ORPHANC-ST - Orphan Category (CAP Round Specific – Scheduled Tribe)",
    },
    {
      value: "ORPHANC-VJ",
      label: "ORPHANC-VJ - Orphan Category (CAP Round Specific – Vimukta Jati)",
    },
    {
      value: "PEM-NTC-PH",
      label:
        "PEM-NTC-PH - Project Affected – Nomadic Tribe Category C – Physical Disability",
    },
    {
      value: "PEM-OBC",
      label: "PEM-OBC - Project Affected – Other Backward Class",
    },
    {
      value: "PEM-OBC-PH",
      label:
        "PEM-OBC-PH - Project Affected – Other Backward Class – Physical Disability",
    },
    {
      value: "PEM-SC-PH",
      label:
        "PEM-SC-PH - Project Affected – Scheduled Caste – Physical Disability",
    },
    {
      value: "PEM-SEBC",
      label:
        "PEM-SEBC - Project Affected – Socially and Educationally Backward Class",
    },
    {
      value: "PEM-SEBC-PH",
      label:
        "PEM-SEBC-PH - Project Affected – Socially and Educationally Backward Class – Physical Disability",
    },
    { value: "PWD", label: "PWD - Persons with Disability (Open Category)" },
    {
      value: "PWD-EWS",
      label: "PWD-EWS - Persons with Disability – Economically Weaker Section",
    },
    {
      value: "PWD-EWS-PH",
      label:
        "PWD-EWS-PH - Persons with Disability – Economically Weaker Section – Physical Handicap",
    },
    {
      value: "PWD-EWS-PHEWS",
      label:
        "PWD-EWS-PHEWS - Persons with Disability – Economically Weaker Section – Physical Handicap (EWS)",
    },
    {
      value: "PWD-NTB",
      label: "PWD-NTB - Persons with Disability – Nomadic Tribe Category B",
    },
    {
      value: "PWD-NTB-PH",
      label:
        "PWD-NTB-PH - Persons with Disability – Nomadic Tribe Category B – Physical Handicap",
    },
    {
      value: "PWD-NTB-PHNT1",
      label:
        "PWD-NTB-PHNT1 - Persons with Disability – Nomadic Tribe Category B – Physical Handicap (NT1)",
    },
    {
      value: "PWD-NTC",
      label: "PWD-NTC - Persons with Disability – Nomadic Tribe Category C",
    },
    {
      value: "PWD-NTC-PH",
      label:
        "PWD-NTC-PH - Persons with Disability – Nomadic Tribe Category C – Physical Handicap",
    },
    {
      value: "PWD-NTC-PHNT2",
      label:
        "PWD-NTC-PHNT2 - Persons with Disability – Nomadic Tribe Category C – Physical Handicap (NT2)",
    },
    {
      value: "PWD-NTD-PH",
      label:
        "PWD-NTD-PH - Persons with Disability – Nomadic Tribe Category D – Physical Handicap",
    },
    {
      value: "PWD-NTD-PHNT3",
      label:
        "PWD-NTD-PHNT3 - Persons with Disability – Nomadic Tribe Category D – Physical Handicap (NT3)",
    },
    {
      value: "PWD-OBC",
      label: "PWD-OBC - Persons with Disability – Other Backward Class",
    },
    {
      value: "PWD-OBC-PH",
      label:
        "PWD-OBC-PH - Persons with Disability – Other Backward Class – Physical Handicap",
    },
    {
      value: "PWD-OBC-PHOBC",
      label:
        "PWD-OBC-PHOBC - Persons with Disability – Other Backward Class – Physical Handicap (OBC)",
    },
    {
      value: "PWD-OPEN",
      label: "PWD-OPEN - Persons with Disability – Open Category",
    },
    {
      value: "PWD-OPEN-PH",
      label:
        "PWD-OPEN-PH - Persons with Disability – Open Category – Physical Handicap",
    },
    {
      value: "PWD-PH",
      label: "PWD-PH - Persons with Disability – Physical Handicap",
    },
    {
      value: "PWD-SC",
      label: "PWD-SC - Persons with Disability – Scheduled Caste",
    },
    {
      value: "PWD-SC-PH",
      label:
        "PWD-SC-PH - Persons with Disability – Scheduled Caste – Physical Handicap",
    },
    {
      value: "PWD-SEB",
      label:
        "PWD-SEB - Persons with Disability – Socially and Educationally Backward Class",
    },
    {
      value: "PWD-SEB-PHSEBC",
      label:
        "PWD-SEB-PHSEBC - Persons with Disability – Socially and Educationally Backward Class – Physical Handicap (SEBC)",
    },
    {
      value: "PWD-SEBC",
      label:
        "PWD-SEBC - Persons with Disability – Socially and Educationally Backward Class",
    },
    {
      value: "PWD-SEBC-PH",
      label:
        "PWD-SEBC-PH - Persons with Disability – Socially and Educationally Backward Class – Physical Handicap",
    },
    {
      value: "PWD-ST",
      label: "PWD-ST - Persons with Disability – Scheduled Tribe",
    },
    {
      value: "PWD-ST-PH",
      label:
        "PWD-ST-PH - Persons with Disability – Scheduled Tribe – Physical Handicap",
    },
    {
      value: "PWD-VJA",
      label: "PWD-VJA - Persons with Disability – Vimukta Jati",
    },
    {
      value: "PWD-VJA-PH",
      label:
        "PWD-VJA-PH - Persons with Disability – Vimukta Jati – Physical Handicap",
    },
    {
      value: "PWD-VJA-PHVJ",
      label:
        "PWD-VJA-PHVJ - Persons with Disability – Vimukta Jati – Physical Handicap (VJ)",
    },
    { value: "SC", label: "SC - Scheduled Caste" },
    { value: "SC-(W)", label: "SC-(W) - Scheduled Caste – Women" },
    {
      value: "SEBC",
      label: "SEBC - Socially and Educationally Backward Class",
    },
    {
      value: "SEBC-(W)",
      label: "SEBC-(W) - Socially and Educationally Backward Class – Women",
    },
    { value: "ST", label: "ST - Scheduled Tribe" },
    { value: "ST-(W)", label: "ST-(W) - Scheduled Tribe – Women" },
    { value: "VJA", label: "VJA - Vimukta Jati (Denotified Tribes – NT-A)" },
    {
      value: "VJA-(W)",
      label: "VJA-(W) - Vimukta Jati (Denotified Tribes – NT-A) – Women",
    },
  ];

  // Karnataka First-Year Medical quota categories
  const karnatakaReservationCategories: {
    value: KarnatakaFirstYearMedicalQuota;
    label: string;
  }[] = [
    { value: "1G", label: "1G - 1 GENERAL" },
    { value: "1H", label: "1H - 1 UNDER HYD-KAR QUOTA" },
    { value: "1K", label: "1K - 1 KARNATAKA CANDIDATES" },
    { value: "1KH", label: "1KH - 1 KARNATAKA UNDER HYD-KAR QUOTA" },
    { value: "1R", label: "1R - 1 RURAL" },
    { value: "1RH", label: "1RH - 1 RURAL UNDER HYD-KAR QUOTA" },
    { value: "2AG", label: "2AG - 2A GENERAL" },
    { value: "2AH", label: "2AH - 2A UNDER HYD-KAR QUOTA" },
    { value: "2AK", label: "2AK - 2A KARNATAKA CANDIDATES" },
    { value: "2AKH", label: "2AKH - 2A KARNATAKA UNDER HYD-KAR QUOTA" },
    { value: "2AR", label: "2AR - 2A RURAL" },
    { value: "2ARH", label: "2ARH - 2A RURAL UNDER HYD-KAR QUOTA" },
    { value: "2BG", label: "2BG - 2B GENERAL" },
    { value: "2BH", label: "2BH - 2B UNDER HYD-KAR QUOTA" },
    { value: "2BK", label: "2BK - 2B KARNATAKA CANDIDATES" },
    { value: "2BKH", label: "2BKH - 2B KARNATAKA UNDER HYD-KAR QUOTA" },
    { value: "2BR", label: "2BR - 2B RURAL" },
    { value: "2BRH", label: "2BRH - 2B RURAL UNDER HYD-KAR QUOTA" },
    { value: "3AG", label: "3AG - 3A GENERAL" },
    { value: "3AH", label: "3AH - 3A UNDER HYD-KAR QUOTA" },
    { value: "3AK", label: "3AK - 3A KARNATAKA CANDIDATES" },
    { value: "3AKH", label: "3AKH - 3A KARNATAKA UNDER HYD-KAR QUOTA" },
    { value: "3AR", label: "3AR - 3A RURAL" },
    { value: "3ARH", label: "3ARH - 3A RURAL UNDER HYD-KAR QUOTA" },
    { value: "3BG", label: "3BG - 3B GENERAL" },
    { value: "3BH", label: "3BH - 3B UNDER HYD-KAR QUOTA" },
    { value: "3BK", label: "3BK - 3B KARNATAKA CANDIDATES" },
    { value: "3BKH", label: "3BKH - 3B KARNATAKA UNDER HYD-KAR QUOTA" },
    { value: "3BR", label: "3BR - 3B RURAL" },
    { value: "3BRH", label: "3BRH - 3B RURAL UNDER HYD-KAR QUOTA" },
    { value: "CAP", label: "CAP - CHILDREN OF ARMED PERSONNEL" },
    { value: "D", label: "D - DEFENCE" },
    { value: "GM", label: "GM - GENERAL MERIT" },
    { value: "GMH", label: "GMH - GENERAL MERIT UNDER HYD-KAR QUOTA" },
    { value: "GMK", label: "GMK - GENERAL MERIT KARNATAKA CANDIDATES" },
    {
      value: "GMKH",
      label: "GMKH - GENERAL MERIT KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { value: "GMP", label: "GMP - GENERAL MERIT PRIVATE" },
    {
      value: "GMPH",
      label: "GMPH - GENERAL MERIT PRIVATE UNDER HYD-KAR QUOTA",
    },
    { value: "GMR", label: "GMR - GENERAL MERIT RURAL" },
    { value: "GMRH", label: "GMRH - GENERAL MERIT RURAL UNDER HYD-KAR QUOTA" },
    { value: "JK", label: "JK - JAMMU & KASHMIR MIGRANTS" },
    { value: "MA", label: "MA - MUSLIM AIDED" },
    { value: "MC", label: "MC - CHRISTIAN MINORITY" },
    { value: "ME", label: "ME - MUSLIM EDUCATIONAL" },
    { value: "MEH", label: "MEH - MUSLIM EDUCATIONAL UNDER HYD-KAR" },
    { value: "MK", label: "MK - MINORITY KARNATAKA" },
    { value: "MM", label: "MM - MUSLIM MINORITY" },
    { value: "MMH", label: "MMH - MUSLIM MINORITY UNDER HYD-KAR" },
    { value: "MU", label: "MU - MUSLIM UN-AIDED" },
    { value: "NCC", label: "NCC - NATIONAL CADET CORPS" },
    { value: "NRI", label: "NRI - NON RESIDENT INDIAN" },
    { value: "OPN", label: "OPN - OPEN CATEGORY" },
    { value: "OTH", label: "OTH - OTHER CATEGORY" },
    { value: "PHM", label: "PHM - PHYSICALLY HANDICAPPED (MERIT)" },
    { value: "RC1", label: "RC1 - ROMAN CATHOLIC CATEGORY 1" },
    { value: "RC2", label: "RC2 - ROMAN CATHOLIC CATEGORY 2" },
    { value: "RC3", label: "RC3 - ROMAN CATHOLIC CATEGORY 3" },
    { value: "RC4", label: "RC4 - ROMAN CATHOLIC CATEGORY 4" },
    { value: "RC5", label: "RC5 - ROMAN CATHOLIC CATEGORY 5" },
    { value: "RC6", label: "RC6 - ROMAN CATHOLIC CATEGORY 6" },
    { value: "RC7", label: "RC7 - ROMAN CATHOLIC CATEGORY 7" },
    { value: "S-G", label: "S-G - SPECIAL GENERAL" },
    { value: "SCG", label: "SCG - SCHEDULED CASTE GENERAL" },
    { value: "SCH", label: "SCH - SCHEDULED CASTE UNDER HYD-KAR QUOTA" },
    { value: "SCK", label: "SCK - SCHEDULED CASTE KARNATAKA" },
    {
      value: "SCKH",
      label: "SCKH - SCHEDULED CASTE KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { value: "SCR", label: "SCR - SCHEDULED CASTE RURAL" },
    {
      value: "SCRH",
      label: "SCRH - SCHEDULED CASTE RURAL UNDER HYD-KAR QUOTA",
    },
    { value: "SPO", label: "SPO - SPORTS QUOTA" },
    { value: "STG", label: "STG - SCHEDULED TRIBE GENERAL" },
    { value: "STH", label: "STH - SCHEDULED TRIBE UNDER HYD-KAR QUOTA" },
    { value: "STK", label: "STK - SCHEDULED TRIBE KARNATAKA" },
    {
      value: "STKH",
      label: "STKH - SCHEDULED TRIBE KARNATAKA UNDER HYD-KAR QUOTA",
    },
    { value: "STR", label: "STR - SCHEDULED TRIBE RURAL" },
    {
      value: "STRH",
      label: "STRH - SCHEDULED TRIBE RURAL UNDER HYD-KAR QUOTA",
    },
    { value: "XD", label: "XD - EXTRA DEFENCE / SPECIAL DEFENCE CATEGORY" },
  ];

  // Select appropriate categories based on state
  const isKarnataka = selectedState === "Karnataka";
  const reservationCategoryOptions = isKarnataka
    ? karnatakaReservationCategories
    : maharashtraReservationCategories;

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
                    "h-10 rounded-xl border-2 bg-white",
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
                value={data.reservationCategory}
                onValueChange={(value) =>
                  handleChange("reservationCategory", value)
                }
                placeholder="Select your category"
                searchPlaceholder="Search category..."
                className={getFieldClassName(
                  "Reservation Category",
                  "h-10 rounded-xl border-2 bg-white",
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
                    "h-10 rounded-xl border-2 bg-white",
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
              <NumberInput
                placeholder="Enter your 10th percentage"
                value={data.tenthMarks}
                onChange={(val) => onUpdate({ tenthMarks: val })}
                className={getFieldClassName(
                  "10th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white",
                )}
                min={0}
                max={100}
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
              <NumberInput
                placeholder="Enter your 12th percentage"
                value={data.twelfthMarks}
                onChange={(val) => onUpdate({ twelfthMarks: val })}
                className={getFieldClassName(
                  "12th Grade Marks",
                  "h-10 rounded-xl border-2 bg-white",
                )}
                min={0}
                max={100}
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
              <NumberInput
                placeholder="Enter PCB marks"
                value={data.groupingMarks}
                onChange={(val) => onUpdate({ groupingMarks: val })}
                className={getFieldClassName(
                  "Grouping Marks",
                  "h-10 rounded-xl border-2 bg-white",
                )}
                min={0}
                max={100}
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
                <NumberInput
                  placeholder="Your NEET percentile (0-100)"
                  value={data.neetPercentile}
                  onChange={(val) => onUpdate({ neetPercentile: val })}
                  className={getFieldClassName(
                    "NEET Percentile",
                    "h-10 rounded-xl border-2 bg-white",
                  )}
                  min={0}
                  max={100}
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
                    "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                  )}
                  min="1"
                  max="9999999"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  NEET Roll Number{" "}
                  <span className="text-xs text-slate-500 font-normal">
                    (Optional)
                  </span>
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
                    "h-10 rounded-xl border-2 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
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
