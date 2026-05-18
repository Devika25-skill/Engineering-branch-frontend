interface SessionStorageData {
  colleges?: any[];
  collegeStats?: any;
  dataSource?: 'mock' | 'api';
  filters?: {
    selectedCities: string[];
    selectedTypes: string[];
    selectedStreams: string[];
    feesRange: [number, number];
    searchTerm: string;
  };
  timestamp?: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'futurebridge_data';

class SessionStorageService {
  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  }

  setColleges(colleges: any[]): void {
    const existing = this.getData();
    const data: SessionStorageData = {
      ...existing,
      colleges,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getColleges(): any[] | null {
    const data = this.getData();
    if (data.colleges && data.timestamp && this.isValidCache(data.timestamp)) {
      return data.colleges;
    }
    return null;
  }

  setCollegeStats(stats: any): void {
    const existing = this.getData();
    const data: SessionStorageData = {
      ...existing,
      collegeStats: stats,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getCollegeStats(): any | null {
    const data = this.getData();
    if (data.collegeStats && data.timestamp && this.isValidCache(data.timestamp)) {
      return data.collegeStats;
    }
    return null;
  }

  setDataSource(source: 'mock' | 'api'): void {
    const existing = this.getData();
    const data: SessionStorageData = {
      ...existing,
      dataSource: source,
      timestamp: existing.timestamp || Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getDataSource(): 'mock' | 'api' | null {
    const data = this.getData();
    return data.dataSource || null;
  }

  setFilters(filters: SessionStorageData['filters']): void {
    const existing = this.getData();
    const data: SessionStorageData = {
      ...existing,
      filters,
      timestamp: existing.timestamp || Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getFilters(): SessionStorageData['filters'] | null {
    const data = this.getData();
    return data.filters || null;
  }

  clearFilters(): void {
    const existing = this.getData();
    const data: SessionStorageData = {
      ...existing,
      filters: {
        selectedCities: [],
        selectedTypes: [],
        selectedStreams: [],
        feesRange: [0, 1000000],
        searchTerm: ''
      }
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private getData(): SessionStorageData {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading from session storage:', error);
      return {};
    }
  }

  clearCache(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export const sessionStorageService = new SessionStorageService();
