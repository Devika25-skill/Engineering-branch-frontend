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

export const integratedRecommendationApi = {
  generateRecommendations: async (
    data: IntegratedRoundRecommendationRequest
  ): Promise<IntegratedRecommendationResponse> => {
    const token = localStorage.getItem('accessToken');
    
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
  }
};