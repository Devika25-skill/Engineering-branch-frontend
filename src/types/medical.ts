// Medical Program Types
export type MedicalProgram = 
  | "ALL"
  | "MBBS"
  | "BDS"
  | "BAMS"
  | "BHMS"
  | "BUMS"
  | "BNYS"
  | "BPTH"
  | "BOTH"
  | "BASLP"
  | "BP&O";

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
  | "EMST" | "HOPENW" | "HSCW" | "HEWS" | "EMNTDW" | "PWD-ST" | "OBCW"
  | "PWD-SC" | "OPEN" | "EMNTD" | "DEF2" | "ORPHANC-SE" | "PH" | "PWD-SEB"
  | "HAORP-" | "NTD" | "MKB" | "HOPEN" | "EMSCW" | "PWD-VJA" | "ORPHANC-SC"
  | "ORPHAN-OBC" | "PWD-OPEN" | "ORPHANC-VJ" | "PWD-OBC" | "ORPHAN-NTC"
  | "NTC(W)" | "OBC" | "EMVJAW" | "DEF1" | "EMNTB" | "NTD(W)" | "W" | "OBC(W)"
  | "PWD-EWS" | "PWD" | "EMSC" | "PWD-NTC" | "HA" | "HVJA" | "VJA" | "HSC"
  | "EMOBC" | "ORPHANC-ST" | "EMVJA" | "EMNTBW" | "EMSTW" | "ORPHANC-NT"
  | "HEM" | "EWS(W)" | "HSEBC" | "HNTB" | "HST" | "SC" | "ORPHAN" | "ORPHAN-C"
  | "EMNTC" | "NTC" | "PWD-SEBC" | "PWD-NTD" | "HSTW" | "PWD-NTB" | "ORPHANC-EW"
  | "ORPHANC" | "PEM" | "NTB" | "I.Q." | "EMSEBC" | "MINO" | "SEBC" | "ORPHANC-OB"
  | "HNTC" | "NTB(W)" | "EMSEBCW" | "EWS" | "ST" | "HOBC" | "HNTD" | "HVJAW"
  | "DEF3" | "EMNTCW" | "SEBC(W)" | "EMOBCW";

// College Type Preferences
export type CollegeTypePreference = 
  | "ALL"
  | "Government"
  | "Autonomous"
  | "Private"
  | "Deemed University"
  | "University Department";

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

// Valid Cities (Maharashtra)
export type City = 
  | "ALL"
  | "Nashik" | "Ambajogai" | "Ambernath" | "Jalna" | "Chandrapur" | "Malegaon"
  | "Yavatmal" | "Raigad" | "Nandurbar" | "Beed" | "Amravati" | "Nalasopara"
  | "Chandwad" | "Sindhudurga" | "Pandharpur" | "Parbhani" | "Panvel" | "Alibaug"
  | "Ratnagiri" | "Nagpur" | "Latur" | "Dombivali" | "Vengurla" | "Sakegaon"
  | "Chinchwad" | "Wardha" | "Sindhudurg" | "Gadhinglaj" | "Baramati" | "Hingoli"
  | "Chalisgaon" | "Sangi" | "Bhiwandi" | "Dharashiv" | "Yeotmal" | "Virar"
  | "Palghar" | "Chhatrapati Sambhajinagar (Aurangabad)" | "Solapur" | "Sawantwadi"
  | "Thane" | "Satara" | "Satana" | "Rohatur" | "Dhule" | "Buldhana"
  | "Bhandara" | "Sangli" | "Nanded" | "Karjat" | "Nandihills" | "Sangamner"
  | "Gondia" | "Miraj" | "Akola" | "Jaysingpur" | "Pune" | "Sinnar" | "Washim"
  | "Alibag" | "Jalgaon" | "Kolhapur" | "Kannad" | "Kalyan" | "Ahilyanagar"
  | "Gadchiroli" | "Mumbai" | "Khamgaon" | "Jaisingpur" | "Shevgaon" | "Shrirampur"
  | "Kopargaon" | "Rahuri";

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
