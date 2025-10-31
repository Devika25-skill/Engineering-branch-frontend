export interface MedicalFormData {
  // Basic Information
  reservationCategory?: string;
  grouping?: string; // PCM, PCMB, PCB
  
  // Academic Performance
  tenthMarks?: number;
  twelfthMarks?: number;
  groupingMarks?: number; // PCB marks
  
  // Entrance Exam Scores
  ugNeetPercentile?: number;
  allIndiaRank?: number;
  neetRollNumber?: string;
  otherExamName?: string;
  otherExamScore?: number;
  
  // Achievements (optional)
  sportsAchievements?: string;
  certifications?: string;
  internships?: string;
  otherAchievements?: string;
  
  // Preferences
  preferredPrograms?: string[]; // MBBS, BDS, BAMS, etc.
  preferredCities?: string[];
  collegeTypes?: string[];
  hostelPreference?: string;
  campusSetting?: string;
  transportFacility?: string;
}

export const medicalPrograms = [
  'MBBS',
  'BDS',
  'BAMS',
  'BHMS',
  'BUMS',
  'BNYS',
  'BPTh',
  'BOTh',
  'BASLP',
  'BP&O',
  'ALL'
];

export const medicalGroupings = [
  'PCM (Physics, Chemistry, Mathematics)',
  'PCMB (Physics, Chemistry, Mathematics, Biology)',
  'PCB (Physics, Chemistry, Biology)'
];
