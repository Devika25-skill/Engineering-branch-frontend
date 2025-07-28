
import mockData from '../data/mock.json';
import type { College } from '@/types/college';

class MockDataService {
  transformMockToColleges(mockResponse: any): College[] {
    if (!mockResponse?.data?.colleges) {
      console.warn('Invalid mock data structure');
      return [];
    }

    const colleges: College[] = mockResponse.data.colleges.map((apiCollege: any) => {
      // Handle placement range safely
      const placementMin = apiCollege.placement_range?.min || null;
      const placementMax = apiCollege.placement_range?.max || null;
      const averagePlacement = (placementMin !== null && placementMax !== null && placementMax > 0) 
        ? Math.round((placementMin + placementMax) / 2) 
        : (placementMin || null);

      // Handle CET cutoff range safely
      const cetCutoffRange = (apiCollege.cet_cutoff_range?.min !== null && apiCollege.cet_cutoff_range?.max !== null) ? {
        min: apiCollege.cet_cutoff_range.min,
        max: apiCollege.cet_cutoff_range.max,
        year: new Date().getFullYear()
      } : null;

      // Ensure streams is always an array
      const streams = Array.isArray(apiCollege.courses) ? apiCollege.courses : [];

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
        placementRange: (placementMin !== null || placementMax !== null) ? {
          min: placementMin,
          max: placementMax
        } : null,
        cetCutoffRange: cetCutoffRange,
        type: 'Private' as const,
        college_type: apiCollege.college_type || 'Private',
        established: null,
        hasHostel: null,
        infrastructure_score: null,
        faculty_score: null,
        cutoff_percentile: apiCollege.cet_cutoff_range?.max || null,
        naacGrade: null,
        campusSize: null,
        totalFaculty: null
      };
    });

    return colleges;
  }

  getMockColleges(): College[] {
    try {
      return this.transformMockToColleges(mockData);
    } catch (error) {
      console.error('Error loading mock data:', error);
      return [];
    }
  }

  getMockStats() {
    const colleges = this.getMockColleges();
    const cities = [...new Set(colleges.map(c => c.city))].filter(Boolean);
    const streams = [...new Set(colleges.flatMap(c => c.streams || []))].filter(Boolean);
    const types = [...new Set(colleges.map(c => c.college_type))].filter(Boolean);
    const fees = colleges.map(c => c.fees).filter(f => f > 0);
    
    return {
      totalColleges: colleges.length,
      cities,
      streams,
      types,
      feesRange: { min: Math.min(...fees), max: Math.max(...fees) }
    };
  }
}

export const mockDataService = new MockDataService();
