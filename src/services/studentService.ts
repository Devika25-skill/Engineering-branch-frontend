import { config } from '@/config/env';

const API_BASE_URL = `${config.apiBaseUrl}/api/v1`;

export interface SubjectInput {
  name: string;
  marks: number;
  total: number;
}

export interface AcademicUpdatePayload {
  username: string;
  standard: string;
  subjects: SubjectInput[];
}

export interface ExtracurricularInput {
  category: string;
  title: string;
  level: string;
  description: string;
}

export interface ExtracurricularUpdatePayload {
  username: string;
  achievements: ExtracurricularInput[];
}

export const studentService = {
  fetchSubjects: async (section: string, standard?: string) => {
    let url = `${API_BASE_URL}/masters/subjects/${section}`;
    if (standard) {
      url += `?standard=${standard}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return response.json();
  },

  fetchAcademicProfile: async (username: string, standard: string) => {
    const response = await fetch(`${API_BASE_URL}/student/academic/${username}/${standard}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch academic profile');
    }
    return response.json();
  },

  saveAcademicProfile: async (payload: AcademicUpdatePayload) => {
    const response = await fetch(`${API_BASE_URL}/student/academic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save academic profile');
    }
    
    return response.json();
  },

  saveExtracurricularProfile: async (payload: ExtracurricularUpdatePayload) => {
    const response = await fetch(`${API_BASE_URL}/student/extracurricular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save extracurricular profile');
    }
    
    return response.json();
  },

  fetchExtracurricularProfile: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/student/extracurricular/${username}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch extracurricular profile');
    }
    return response.json();
  },

  deleteExtracurricularAchievement: async (username: string, category: string, achievementName: string) => {
    const response = await fetch(`${API_BASE_URL}/student/extracurricular/${username}/${category}/${achievementName}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete achievement');
    return response.json();
  },

  fetchRecommendations: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/student/recommendations/${username}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  }
};
