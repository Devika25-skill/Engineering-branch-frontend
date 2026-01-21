import { config } from "@/config/env";
import type { College } from "@/types/college";
import type {
  StoreMedicalConfigRequest,
  StoreMedicalConfigResponse,
  FetchMedicalDetailsResponse,
  GenerateMedicalRecommendationsRequest,
  GenerateMedicalRecommendationsResponse,
} from "@/types/medical";

const API_BASE_URL = config.apiBaseUrl;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface CollegeFilters {
  city?: string[];
  streams?: string[];
  type?: string[];
  feesRange?: [number, number];
  hasHostel?: boolean;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ApiCollegeResponse {
  college_name: string;
  institute_id: string;
  sj_institute_id: number;
  city: string;
  region: string | null;
  logo: string;
  rating: number;
  courses_count: number;
  total_intake: number;
  fees: number;
  placement_range: {
    min: number;
    max: number | null;
  };
  cet_cutoff_range: {
    min: number | null;
    max: number | null;
  };
  courses: string[];
  college_type?: string;
}

export interface ApiCollegeListResponse {
  message: string;
  success: boolean;
  data: {
    colleges: ApiCollegeResponse[];
  };
}

export interface ApiCollegeDetailsResponse {
  message: string;
  success: boolean;
  data: {
    College_Name: string;
    College_Website?: string;
    College_Address?: string;
    City: string;
    College_Type: string;
    NAAC_Acrredition?: string;
    University_Affiliation?: string;
    "Annual_Fees_(INR)"?: number;
    "Previous_Year_Highest_Package_Offered_(LPA)"?: number;
    Student_Intake?: number;
    College_Reviews_out_of_5?: number;
    Faculty_Student_Ratio?: string;
    NIRF_Rank_Min?: number;
    NIRF_Rank_Max?: number;
    College_Code?: number;
    Average_Placement_Percentage?: number;
    SJ_Institute_Code: number;
    College_Logo?: string;
    Engineering_Streams?: number;
    Established_Year?: number;
    Facilities?: {
      Hostel?: string;
      Lab?: string;
      Sports?: string;
      Bus?: string;
      Internet?: string;
    };
    Placement_Details?: {
      Overall_College_Placement_Percentage?: number;
      Highest_Package_LPA?: number;
      Average_Package_LPA?: number;
      Top_Recruiters?: string[];
    };
    Admission_Process?: string;
    Location?: {
      Address?: string;
      City?: string;
      Nearest_Railway_Station?: string;
      Distance_from_Railway_Station_km?: number;
      Nearest_Airport?: string;
      Distance_from_Airport_km?: number;
    };
    Departments?: Array<{
      Department_Name: string;
      NBA_Accredited?: string;
      Placement_Percentage?: number;
      Student_Intake?: number;
      CET?: number;
      JEE?: number;
      "Other Entrance"?: number;
    }>;
  };
}

interface StoreCollegeDetailsRequest {
  username: string;
  college_name: string;
  college_code: number;
  course_name: string;
  course_code: number;
  choice_code: number;
  round: number;
  location: string;
  category: string;
  cet_percentile: number;
}

interface UserRoundDetailsResponse {
  username: string;
  College_Name: string;
  City: string;
  College_code: number;
  Course_Name: string;
  Course_Code: number;
  Choice_Code: number;
  round: number;
}

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
  success: boolean;
  data: {};
}

export interface ValidateOTPRequest {
  email: string;
  user_type: string;
  otp: number;
}

export interface ValidateOTPResponse {
  isValidOtp: boolean;
  accessToken: string;
  name: string;
  profileIcon: string;
}

export interface StoreUserRequest {
  username: string;
  name: string;
  mobile?: string;
}

export interface StoreUserResponse {
  message: string;
  success: boolean;
  data: {};
}

export interface AdmissionChancesRequest {
  sj_institute_id: number;
  course_name: string;
  cet_percentile: number;
  category: string;
}

export interface AdmissionChancesResponse {
  message: string;
  success: boolean;
  data: {
    college_name: string;
    course_name: string;
    category: string;
    student_cet_percentile: number;
    last_year_cutoff: number;
    cutoff_year: number;
    admission_probability: number;
    probability_message: string;
  };
  detail?: string;
}

export interface GenerateRecommendationRequest {
  academic_credentials: {
    educationBackground: {
      educationType: string;
      stream: string;
    };
    academicMarks: {
      _10thGradeMarksPercent: number;
      _12thGradeMarksPercent: number;
      groupingMarksPercent: number;
    };
    examPercentiles: {
      CET?: number;
      JEE?: number;
      otherEntranceExam?: Array<{
        examName?: string;
        percentileOrScore?: number;
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
      engineeringBranches: string[];
      preferredCities: string[];
      preferredDistrict?: string;
    };
    campusFacilitiesEnvironment?: {
      hostelFacility?: string;
      campusSetting?: string;
      transportFacility?: string;
      wifiTechInfrastructure?: string;
      coCurricularActivities?: string;
    };
    annualBudget: number;
    collegeTypePreferences?: string[];
    priorityFactors?: string[];
  };
  username: string;
  gender?: string;
}

export interface GenerateRecommendationResponse {
  message: string;
  success: boolean;
  data: {
    accept_payment: any;
    is_payment: any;
    recommendation_id: string;
    created_at: string;
  };
}

export interface GenerateRoundListRequest {
  category: string;
  cet_percentile: number;
  cet_course: string[];
  location: string[];
  round: number;
  last_round_college_choice_code: number;
}

export interface RoundListCollege {
  College_Name: string;
  College_Website: string;
  College_Address: string;
  City: string;
  College_Type: string;
  NAAC_Acrredition: string;
  University_Affiliation: string;
  Courses_Offered: string;
  Overall_College_Placement_Percentage: number;
  Student_Intake: number;
  Admission_Remarks?: string;
  College_Hostel_Available: string;
  Annual_Fees_INR: number;
  Annual_Hostel_Fees_INR?: number;
  Previous_Year_Highest_Package_Offered_LPA: number;
  College_Working_Hours?: string;
  Lab_Facilities: string;
  College_Reviews_out_of_5: number;
  College_Bus_Facility_Available: string;
  Nearest_Airport: string;
  Distance_from_Airport: number;
  Nearest_Railway_Station: string;
  Distance_from_Railway_Station: number;
  MHT_CET_Accepted: string;
  JEE_Mains_Accepted: string;
  Scholarships_Offered: string;
  Sports_Facilities: string;
  Internship_Programs: string;
  Faculty_Student_Ratio: string;
  Alumni_Connect: string;
  References: string;
  NIRF_Rank_Min: number;
  NIRF_Rank_Max: number;
  Top_Recruiters: string[];
  College_Code: number;
  SJ_Institute_Code: number;
  College_Logo: string;
  Region: string;
}

export interface RoundListRecommendation {
  college: RoundListCollege;
  course: string;
  admission_probability: number;
  probability_message: string;
  cet_percentile: number;
  category: string;
  cutoff: number;
}

export interface GenerateRoundListResponse {
  message: string;
  success: boolean;
  data: {
    username: string;
    Dream: RoundListRecommendation[];
    Reach: RoundListRecommendation[];
    Match: RoundListRecommendation[];
    Safety: RoundListRecommendation[];
    Round: number;
    is_payment: boolean;
    accept_payment: boolean;
  };
}

// Diploma recommendation interfaces
export interface DiplomaRoundListRequest {
  category: string;
  cet_percentile: number;
  cet_course: string[];
  location: string[];
}

export interface DiplomaRoundListResponse {
  message: string;
  success: boolean;
  data: {
    username?: string;
    Dream: RoundListRecommendation[];
    Reach: RoundListRecommendation[];
    Match: RoundListRecommendation[];
    Safety: RoundListRecommendation[];
    Round?: number;
    is_payment?: boolean;
    accept_payment?: boolean;
  };
}

export interface DiplomaConfigResponse {
  message: string;
  success: boolean;
  data: {
    round: number;
    configuration: any;
  };
}

export interface CutoffApiResponse {
  message: string;
  success: boolean;
  data: {
    college_name: string;
    college_code: number;
    course_name: string;
    category: string;
    cutoff_percentile: number;
    cutoff_year: number;
    sj_institute_id: number;
  }[];
}

export interface RecommendationRequest {
  category: string;
  cet_percentile: number;
  cet_course: string[];
  location: string[];
  district?: string;
  gender?: string;
  round?: number;
  last_round_college_choice_code?: number | string;
}

export interface RecommendationCollegeData {
  College_Name: string;
  College_Website?: string;
  College_Address?: string;
  City: string;
  College_Type: string;
  NAAC_Acrredition?: string;
  University_Affiliation?: string;
  Courses_Offered?: string;
  Overall_College_Placement_Percentage?: number;
  Student_Intake?: number;
  College_Hostel_Available?: string;
  "Annual_Fees_(INR)"?: number;
  "Annual_Hostel_Fees_(INR)"?: number;
  "Previous_Year_Highest_Package_Offered_(LPA)"?: number;
  College_Working_Hours?: string;
  Lab_Facilities?: string;
  College_Reviews_out_of_5?: number;
  College_Bus_Facility_Available?: string;
  Nearest_Airport?: string;
  Distance_from_Airport?: number;
  Nearest_Railway_Station?: string;
  Distance_from_Railway_Station?: number;
  College_Entrance_Exam?: string;
  MHT_CET_Accepted?: string;
  JEE_Mains_Accepted?: string;
  Scholarships_Offered?: string;
  Sports_Facilities?: string;
  Internship_Programs?: string;
  Faculty_Student_Ratio?: string;
  Alumni_Connect?: string;
  References?: string;
  NIRF_Rank_Min?: number;
  NIRF_Rank_Max?: number;
  Top_Recruiters?: string[];
  College_Code?: number;
  SJ_Institute_Code: number;
  College_Logo?: string;
}

export interface RecommendationItem {
  college: RecommendationCollegeData;
  course: string;
  admission_probability: number;
  probability_message: string;
  cet_percentile: number;
  category: string;
  cutoff: number;
}

export interface RecommendationApiResponse {
  message: string;
  success: boolean;
  data: {
    accept_payment: any;
    is_payment(is_payment: any): unknown;
    Dream: RecommendationItem[];
    Reach: RecommendationItem[];
    Match: RecommendationItem[];
    Safety: RecommendationItem[];
  };
}

export interface FetchAICapDetailsResponse {
  message: string;
  success: boolean;
  data: {
    username: string;
    gender?: string;
    academic_credentials: {
      educationBackground: {
        educationType: string;
        stream: string;
      };
      academicMarks: {
        _10thGradeMarksPercent: number;
        _12thGradeMarksPercent: number;
        groupingMarksPercent: number;
      };
      examPercentiles: {
        CET: number;
        JEE: number;
        otherEntranceExam: {
          examName: string;
          percentileOrScore: number;
        }[];
      };
      reservationCategory: string;
      achievementsExperience: {
        sportsAchievements: string;
        certifications: string;
        internshipsWorkExperience: string;
        otherAchievements: string;
      };
      preferences: {
        engineeringBranches: string[];
        preferredCities: string[];
        preferredDistrict?: string;
      };
      campusFacilitiesEnvironment: {
        hostelFacility: string;
        campusSetting: string;
        transportFacility: string;
        wifiTechInfrastructure: string;
        coCurricularActivities: string;
      };
      annualBudget: number;
      collegeTypePreferences: string[];
      priorityFactors: string[];
    };
  };
}

// Round 2 Search Interfaces
export interface CollegeSearchByChoiceCodeRequest {
  choice_code: number | string;
}

export interface CollegeSearchByNameRequest {
  college_name: string;
}

export interface CollegeSearchByCodeRequest {
  college_code: number;
}

export interface CollegeDepartment {
  course_name: string;
  choice_code: number;
  course_code?: number;
  sj_code?: number;
}

export interface CollegeSearchResult {
  College_Name: string;
  College_Website: string;
  City: string;
  College_code: number;
  department: CollegeDepartment | CollegeDepartment[];
}

export interface CollegeSearchResponse {
  message: string;
  success: boolean;
  data: CollegeSearchResult | CollegeSearchResult[] | null;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getCutoffData(token: string): Promise<CutoffApiResponse> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    return this.request<CutoffApiResponse>(
      "/api/v1/explore/colleges/cutoff/all",
      {
        method: "GET",
        headers,
      }
    );
  }

  async getColleges(filters?: CollegeFilters): Promise<ApiResponse<College[]>> {
    // Prepare the payload for the API
    const payload = {
      college_name: filters?.search ? [filters.search] : [],
      course: [],
      city: filters?.city || [],
      sort_by: this.mapSortBy(filters?.sortBy || "rating"),
      order: "desc",
    };

    const response = await this.request<ApiCollegeListResponse>(
      "/api/v1/explore/Quick_College_Scan/",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    // Transform API response to match our College interface
    const colleges: College[] = response.data.colleges.map((apiCollege) => {
      // Handle placement range safely
      const placementMin = apiCollege.placement_range?.min || null;
      const placementMax = apiCollege.placement_range?.max || null;
      const averagePlacement =
        placementMin !== null && placementMax !== null && placementMax > 0
          ? Math.round((placementMin + placementMax) / 2)
          : placementMin || null;

      // Handle CET cutoff range safely
      const cetCutoffRange =
        apiCollege.cet_cutoff_range?.min !== null &&
        apiCollege.cet_cutoff_range?.max !== null
          ? {
              min: apiCollege.cet_cutoff_range.min,
              max: apiCollege.cet_cutoff_range.max,
              year: new Date().getFullYear(),
            }
          : null;

      // Ensure streams is always an array
      const streams = Array.isArray(apiCollege.courses)
        ? apiCollege.courses
        : [];

      return {
        id: apiCollege.sj_institute_id,
        name: apiCollege.college_name || null,
        logo: apiCollege.logo || null,
        city: apiCollege.city || null,
        region: apiCollege.region || null,
        streams: streams,
        coursesOffered: apiCollege.courses_count || null,
        totalIntake: apiCollege.total_intake || null,
        fees: apiCollege.fees || null,
        rating: apiCollege.rating || null,
        placement: averagePlacement,
        placementRange:
          placementMin !== null || placementMax !== null
            ? {
                min: placementMin,
                max: placementMax,
              }
            : null,
        cetCutoffRange: cetCutoffRange,
        type: "Private" as const,
        college_type: apiCollege.college_type || "Private",
        established: null,
        hasHostel: null,
        infrastructure_score: null,
        faculty_score: null,
        cutoff_percentile: apiCollege.cet_cutoff_range?.max || null,
        naacGrade: null,
        campusSize: null,
        totalFaculty: null,
      };
    });

    return {
      success: true,
      data: colleges,
      message: response.message,
    };
  }

  private mapSortBy(sortBy: string): string {
    const sortMapping: { [key: string]: string } = {
      rating: "rating",
      name: "name",
      fees: "fees",
      placement: "placement_percentage",
    };

    return sortMapping[sortBy] || "rating";
  }

  async getCollegeById(id: number): Promise<ApiResponse<College>> {
    const response = await this.request<ApiCollegeDetailsResponse>(
      `/api/v1/explore/college/${id}`
    );

    // Transform API response to match our College interface
    const apiData = response.data;

    // Helper function to safely convert values to avoid null/undefined
    const safeValue = (value: any): any => {
      if (value === null || value === undefined || value === 0 || value === "")
        return null;
      return value;
    };

    // Helper function to capitalize first letter
    const capitalizeFirst = (str: string): string => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Process departments data
    const departments =
      apiData.Departments?.map((dept) => ({
        name: dept.Department_Name,
        nbaAccredited:
          dept.NBA_Accredited === "Yes"
            ? true
            : dept.NBA_Accredited === "No"
              ? false
              : null,
        placementRate: safeValue(dept.Placement_Percentage),
        intake: safeValue(dept.Student_Intake),
        cetPercent: safeValue(dept.CET),
        jeePercent: safeValue(dept.JEE),
        otherPercent: safeValue(dept["Other Entrance"]),
      })) || [];

    const college: College = {
      id: apiData.SJ_Institute_Code,
      name: apiData.College_Name,
      logo: safeValue(apiData.College_Logo),
      city: apiData.City,
      address: safeValue(apiData.College_Address),
      website: safeValue(apiData.College_Website),
      phone: null,
      email: null,
      affiliation: safeValue(apiData.University_Affiliation),
      otherNames: null,
      naacGrade: safeValue(apiData.NAAC_Acrredition),
      campusSize: null,
      totalFaculty: safeValue(apiData.Faculty_Student_Ratio),
      streams: departments.map((d) => d.name),
      coursesOffered: safeValue(apiData.Engineering_Streams),
      totalIntake: safeValue(apiData.Student_Intake),
      fees: safeValue(apiData["Annual_Fees_(INR)"]),
      feesRange: null,
      hostelFees: null,
      hasHostel: apiData.Facilities?.Hostel === "Yes",
      rating: safeValue(apiData.College_Reviews_out_of_5),
      placement: safeValue(
        apiData.Placement_Details?.Overall_College_Placement_Percentage ||
          apiData.Average_Placement_Percentage
      ),
      placementRange: null,
      type:
        apiData.College_Type === "private"
          ? "Private"
          : apiData.College_Type === "public"
            ? "Government"
            : "Autonomous",
      college_type: apiData.College_Type
        ? capitalizeFirst(apiData.College_Type)
        : null,
      established: safeValue(apiData.Established_Year),
      nirf_ranking: (() => {
        const min = safeValue(apiData.NIRF_Rank_Min);
        const max = safeValue(apiData.NIRF_Rank_Max);
        if (!min && !max) return null;
        if (!min || min <= 0) return max;
        if (!max || max <= 0) return min;
        return Math.round((min + max) / 2);
      })(),
      cutoff_percentile: null,
      cutoffRange: null,
      cetCutoffRange: null,
      infrastructure_score: null,
      faculty_score: null,

      // Additional detailed information from API
      facilities: {
        library: true,
        laboratories: apiData.Facilities?.Lab ? [apiData.Facilities.Lab] : [],
        sportsComplex:
          apiData.Facilities?.Sports?.includes("indoor and outdoor") || false,
        auditorium: true,
        cafeteria: true,
        medicalCenter: true,
        wifi: apiData.Facilities?.Internet === "Yes",
        transportFacility: apiData.Facilities?.Bus === "Yes",
        parking: true,
      },

      placementDetails: {
        averagePackage: safeValue(
          apiData.Placement_Details?.Average_Package_LPA
        ),
        highestPackage:
          safeValue(apiData.Placement_Details?.Highest_Package_LPA) ||
          (apiData["Previous_Year_Highest_Package_Offered_(LPA)"]
            ? apiData["Previous_Year_Highest_Package_Offered_(LPA)"] / 100000
            : null),
        majorRecruiters: apiData.Placement_Details?.Top_Recruiters || [],
        placementOfficer: null,
      },

      admission: {
        process:
          safeValue(apiData.Admission_Process) || "Based on entrance exam",
        eligibility: "As per university norms",
        importantDates: undefined,
      },

      location: {
        nearbyLandmarks: apiData.Location?.Nearest_Airport
          ? [apiData.Location.Nearest_Airport]
          : [],
        transportation: apiData.Location?.Nearest_Railway_Station
          ? [apiData.Location.Nearest_Railway_Station]
          : [],
        latitude: undefined,
        longitude: undefined,
      },

      achievements: [],
      alumniHighlights: [],

      // Add departments data
      departments: departments,

      // Add location details
      locationDetails: {
        address: safeValue(
          apiData.Location?.Address || apiData.College_Address
        ),
        nearestRailwayStation: safeValue(
          apiData.Location?.Nearest_Railway_Station
        ),
        distanceFromRailway: safeValue(
          apiData.Location?.Distance_from_Railway_Station_km
        ),
        nearestAirport: safeValue(apiData.Location?.Nearest_Airport),
        distanceFromAirport: safeValue(
          apiData.Location?.Distance_from_Airport_km
        ),
      },
    };

    return {
      success: true,
      data: college,
      message: response.message,
    };
  }

  async getCollegeStats(): Promise<
    ApiResponse<{
      totalColleges: number;
      cities: string[];
      streams: string[];
      types: string[];
      feesRange: { min: number; max: number };
    }>
  > {
    // This will use the same colleges data to compute stats
    const response = await this.getColleges();
    const colleges = response.data;

    const cities = [...new Set(colleges.map((c) => c.city))].filter(Boolean);
    const streams = [
      ...new Set(colleges.flatMap((c) => c.streams || [])),
    ].filter(Boolean);
    const types = [...new Set(colleges.map((c) => c.college_type))].filter(
      Boolean
    );
    const fees = colleges.map((c) => c.fees).filter((f) => f > 0);

    return {
      success: true,
      data: {
        totalColleges: colleges.length,
        cities,
        streams,
        types,
        feesRange: { min: Math.min(...fees), max: Math.max(...fees) },
      },
    };
  }

  async sendOTP(email: string): Promise<SendOTPResponse> {
    const payload: SendOTPRequest = { email };

    return this.request<SendOTPResponse>("/api/v1/auth/sendOTP", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async validateOTP(email: string, otp: number): Promise<ValidateOTPResponse> {
    const payload: ValidateOTPRequest = {
      email,
      user_type: "user",
      otp,
    };

    return this.request<ValidateOTPResponse>("/api/v1/auth/validateOTP", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async storeUser(
    email: string,
    name: string,
    mobile?: string
  ): Promise<StoreUserResponse> {
    const username: string = email;
    const payload: StoreUserRequest = {
      username,
      name,
      ...(mobile && { mobile }),
    };

    return this.request<StoreUserResponse>("/api/v1/user/store_user", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async calculateAdmissionChances(
    payload: AdmissionChancesRequest
  ): Promise<AdmissionChancesResponse> {
    return this.request<AdmissionChancesResponse>(
      "/api/v1/explore/admission-chances",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async generateRecommendation(
    payload: GenerateRecommendationRequest
  ): Promise<GenerateRecommendationResponse> {
    return this.request<GenerateRecommendationResponse>(
      "/api/v1/explore/generate_recommendation",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  }

  async getRecommendations(
    payload: RecommendationRequest,
    token: string
  ): Promise<RecommendationApiResponse> {
    return this.request<RecommendationApiResponse>(
      "/api/v1/explore/recommendation/college-list",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async getRoundRecommendations(round: number, token: string): Promise<any> {
    return this.request<any>(
      `/api/v1/explore/recommendation/college-list?round=${round}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }

  async getExistingRecommendations(
    token: string
  ): Promise<RecommendationApiResponse> {
    return this.request<RecommendationApiResponse>(
      "/api/v1/explore/recommendation/college-list",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
  }

  async fetchAICapDetails(token: string): Promise<FetchAICapDetailsResponse> {
    return this.request<FetchAICapDetailsResponse>(
      "/api/v1/explore/fetchAICapDetails",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Round 2 Search Methods
  async searchCollegeByChoiceCode(
    payload: CollegeSearchByChoiceCodeRequest,
    token: string
  ): Promise<CollegeSearchResponse> {
    return this.request<CollegeSearchResponse>(
      "/api/v1/explore/search_college_by/choice_code",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async searchCollegeByName(
    payload: CollegeSearchByNameRequest,
    token: string
  ): Promise<CollegeSearchResponse> {
    return this.request<CollegeSearchResponse>(
      "/api/v1/explore/search_college_by/college_name",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async searchCollegeByCode(
    payload: CollegeSearchByCodeRequest,
    token: string
  ): Promise<CollegeSearchResponse> {
    return this.request<CollegeSearchResponse>(
      "/api/v1/explore/search_college_by/college_code",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async storeCollegeDetails(
    payload: StoreCollegeDetailsRequest,
    token: string
  ): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      "/api/v1/user/store_college_details",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async getUserRoundDetails(
    round: number,
    token: string
  ): Promise<ApiResponse<UserRoundDetailsResponse>> {
    return this.request<ApiResponse<UserRoundDetailsResponse>>(
      `/api/v1/user/get_user_round_details/${round}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }

  async updateRoundPreferences(
    payload: { round: number; branches: string[]; cities: string[] },
    token: string
  ): Promise<ApiResponse<{ round_status: string }>> {
    return this.request<ApiResponse<{ round_status: string }>>(
      "/api/v1/user/round_prefrences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async getUserRoundPreferences(
    round: number,
    token: string
  ): Promise<
    ApiResponse<{ round: number; branches: string[]; cities: string[] }>
  > {
    return this.request<
      ApiResponse<{ round: number; branches: string[]; cities: string[] }>
    >(`/api/v1/user/get_user_round_preferences/${round}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  }

  async generateRoundList(
    payload: GenerateRoundListRequest,
    token: string
  ): Promise<GenerateRoundListResponse> {
    return this.request<GenerateRoundListResponse>(
      "/api/v1/explore/generate/round-list",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  // Diploma recommendation methods
  async generateDiplomaRoundList(
    payload: DiplomaRoundListRequest
  ): Promise<DiplomaRoundListResponse> {
    return this.request<DiplomaRoundListResponse>(
      "/api/v1/explore/generate/diploma-round-list",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  // Diploma Round 2 API method
  async generateDiplomaRound2List(payload: {
    category: string;
    cet_percentile: number;
    cet_course: string[];
    location: string[];
    round: number;
    last_round_college_choice_code: number;
  }): Promise<DiplomaRoundListResponse> {
    return this.request<DiplomaRoundListResponse>(
      "/api/v1/explore/generate/diploma-round-list",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async getDiplomaConfig(roundNo: number): Promise<DiplomaConfigResponse> {
    return this.request<DiplomaConfigResponse>(
      `/api/v1/explore/get-diploma-config/${roundNo}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  // Medical recommendation methods
  async storeMedicalConfiguration(
    payload: StoreMedicalConfigRequest
  ): Promise<StoreMedicalConfigResponse> {
    return this.request<StoreMedicalConfigResponse>(
      "/api/v1/medical/student/configuration",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  async fetchMedicalStudentDetails(
    token: string,
    state: string
  ): Promise<FetchMedicalDetailsResponse> {
    return this.request<FetchMedicalDetailsResponse>(
      `/api/v1/medical/student/details?state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async generateMedicalRecommendations(
    payload: GenerateMedicalRecommendationsRequest
  ): Promise<GenerateMedicalRecommendationsResponse> {
    return this.request<GenerateMedicalRecommendationsResponse>(
      "/api/v1/medical/medical/recommendations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  // Medical College Search Methods
  async searchMedicalCollegeByName(
    collegeName: string,
    token: string,
    state: string
  ): Promise<any> {
    return this.request<any>(
      `/api/v1/medical/college/search/name?college_name=${encodeURIComponent(collegeName)}&state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }

  async searchMedicalCollegeByCode(
    collegeCode: number | string,
    token: string,
    state: string
  ): Promise<any> {
    return this.request<any>(
      `/api/v1/medical/college/search/code?college_code=${collegeCode}&state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }

  // Store Medical College Details for Round
  async storeMedicalCollegeDetails(
    payload: {
      collegeName: string;
      collegeCode: number;
      courseName: string;
      round: number;
      city: string;
      state: string;
      category: string;
      NEETAllIndiaRank: number;
      isDeleted?: boolean;
    },
    token: string
  ): Promise<ApiResponse<{ college_status: string }>> {
    return this.request<ApiResponse<{ college_status: string }>>(
      "/api/v1/medical/store_medical_college_details",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  }

  // Fetch AI Cap Details
  async fetchAICapDetails(
    token: string,
    username: string
  ): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v1/explore/fetchAICapDetails?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Get Saved Medical Round Details
  async getMedicalUserRoundDetails(
    round: number,
    token: string,
    state: string
  ): Promise<
    ApiResponse<{
      userName: string;
      round: number;
      collegeName: string;
      collegeCode: number;
      courseName: string;
      city: string;
      category: string;
      NEETAllIndiaRank: number;
    }>
  > {
    return this.request<
      ApiResponse<{
        userName: string;
        round: number;
        collegeName: string;
        collegeCode: number;
        courseName: string;
        city: string;
        category: string;
        NEETAllIndiaRank: number;
      }>
    >(
      `/api/v1/medical/get_medical_user_round_details?round=${round}&state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }

  // Get Medical Recommendations by Round
  async getMedicalRecommendationsByRound(
    round: number,
    token: string,
    state: string
  ): Promise<
    ApiResponse<{
      username: string;
      Dream: any[];
      Reach: any[];
      Match: any[];
      Safety: any[];
      Round: number;
      is_payment: boolean;
      accept_payment: boolean;
    }>
  > {
    return this.request<
      ApiResponse<{
        username: string;
        Dream: any[];
        Reach: any[];
        Match: any[];
        Safety: any[];
        Round: number;
        is_payment: boolean;
        accept_payment: boolean;
      }>
    >(
      `/api/v1/medical/medical/recommendations/college-list?round=${round}&state=${encodeURIComponent(state)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
  }
}

export const apiService = new ApiService();
