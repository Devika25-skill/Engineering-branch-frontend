import { config } from '@/config/env';
import {
  IntegratedConfigurationRequest,
  IntegratedConfigurationResponse,
  IntegratedAdmissionType
} from '@/types/integratedAdmission';

const API_BASE_URL = config.apiBaseUrl;

export const integratedAdmissionApi = {
  // Save configuration
  saveConfiguration: async (data: IntegratedConfigurationRequest): Promise<IntegratedConfigurationResponse> => {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/college/configuration`, {
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

  // Get configuration
  getConfiguration: async (): Promise<IntegratedConfigurationResponse> => {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/common/college/configuration`, {
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
  }
};