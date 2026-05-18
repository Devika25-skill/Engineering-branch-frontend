
import { apiService } from "@/services/api";
import { categoryMapping } from "./CategoryMapping";

export interface CalculationPayload {
  sj_institute_id: number;
  course_name: string;
  cet_percentile: number;
  category: string;
}

export const validateInputs = (cetScore: number, selectedStream: string) => {
  if (isNaN(cetScore) || cetScore < 0 || cetScore > 100) {
    return { isValid: false, error: "Please enter a valid CET percentile between 0 and 100" };
  }

  if (!selectedStream) {
    return { isValid: false, error: "Please select a branch/stream" };
  }

  return { isValid: true, error: null };
};

export const performCalculation = async (payload: CalculationPayload) => {
  try {
    const response = await apiService.calculateAdmissionChances(payload);
    
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      throw new Error(response?.detail || 'Failed to calculate admission chances');
    }
  } catch (error: any) {
    console.error('Error calculating admission chances:', error);
    
    // Extract detail from error response
    const errorDetail = error.response?.data?.detail || error.message || 'Unable to calculate admission chances. Please try again.';
    
    // Handle different status codes
    if (error.response?.status === 400) {
      return { 
        success: false, 
        error: errorDetail,
        type: 'category_unavailable'
      };
    } else {
      return { 
        success: false, 
        error: errorDetail,
        type: 'general_error'
      };
    }
  }
};
