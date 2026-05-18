export interface College {
  id: number;
  name: string | null;
  logo?: string | null;
  city: string | null;
  region?:string | null;
  address?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  affiliation?: string | null;
  otherNames?: string | null;
  naacGrade?: string | null;
  campusSize?: string | null;
  totalFaculty?: string | null;
  streams: string[];
  coursesOffered: number | null;
  totalIntake: number | null;
  fees: number | null;
  feesRange?: {
    min: number | null;
    max: number | null;
  } | null;
  hostelFees?: number | null;
  hasHostel: boolean | null;
  rating: number | null;
  placement: number | null;
  placementRange?: {
    min: number | null;
    max: number | null;
  } | null;
  type: 'Government' | 'Private' | 'Autonomous' | null;
  college_type: string | null;
  established: number | null;
  nirf_ranking?: number | null;
  cutoff_percentile?: number | null;
  cutoffRange?: {
    min: number | null;
    max: number | null;
  } | null;
  cetCutoffRange?: {
    min: number;
    max: number;
    year: number;
  } | null;
  infrastructure_score: number | null;
  faculty_score: number | null;
  
  // Academic Information
  accreditation?: {
    naac?: string;
    nba?: string[];
  };
  approvals?: string[];
  
  // Detailed Fee Structure
  feeStructure?: {
    tuitionFee: number;
    developmentFee?: number;
    examFee?: number;
    libraryFee?: number;
    labFee?: number;
    otherFees?: number;
  };
  
  // Infrastructure & Facilities
  facilities?: {
    library?: boolean;
    laboratories?: string[];
    sportsComplex?: boolean;
    auditorium?: boolean;
    cafeteria?: boolean;
    medicalCenter?: boolean;
    wifi?: boolean;
    transportFacility?: boolean;
    parking?: boolean;
  };
  
  // Placement Details
  placementDetails?: {
    averagePackage?: number;
    highestPackage?: number;
    majorRecruiters?: string[];
    placementOfficer?: string;
  };
  
  // Student Life
  studentLife?: {
    clubs?: string[];
    culturalEvents?: string[];
    techFests?: string[];
    sports?: string[];
  };
  
  // Admission Information
  admission?: {
    process: string;
    eligibility: string;
    importantDates?: {
      applicationStart?: string;
      applicationEnd?: string;
      examDate?: string;
    };
  };
  
  // Location Details
  location?: {
    latitude?: number;
    longitude?: number;
    nearbyLandmarks?: string[];
    transportation?: string[];
  };
  
  // Location Details from API
  locationDetails?: {
    address?: string | null;
    nearestRailwayStation?: string | null;
    distanceFromRailway?: number | null;
    nearestAirport?: string | null;
    distanceFromAirport?: number | null;
  };
  
  // Departments from API
  departments?: Array<{
    name: string;
    nbaAccredited: boolean | null;
    placementRate: number | null;
    intake: number | null;
    cetPercent: number | null;
    jeePercent: number | null;
    otherPercent: number | null;
  }>;
  
  // Media
  gallery?: string[];
  virtualTour?: string;
  
  // Additional Info
  achievements?: string[];
  alumniHighlights?: string[];
  researchAreas?: string[];
}
