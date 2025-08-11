export type IntegratedAdmissionType = 'BCA_MCA_Int' | 'BBA_BMS_BBM_MBA_Int' | 'B_and_D_Pharmacy';

export interface IntegratedAdmissionFormData {
  exam_type: IntegratedAdmissionType;
  category: string;
  tenth_percentage?: number;
  twelth_percentage?: number;
  score: number; // MHT-CET marks (0-100)
}

export interface IntegratedConfigurationRequest {
  exam_type: IntegratedAdmissionType;
  score: number;
  tenth_percentage: number;
  twelth_percentage: number;
  category: string;
}

export interface IntegratedConfigurationResponse {
  success: boolean;
  data: {
    useremail: string;
    exam_type: IntegratedAdmissionType;
    score: number;
    tenth_percentage: number;
    twelth_percentage: number;
    category: string;
    timestamp: string;
  }[];
  message: string;
}

export interface IntegratedRoundPreferences {
  branches: string[];
  cities: string[];
}