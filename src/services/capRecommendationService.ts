import { apiService, FetchAICapDetailsResponse, RecommendationRequest } from './api';

interface FormData {
  tenthMarks?: number;
  educationType?: string;
  reservationCategory?: string;
  twelfthMarks?: number;
  grouping?: string;
  groupingMarks?: number;
  preferredStreams?: string[];
  preferredCities?: string[];
  maxBudget?: number;
  cetPercentile?: number;
  jeePercentile?: number;
  otherExamName?: string;
  otherExamPercentile?: number;
  sportsAchievements?: string;
  certifications?: string;
  internships?: string;
  otherAchievements?: string;
  hostelPreference?: string;
  campusSetting?: string;
  transportFacility?: string;
  wifiTechInfrastructure?: string;
  coCurricularActivities?: string;
  collegeTypes?: string[];
  priorities?: string[];
}

export const transformApiDataToFormData = (apiData: NonNullable<FetchAICapDetailsResponse['data']>): FormData => {
  const { academic_credentials } = apiData;
  
  return {
    tenthMarks: academic_credentials.academicMarks._10thGradeMarksPercent,
    educationType: academic_credentials.educationBackground.educationType,
    reservationCategory: academic_credentials.reservationCategory,
    twelfthMarks: academic_credentials.academicMarks._12thGradeMarksPercent,
    grouping: academic_credentials.educationBackground.stream,
    groupingMarks: academic_credentials.academicMarks.groupingMarksPercent,
    preferredStreams: academic_credentials.preferences.engineeringBranches,
    preferredCities: academic_credentials.preferences.preferredCities,
    maxBudget: academic_credentials.annualBudget,
    cetPercentile: academic_credentials.examPercentiles.CET,
    jeePercentile: academic_credentials.examPercentiles.JEE,
    sportsAchievements: academic_credentials.achievementsExperience.sportsAchievements || '',
    certifications: academic_credentials.achievementsExperience.certifications || '',
    internships: academic_credentials.achievementsExperience.internshipsWorkExperience || '',
    otherAchievements: academic_credentials.achievementsExperience.otherAchievements || '',
    hostelPreference: academic_credentials.campusFacilitiesEnvironment.hostelFacility,
    campusSetting: academic_credentials.campusFacilitiesEnvironment.campusSetting,
    transportFacility: academic_credentials.campusFacilitiesEnvironment.transportFacility,
    wifiTechInfrastructure: academic_credentials.campusFacilitiesEnvironment.wifiTechInfrastructure,
    coCurricularActivities: academic_credentials.campusFacilitiesEnvironment.coCurricularActivities,
    collegeTypes: academic_credentials.collegeTypePreferences,
    priorities: academic_credentials.priorityFactors,
  };
};

export const capRecommendationService = {
  async fetchUserFormDataAndRecommendations() {
    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      // Step 1: Fetch AI CAP details
      console.log('🔍 Fetching AI CAP details...');
      const capResponse = await apiService.fetchAICapDetails(accessToken);

      if (!capResponse.success || !capResponse.data) {
        console.log('❌ No recommendation data found for user');
        return { success: false, error: 'NO_DATA', message: 'No previous recommendations found' };
      }

      console.log('✅ AI CAP details fetched successfully');
      const apiData = capResponse.data;
      
      // Transform API data to form data format
      const formData = transformApiDataToFormData(apiData);

      // Step 2: Generate recommendation request payload
      const recommendationPayload: RecommendationRequest = {
        category: formData.reservationCategory || 'GOPENS',
        cet_percentile: formData.cetPercentile || 0,
        cet_course: formData.preferredStreams || [],
        location: formData.preferredCities || [],
      };

      // Step 3: Fetch college recommendations
      console.log('🔍 Fetching college recommendations...');
      const recommendationsResponse = await apiService.getRecommendations(recommendationPayload, accessToken);

      if (!recommendationsResponse.success) {
        throw new Error('Failed to fetch recommendations');
      }

      console.log('✅ College recommendations fetched successfully');

      // Transform recommendations to match the expected format
      const allRecommendations = [
        ...(recommendationsResponse.data.Dream || []).map(item => ({ ...item, category: 'Dream' })),
        ...(recommendationsResponse.data.Reach || []).map(item => ({ ...item, category: 'Reach' })),
        ...(recommendationsResponse.data.Match || []).map(item => ({ ...item, category: 'Match' })),
        ...(recommendationsResponse.data.Safety || []).map(item => ({ ...item, category: 'Safety' })),
      ];

      // Cache the data in session storage
      sessionStorage.setItem('cachedRecommendations', JSON.stringify(allRecommendations));
      sessionStorage.setItem('recommendationFormData', JSON.stringify(formData));

      return {
        success: true,
        formData,
        recommendations: allRecommendations,
        message: 'Data fetched successfully'
      };

    } catch (error) {
      console.error('❌ Error in capRecommendationService:', error);
      return {
        success: false,
        error: 'API_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  async checkAndFetchData() {
    // Check if we have cached data
    const cachedRecommendations = sessionStorage.getItem('cachedRecommendations');
    const storedFormData = sessionStorage.getItem('recommendationFormData');
    
    if (cachedRecommendations && storedFormData) {
      console.log('✅ Using cached recommendation data');
      return {
        success: true,
        formData: JSON.parse(storedFormData),
        recommendations: JSON.parse(cachedRecommendations),
        fromCache: true
      };
    }

    // If no cached data, fetch from API
    return await this.fetchUserFormDataAndRecommendations();
  }
};