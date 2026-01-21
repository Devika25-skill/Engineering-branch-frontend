import {
  apiService,
  type RecommendationRequest,
  type RecommendationItem,
} from "./api";

export const RESERVATION_CATEGORIES: { [key: string]: string } = {
  GOPENS: "Open Category (General)",
  GSCS: "Scheduled Caste (SC)",
  GSTS: "Scheduled Tribe (ST)",
  GVJS: "VJNT (Vimukta Jati and Nomadic Tribes)",
  GNT1S: "NT1 (Nomadic Tribe - Category 1)",
  GNT2S: "NT2 (Nomadic Tribe - Category 2)",
  GNT3S: "NT3 (Nomadic Tribe - Category 3)",
  GOBCS: "Other Backward Class (OBC)",
  LOPENS: "Open Category (General) - Linguistic Minority",
  LSCS: "Scheduled Caste (SC) - Linguistic Minority",
  LNT2S: "NT2 (Nomadic Tribe - Category 2) - Linguistic Minority",
  LOBCS: "OBC - Linguistic Minority",
  DEFOPENS: "Open - Defense Quota",
  TFWS: "Tuition Fee Waiver Scheme",
  DEFROBCS: "OBC - Defense Quota",
  EWS: "Economically Weaker Section",
};

export interface CollegeRecommendation {
  college: {
    id: number;
    name: string;
    city: string;
    type: string;
    rating?: number;
    fees?: number;
    placement?: number;
    logo?: string;
    SJ_Institute_code?: number;
    // Additional properties from the new API response
    Student_Intake?: number;
    College_Website?: string;
    College_Hostel_Available?: string;
    College_Bus_Facility_Available?: string;
    Sports_Facilities?: string;
    Lab_Facilities?: string;
    Top_Recruiters?: string[];
  };
  course_name: string;
  admission_probability: number;
  probability_message: string;
  cutoff_percentile: number;
  match_reasons: string[];
  category: "Dream" | "Reach" | "Match" | "Safety";
  choice_code?: string;
  reservation_category?: string;
}

export const cutoffService = {
  async generateRecommendations(
    formData: any,
    colleges: any[],
    token: string
  ): Promise<CollegeRecommendation[]> {
    try {
      // Validate that the category is one of the allowed categories
      const allowedCategories = Object.keys(RESERVATION_CATEGORIES);
      const category = formData.reservationCategory || "GOPENS";

      if (!allowedCategories.includes(category)) {
        console.warn(`Invalid category ${category}, defaulting to GOPENS`);
        formData.reservationCategory = "GOPENS";
      }

      // Map form data to API payload - send full course names, not short forms
      const payload: RecommendationRequest = {
        category: formData.reservationCategory || "GOPENS",
        cet_percentile: formData.cetPercentile,
        cet_course: formData.preferredStreams || [], // Send actual course names
        location: (formData.preferredCities || []).map((city: string) =>
          city.toLowerCase()
        ),
      };

      const response = await apiService.getRecommendations(payload, token);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recommendations");
      }

      // Transform API response to our format
      const allRecommendations: CollegeRecommendation[] = [];

      // Process each category
      ["Dream", "Reach", "Match", "Safety"].forEach((category) => {
        const categoryData =
          response.data[category as keyof typeof response.data] || [];

        categoryData.forEach((item: RecommendationItem) => {
          const college = item.college;

          // Generate match reasons based on the data
          const matchReasons: string[] = [];

          if (item.admission_probability >= 80) {
            matchReasons.push("High admission probability");
          } else if (item.admission_probability >= 60) {
            matchReasons.push("Good admission probability");
          } else if (item.admission_probability >= 40) {
            matchReasons.push("Fair admission probability");
          } else {
            matchReasons.push("Challenging but possible");
          }

          if (college.NAAC_Acrredition) {
            matchReasons.push(`NAAC ${college.NAAC_Acrredition} accredited`);
          }

          if (
            college.Overall_College_Placement_Percentage &&
            college.Overall_College_Placement_Percentage > 70
          ) {
            matchReasons.push("Good placement record");
          }

          if (
            college.College_Reviews_out_of_5 &&
            college.College_Reviews_out_of_5 >= 4
          ) {
            matchReasons.push("Highly rated college");
          }

          if (formData.preferredCities?.includes(college.City)) {
            matchReasons.push("Located in preferred city");
          }

          const recommendation: CollegeRecommendation = {
            college: {
              id: college.SJ_Institute_Code,
              name: college.College_Name,
              city: college.City,
              type: college.College_Type,
              rating: college.College_Reviews_out_of_5,
              fees: college["Annual_Fees_(INR)"],
              placement: college.Overall_College_Placement_Percentage,
              logo: college.College_Logo,
              SJ_Institute_code: college.SJ_Institute_Code,
              // Map additional properties from the new API response
              Student_Intake: college.Student_Intake,
              College_Website: college.College_Website,
              College_Hostel_Available: college.College_Hostel_Available,
              College_Bus_Facility_Available:
                college.College_Bus_Facility_Available,
              Sports_Facilities: college.Sports_Facilities,
              Lab_Facilities: college.Lab_Facilities,
              Top_Recruiters: college.Top_Recruiters,
            },
            course_name: item.course,
            admission_probability: item.admission_probability,
            probability_message: item.probability_message,
            cutoff_percentile: item.cutoff,
            match_reasons: matchReasons,
            category: category as "Dream" | "Reach" | "Match" | "Safety",
            choice_code: item.choice_code,
            reservation_category: item.category,
          };

          allRecommendations.push(recommendation);
        });
      });

      return allRecommendations;
    } catch (error: any) {
      console.error("❌ Error in generateRecommendations:", error);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  },
};
