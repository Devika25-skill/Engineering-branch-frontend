
import { useQuery } from '@tanstack/react-query';
import { apiService, type CollegeFilters } from '@/services/api';
import { sessionStorageService } from '@/services/sessionStorage';
import { backgroundLoader } from '@/services/backgroundLoader';

export const useColleges = (filters?: CollegeFilters) => {
  return useQuery({
    queryKey: ['colleges', filters],
    queryFn: async () => {
      
      // Always try to get from session storage first
      const cachedColleges = sessionStorageService.getColleges();
      const dataSource = sessionStorageService.getDataSource();
      
      if (cachedColleges) {
        
        // Start background loading of real data if we only have mock data
        if (dataSource === 'mock') {
          backgroundLoader.loadCollegeData().catch(console.error);
        }
        
        return cachedColleges;
      }
      
      // If no cached data, load mock data first then start API call
      await backgroundLoader.loadCollegeData();
      
      // Return cached data (should now be available)
      const freshCachedColleges = sessionStorageService.getColleges();
      if (freshCachedColleges) {
        return freshCachedColleges;
      }
      
      // Fallback to direct API call if everything else fails
      const response = await apiService.getColleges(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCollege = (id: number) => {
  return useQuery({
    queryKey: ['college', id],
    queryFn: async () => {
      const response = await apiService.getCollegeById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCollegeStats = () => {
  return useQuery({
    queryKey: ['college-stats'],
    queryFn: async () => {
      // Try session storage first
      const cachedStats = sessionStorageService.getCollegeStats();
      if (cachedStats) {
        return cachedStats;
      }
      
      // Fallback to API
      const response = await apiService.getCollegeStats();
      sessionStorageService.setCollegeStats(response.data);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};
