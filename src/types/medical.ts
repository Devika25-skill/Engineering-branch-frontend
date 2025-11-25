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
  | "PCMB (Physics, Chemistry, Mathematics, Biology)"
  | "PCM (Physics, Chemistry, Mathematics)";

// Maharashtra Reservation Categories
export type ReservationCategory = 
  | "HEWS" | "EMNTDW" | "OPEN" | "EMNTD" | "ORPHANC-SE" | "PH" | "VJ" | "HOPEN"
  | "PWD-VJA" | "PHVJ" | "PWD-OPEN" | "ORPHANC-VJ" | "ORP-A" | "PWD-NTC"
  | "HVJA" | "PHNT3" | "D1HA" | "PHEWS" | "EMVJA" | "EWS(W)" | "PHOBC" | "D3"
  | "NRI" | "ORPHAN" | "NTC" | "EMSEBC" | "MINO" | "ORPHANC-OB" | "NTB(W)"
  | "EWS" | "HNTD" | "SIDDIQUI" | "EMST" | "HOPENW" | "PWD-ST" | "OBCW"
  | "HAORP-ORPHANC" | "HAORP-C" | "DEF2" | "EMSCW" | "SEB" | "ORPHAN-OBC"
  | "ORPHAN-NTC" | "NTC(W)" | "NTD(W)" | "OBC(W)" | "EMSC" | "WMINO" | "EMOBC"
  | "ORPHANC-ST" | "PHSEBC" | "ORPHAN-C" | "PWD-NTB" | "(EMD)" | "ORPHANC-EW"
  | "PEM" | "I.Q." | "EMSEBCW" | "HSCW" | "PHNT2" | "PWD-SEB" | "ORP-C" | "NT2"
  | "NTD" | "PHNT1" | "ORPHANC-SC" | "PWD-OBC" | "OBC" | "ORPHAN-A" | "(W)"
  | "PWD" | "HA" | "VJA" | "EMNTBW" | "D1PWD" | "ORPHANC-NT" | "HEM" | "HST"
  | "SC" | "PWD-SEBC" | "PWD-NTD" | "(W" | "NTB" | "HNTC" | "HOBC" | "DEF3"
  | "EMNTCW" | "PWD-SC" | "D1" | "HAORP-" | "MKB" | "EMVJAW" | "D2" | "DEF1"
  | "EMNTB" | "W" | "PWD-EWS" | "(EMR)" | "HSC" | "EMSTW" | "HSEBC" | "HNTB"
  | "EMNTC" | "HSTW" | "ORPHANC" | "NT1" | "SEBC" | "ST" | "HVJAW" | "SEBC(W)"
  | "EMOBCW";

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
  | "Ahmednagar" | "Akola" | "Amravati" | "Beed" | "Bhandara" | "Buldhana"
  | "Chandrapur" | "Chh. Sambhaji Nagar (Aurangabad)" | "Chikhli"
  | "Dharashiv (Osmanabad)" | "Dhule" | "Ichalkaranji" | "Jalgaon" | "Jalna"
  | "Kalyan" | "Kolhapur" | "Latur" | "Mumbai" | "Nagpur" | "Nanded"
  | "Nandurbar" | "Nashik" | "Palghar" | "Pandharpur" | "Parbhani" | "Pune"
  | "Raigad" | "Ratnagiri" | "Sangli" | "Satara" | "Sindhudurg" | "Solapur"
  | "Thane" | "Ulhasnagar" | "Wardha" | "Washim" | "Yavatmal";

// Academic Credentials
export interface MedicalAcademicCredentials {
  educationBackground: {
    educationType: string;
    stream: string;
  };
  academicMarks: {
    _10thGradeMarksPercent: number; // 0-100, max 2 decimal places
    _12thGradeMarksPercent: number; // 0-100, max 2 decimal places
    groupingMarksPercent: number; // 0-100, max 2 decimal places
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
  medical_configuration_request: StoreMedicalConfigRequest;
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
