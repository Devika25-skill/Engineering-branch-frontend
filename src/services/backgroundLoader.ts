
import { apiService } from './api';
import { sessionStorageService } from './sessionStorage';
import { mockDataService } from './mockDataService';

class BackgroundLoaderService {
  private isLoading = false;
  private hasLoadedMockData = false;

  async loadCollegeData(): Promise<void> {
    // Load mock data immediately if not already loaded
    if (!this.hasLoadedMockData) {
      this.loadMockDataToSession();
      this.hasLoadedMockData = true;
    }

    if (this.isLoading) return;
    
    // Check if we already have valid cached real data
    const cachedColleges = sessionStorageService.getColleges();
    const cachedStats = sessionStorageService.getCollegeStats();
    
    // Check if cached data is from real API (has a specific flag)
    const cachedDataSource = sessionStorageService.getDataSource();
    if (cachedColleges && cachedStats && cachedDataSource === 'api') {
      return;
    }

    this.isLoading = true;

    try {
      // Load real colleges data
      const collegesResponse = await apiService.getColleges();
      sessionStorageService.setColleges(collegesResponse.data);
      sessionStorageService.setDataSource('api');

      // Load real college stats
      const statsResponse = await apiService.getCollegeStats();
      sessionStorageService.setCollegeStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load real API data in background:', error);
      // If API fails, ensure mock data is still available
      this.loadMockDataToSession();
    } finally {
      this.isLoading = false;
    }
  }

  private loadMockDataToSession(): void {
    try {
      const mockColleges = mockDataService.getMockColleges();
      const mockStats = mockDataService.getMockStats();
      
      sessionStorageService.setColleges(mockColleges);
      sessionStorageService.setCollegeStats(mockStats);
      sessionStorageService.setDataSource('mock');
      
    } catch (error) {
      console.error('Failed to load mock data:', error);
    }
  }

  isCurrentlyLoading(): boolean {
    return this.isLoading;
  }
}

export const backgroundLoader = new BackgroundLoaderService();
