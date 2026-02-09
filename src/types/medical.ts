import { State } from "./state";

// Karnataka First-Year Medical Quota Categories
export type KarnatakaFirstYearMedicalQuota =
  | "1G"
  | "1H"
  | "1K"
  | "1KH"
  | "1R"
  | "1RH"
  | "2AG"
  | "2AH"
  | "2AK"
  | "2AKH"
  | "2AR"
  | "2ARH"
  | "2BG"
  | "2BH"
  | "2BK"
  | "2BKH"
  | "2BR"
  | "2BRH"
  | "3AG"
  | "3AH"
  | "3AK"
  | "3AKH"
  | "3AR"
  | "3ARH"
  | "3BG"
  | "3BH"
  | "3BK"
  | "3BKH"
  | "3BR"
  | "3BRH"
  | "CAP"
  | "D"
  | "GM"
  | "GMH"
  | "GMK"
  | "GMKH"
  | "GMP"
  | "GMPH"
  | "GMR"
  | "GMRH"
  | "JK"
  | "MA"
  | "MC"
  | "ME"
  | "MEH"
  | "MK"
  | "MM"
  | "MMH"
  | "MU"
  | "NCC"
  | "NRI"
  | "OPN"
  | "OTH"
  | "PHM"
  | "RC1"
  | "RC2"
  | "RC3"
  | "RC4"
  | "RC5"
  | "RC6"
  | "RC7"
  | "S-G"
  | "SCG"
  | "SCH"
  | "SCK"
  | "SCKH"
  | "SCR"
  | "SCRH"
  | "SPO"
  | "STG"
  | "STH"
  | "STK"
  | "STKH"
  | "STR"
  | "STRH"
  | "XD";

// Medical Program Types
export type MedicalProgram =
  | "ALL"
  | "BAMS"
  | "BASLP"
  | "BDS"
  | "BHMS"
  | "BNYS"
  | "BOTH"
  | "BPO"
  | "BPTH"
  | "BUMS"
  | "MBBS";

// CAP Rounds
export type Round = 1 | 2 | 3;

// Gender
export type Gender = "M" | "F" | "O";

// Academic Stream
export type Stream =
  | "PCB (Physics, Chemistry, Biology)"
  | "PCMB (Physics, Chemistry, Mathematics, Biology)";

// Maharashtra Reservation Categories
export type ReservationCategory =
  | "DEF1"
  | "DEF1-(W)"
  | "DEF2"
  | "DEF2-(W)"
  | "DEF3"
  | "DEF3-(W)"
  | "EMNTB"
  | "EMNTB-(W)"
  | "EMNTC"
  | "EMNTC-(W)"
  | "EMNTD"
  | "EMNTD-(W)"
  | "EMOBC"
  | "EMOBC-(W)"
  | "EMSC"
  | "EMSC-(W)"
  | "EMSEBC"
  | "EMSEBC-(W)"
  | "EMST"
  | "EMST-(W)"
  | "EMVJA"
  | "EMVJA-(W)"
  | "EWS"
  | "EWS-(W)"
  | "HEM-OBC"
  | "HEM-OBC-(W)"
  | "HEWS"
  | "HEWS-(W)"
  | "HNTB"
  | "HNTB-(W)"
  | "HNTC"
  | "HNTC-(W)"
  | "HNTD"
  | "HNTD-(W)"
  | "HOBC"
  | "HOBC-(W)"
  | "HOPEN"
  | "HOPEN-(W)"
  | "HSC"
  | "HSC-(W)"
  | "HSEBC"
  | "HSEBC-(W)"
  | "HST"
  | "HST-(W)"
  | "HVJA"
  | "HVJA-(W)"
  | "I.Q"
  | "I.Q-MINO"
  | "MKB"
  | "MKB-(W)"
  | "NTB"
  | "NTB-(W)"
  | "NTC"
  | "NTC-(W)"
  | "NTD"
  | "NTD-(W)"
  | "OBC"
  | "OBC-(W)"
  | "OPEN"
  | "OPEN-(W)"
  | "OPEN-(W)-MINO"
  | "OPEN-MINO"
  | "ORPHAN"
  | "ORPHAN-EWS"
  | "ORPHAN-NTC"
  | "ORPHAN-NTD"
  | "ORPHAN-OBC"
  | "ORPHAN-SC"
  | "ORPHAN-SEB"
  | "ORPHAN-ST"
  | "ORPHAN-VJA"
  | "ORPHANC"
  | "ORPHANC-EW"
  | "ORPHANC-NT"
  | "ORPHANC-OB"
  | "ORPHANC-SC"
  | "ORPHANC-SE"
  | "ORPHANC-ST"
  | "ORPHANC-VJ"
  | "PEM-NTC-PH"
  | "PEM-OBC"
  | "PEM-OBC-PH"
  | "PEM-SC-PH"
  | "PEM-SEBC"
  | "PEM-SEBC-PH"
  | "PWD"
  | "PWD-EWS"
  | "PWD-EWS-PH"
  | "PWD-EWS-PHEWS"
  | "PWD-NTB"
  | "PWD-NTB-PH"
  | "PWD-NTB-PHNT1"
  | "PWD-NTC"
  | "PWD-NTC-PH"
  | "PWD-NTC-PHNT2"
  | "PWD-NTD-PH"
  | "PWD-NTD-PHNT3"
  | "PWD-OBC"
  | "PWD-OBC-PH"
  | "PWD-OBC-PHOBC"
  | "PWD-OPEN"
  | "PWD-OPEN-PH"
  | "PWD-PH"
  | "PWD-SC"
  | "PWD-SC-PH"
  | "PWD-SEB"
  | "PWD-SEB-PHSEBC"
  | "PWD-SEBC"
  | "PWD-SEBC-PH"
  | "PWD-ST"
  | "PWD-ST-PH"
  | "PWD-VJA"
  | "PWD-VJA-PH"
  | "PWD-VJA-PHVJ"
  | "SC"
  | "SC-(W)"
  | "SEBC"
  | "SEBC-(W)"
  | "ST"
  | "ST-(W)"
  | "VJA"
  | "VJA-(W)";

// College Type Preferences
export type CollegeTypePreference = "Government" | "Private";

// Student Priority Factors
export type PriorityFactor =
  | "ALL"
  | "High Placement Rate"
  | "Low Fees"
  | "College Rating"
  | "Location"
  | "Infrastructure"
  | "Faculty Quality"
  | "Industry Connections"
  | "Research Opportunities"
  | "Alumni Network"
  | "Campus Life"
  | "Hostel Facilities"
  | "Sports Facilities";

// Valid Cities (Maharashtra - sorted alphabetically)
export type MaharashtraCity =
  | "ALL"
  | "Ahilyanagar (Ahmednagar)"
  | "Akola"
  | "Alibag (Alibaug)"
  | "Ambajogai"
  | "Ambernath"
  | "Amravati"
  | "Baramati"
  | "Beed"
  | "Bhandara"
  | "Buldhana"
  | "Chalisgaon"
  | "Chandrapur"
  | "Chandur Railway"
  | "Chandwad"
  | "Chhatrapati Sambhajinagar (Aurangabad)"
  | "Chinchwad"
  | "Deori"
  | "Dharashiv (Osmanabad)"
  | "Dhule"
  | "Dombivali"
  | "Gadchiroli"
  | "Gadhinglaj"
  | "Gardi"
  | "Gondia"
  | "Hingoli"
  | "Jalgaon"
  | "Jalna"
  | "Jaysingpur (Jaisingpur)"
  | "Kalyan"
  | "Kannad"
  | "Karjat"
  | "Khamgaon"
  | "Kolhapur"
  | "Kopargaon"
  | "Latur"
  | "Malegaon"
  | "Miraj"
  | "Mumbai"
  | "Nagpur"
  | "Nalasopara"
  | "Nanded"
  | "Nandihills"
  | "Nandurbar"
  | "Nashik"
  | "Newasa (Nevasa)"
  | "Palghar"
  | "Pandharpur"
  | "Panvel"
  | "Parbhani"
  | "Pune"
  | "Rahuri"
  | "Raigad"
  | "Ratnagiri"
  | "Ridhora"
  | "Sakegaon"
  | "Sangamner"
  | "Sangli"
  | "Satara"
  | "Sawantwadi"
  | "Shegaon"
  | "Shevgaon"
  | "Shrirampur"
  | "Sindhudurg"
  | "Solapur"
  | "Thane"
  | "Vasai"
  | "Vengurla"
  | "Virar"
  | "Wardha"
  | "Washim"
  | "Yeotmal (Yavatmal)";

// Valid Cities (Karnataka)
export type KarnatakaCity =
  | "ALL"
  | "Aland"
  | "Anekal"
  | "Badami"
  | "Bagalkot"
  | "Ballari"
  | "Basavakalyan"
  | "Belagavi"
  | "Belthangady"
  | "Bengaluru"
  | "Bidar"
  | "Bilagi"
  | "Chamarajanagar"
  | "Chikkaballapura"
  | "Chikkamagaluru"
  | "Chikkodi"
  | "Chitradurga"
  | "Davanagere"
  | "Dharwad"
  | "Doddaballapura"
  | "Gadag"
  | "Harugeri"
  | "Hassan"
  | "Haveri"
  | "Hubballi"
  | "Kalaburagi"
  | "Karwar"
  | "Koppal"
  | "Kundapura"
  | "Madikeri"
  | "Mandya"
  | "Mangaluru"
  | "Moodabidri"
  | "Mysuru"
  | "Nelamangala"
  | "Raichur"
  | "Ramanagara"
  | "Sankeshwar"
  | "Shivamogga"
  | "Sullia"
  | "Tumakuru"
  | "Udupi"
  | "Vijayapura"
  | "Virajpet"
  | "Yadgiri";

// Combined City type
export type City = MaharashtraCity | KarnatakaCity;

// Academic Credentials
export interface MedicalAcademicCredentials {
  educationBackground: {
    educationType: string;
    stream: string;
  };
  academicMarks: {
    tenthGradeMarksPercent?: number; // 0-100, max 2 decimal places (optional, use _10thGradeMarksPercent)
    twelfthGradeMarksPercent?: number; // 0-100, max 2 decimal places (optional, use _12thGradeMarksPercent)
    groupingMarksPercent: number; // 0-100, max 2 decimal places
    _10thGradeMarksPercent: number; // Required for API payloads
    _12thGradeMarksPercent: number; // Required for API payloads
  };
  examPercentiles: {
    NEETPercentile: number; // 0-100, max 2 decimal places
    NEETAllIndiaRank: number; // >= 1
    NEETRollNumber: number; // 10-digit number (1000000000 to 9999999999)
    otherEntranceExam?: Array<{
      examName: string;
      percentileOrScore: number;
    }>;
  };
  reservationCategory: string;
  achievementsExperience?: {
    sportsAchievements?: string;
    certifications?: string;
    internshipsWorkExperience?: string;
    otherAchievements?: string;
  };
  preferences: {
    medicalPrograms: MedicalProgram[];
    preferredCities: string[];
    state: State;
  };
  campusFacilitiesEnvironment?: {
    hostelFacility?: string;
    campusSetting?: string;
    transportFacility?: string;
  };
  annualBudget: number; // >= 0
  collegeTypePreferences: CollegeTypePreference[];
  priorityFactors: PriorityFactor[];
}

// Store Medical Configuration Request
export interface StoreMedicalConfigRequest {
  username: string;
  gender: Gender;
  academic_credentials: MedicalAcademicCredentials;
}

// Store Medical Configuration Response
export interface StoreMedicalConfigResponse {
  message: string;
  success: boolean;
  data: {
    medical_configuration_id: string;
    timestamp: string;
    operation: "created" | "updated";
  };
}

// Fetch Medical Student Details Response
export interface FetchMedicalDetailsResponse {
  message: string;
  success: boolean;
  data: {
    username: string;
    gender: Gender;
    academic_credentials: MedicalAcademicCredentials;
    created_at: string;
    updated_at: string;
  };
}

// Generate Medical Recommendations Request
export interface GenerateMedicalRecommendationsRequest {
  round: Round;
  last_round_college_choice_code?: number;
  medical_configuration_request: StoreMedicalConfigRequest;
}

// Medical College Search Types
export interface MedicalCollegeSearchByNameRequest {
  college_name: string;
}

export interface MedicalCollegeSearchByCodeRequest {
  college_code: number;
}

export interface MedicalCollegeSearchResponse {
  message: string;
  success: boolean;
  data: MedicalCollegeData | MedicalCollegeData[];
}

// Medical College Data
export interface MedicalCollegeData {
  college_name: string;
  college_code: number;
  college_type: string;
  course_type: string;
  city: string;
  state?: string;
}

// Medical College Recommendation
export interface MedicalCollegeRecommendation {
  college: MedicalCollegeData;
  category: string;
  program: MedicalProgram;
  gender: Gender;
  neet_rank: number;
  closing_rank: number;
  admission_probability: number;
  probability_message: string;
}

// Generate Medical Recommendations Response
export interface GenerateMedicalRecommendationsResponse {
  message: string;
  success: boolean;
  data: {
    username: string;
    Dream: MedicalCollegeRecommendation[];
    Reach: MedicalCollegeRecommendation[];
    Match: MedicalCollegeRecommendation[];
    Safety: MedicalCollegeRecommendation[];
    Round: Round;
    is_payment: boolean;
    accept_payment: boolean;
  };
}
