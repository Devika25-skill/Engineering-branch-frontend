
export interface Department {
  name: string;
  intake?: number | null;
  nbaAccredited?: boolean | null;
  placementRate?: number | null;
  cetPercent?: number | null;
  jeePercent?: number | null;
  otherPercent?: number | null;
}

export interface LocationDetails {
  address?: string | null;
  nearestRailwayStation?: string | null;
  distanceFromRailway?: number | null;
  nearestAirport?: string | null;
  distanceFromAirport?: number | null;
}

export interface CETCutoffRange {
  min: number;
  max: number;
  year?: number;
}

export interface College {
  id: number;
  name: string;
  logo?: string | null;
  city: string | null;
  region?: string | null;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  affiliation?: string;
  otherNames?: string[] | null;
  streams?: string[];
  coursesOffered?: number | null;
  totalIntake?: number | null;
  fees?: number | null;
  feesRange?: {
    min: number;
    max: number;
  };
  hostelFees?: number | null;
  hasHostel?: boolean | null;
  rating?: number | null;
  placement?: number | null;
  placementRange?: {
    min: number | null;
    max: number | null;
  };
  type: 'Government' | 'Private' | 'Autonomous';
  college_type?: string;
  established?: number | null;
  nirf_ranking?: number | null;
  cutoff_percentile?: number | null;
  cetCutoffRange?: CETCutoffRange | null;
  cutoffRange?: {
    min: number;
    max: number;
  };
  infrastructure_score?: number | null;
  faculty_score?: number | null;
  naacGrade?: string | null;
  campusSize?: number | null;
  totalFaculty?: number | null;
  
  // Detailed structures
  departments?: Department[] | null;
  locationDetails?: LocationDetails | null;
  
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
  
  // Media
  gallery?: string[];
  virtualTour?: string;
  
  // Additional Info
  achievements?: string[];
  alumniHighlights?: string[];
  researchAreas?: string[];
}

export interface CollegeFilters {
  searchTerm: string;
  selectedRegions: string[];
  selectedStreams: string[];
  selectedTypes: string[];
  feesRange: [number, number];
  placementRange: [number, number];
  ratingRange: [number, number];
}

export interface CollegeStats {
  totalColleges: number;
  regions: string[];
  cities: string[];
  streams: string[];
  types: string[];
  feesRange: { min: number; max: number };
}
