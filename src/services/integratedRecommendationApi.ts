import { config } from '@/config/env';

const API_BASE_URL = config.apiBaseUrl;

export interface IntegratedRoundRecommendationRequest {
  exam_type: string;
  branches: string[];
  locations: string[];
  round_no: number;
  category: string;
  score: number;
  last_college_round_choice_code?: string;
}

export interface IntegratedRecommendationResponse {
  success: boolean;
  data: {
    username: string;
    Dream: Array<{
      college: {
        College_Name: string;
        College_Code: number;
        Course_Name: string;
        Course_Code: string;
        Location: string;
      };
      admission_probability: number;
      probability_message: string;
      cet_percentile: number;
      category: string;
      cutoff: number;
    }>;
    Reach: Array<{
      college: {
        College_Name: string;
        College_Code: number;
        Course_Name: string;
        Course_Code: string;
        Location: string;
      };
      admission_probability: number;
      probability_message: string;
      cet_percentile: number;
      category: string;
      cutoff: number;
    }>;
    Match: Array<{
      college: {
        College_Name: string;
        College_Code: number;
        Course_Name: string;
        Course_Code: string;
        Location: string;
      };
      admission_probability: number;
      probability_message: string;
      cet_percentile: number;
      category: string;
      cutoff: number;
    }>;
    Safety: Array<{
      college: {
        College_Name: string;
        College_Code: number;
        Course_Name: string;
        Course_Code: string;
        Location: string;
      };
      admission_probability: number;
      probability_message: string;
      cet_percentile: number;
      category: string;
      cutoff: number;
    }>;
    Round: number;
    is_payment: boolean;
    accept_payment: boolean;
  };
  message: string;
}

export interface RoundPreferencesResponse {
  success: boolean;
  data: {
    preferences: {
      useremail: string;
      round_no: number;
      exam_type: string;
      branches: string[];
      locations: string[];
      category: string;
      score: number;
      last_college_round_choice_code: string | null;
      timestamp: string;
    };
    recommendations: Array<{
      useremail: string;
      round_no: number;
      exam_type: string;
      Dream: Array<{
        college: {
          College_Name: string;
          College_Code: number;
          Course_Name: string;
          Course_Code: string;
          Location: string;
        };
        admission_probability: number;
        probability_message: string;
        cet_percentile: number;
        category: string;
        cutoff: number;
      }>;
      Reach: Array<{
        college: {
          College_Name: string;
          College_Code: number;
          Course_Name: string;
          Course_Code: string;
          Location: string;
        };
        admission_probability: number;
        probability_message: string;
        cet_percentile: number;
        category: string;
        cutoff: number;
      }>;
      Match: Array<{
        college: {
          College_Name: string;
          College_Code: number;
          Course_Name: string;
          Course_Code: string;
          Location: string;
        };
        admission_probability: number;
        probability_message: string;
        cet_percentile: number;
        category: string;
        cutoff: number;
      }>;
      Safety: Array<{
        college: {
          College_Name: string;
          College_Code: number;
          Course_Name: string;
          Course_Code: string;
          Location: string;
        };
        admission_probability: number;
        probability_message: string;
        cet_percentile: number;
        category: string;
        cutoff: number;
      }>;
      Round: number;
      is_payment: boolean;
      accept_payment: boolean;
    }> | null;
  };
  message: string;
}

export interface CollegeSearchByNameResponse {
  success: boolean;
  data: Array<{
    "College Name": string;
    "College Code": number;
    "Courses": Array<{
      "Course Name": string;
      "Course Code": string;
    }>;
  }>;
  message: string;
}

export interface CollegeSearchByCodeResponse {
  success: boolean;
  data: Array<{
    "College Name": string;
    "College Code": number;
    "Courses": Array<{
      "Course Name": string;
      "Course Code": string;
    }>;
  }>;
  message: string;
}

export interface CollegeSearchByChoiceCodeResponse {
  success: boolean;
  data: {
    "College Code": number;
    "Course Code": string;
    "College Name": string;
    "Course Name": string;
    "City": string;
    "District": string;
  };
  message: string;
}

// Helper function to get access token
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const integratedRecommendationApi = {
  searchCollegeByName: async (
    examType: string,
    collegeName: string
  ): Promise<CollegeSearchByNameResponse> => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/search_college_by_name/${examType}/${encodeURIComponent(collegeName)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  searchCollegeByCode: async (
    examType: string,
    collegeCode: number
  ): Promise<CollegeSearchByCodeResponse> => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/search_college_by_college_code/${examType}/${collegeCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  searchCollegeByChoiceCode: async (
    examType: string,
    choiceCode: string
  ): Promise<CollegeSearchByChoiceCodeResponse> => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/search_college_by_choice_code/${examType}/${choiceCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  generateRecommendations: async (
    data: IntegratedRoundRecommendationRequest
  ): Promise<IntegratedRecommendationResponse> => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/store/round_preferences_and_generate_recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getRoundPreferences: async (
    roundNo: number,
    examType: string
  ): Promise<RoundPreferencesResponse> => {
    const token = getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/get/round_preferences/${roundNo}/${examType}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Store round college preference
  storeRoundCollegePreference: async (data: {
    college_name: string;
    college_code: string;
    course_code: string;
    course_name: string;
    exam_type: string;
    round_no: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/common/store_round_college_preference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to store round college preference');
    }

    return response.json();
  },

  // Get round college preferences
  getRoundCollegePreferences: async (roundNo: number, examType: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/common/get_round_college_preferences/${roundNo}/${examType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get round college preferences');
    }

    return response.json();
  }
};