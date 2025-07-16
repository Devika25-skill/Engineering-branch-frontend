interface StoredRecommendation {
  id: string;
  formData: any;
  recommendations: any[];
  timestamp: number;
  recommendationId?: string;
}

interface RecommendationHistory {
  recommendations: StoredRecommendation[];
  currentFormData?: any;
}

class RecommendationStorageService {
  private static STORAGE_KEY = 'recommendation_data';
  private static FORM_KEY = 'recommendation_form_data';
  private static MAX_HISTORY = 10;

  // Save current form data
  saveFormData(formData: any): void {
    try {
      sessionStorage.setItem(RecommendationStorageService.FORM_KEY, JSON.stringify(formData));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }

  // Get current form data
  getFormData(): any | null {
    try {
      const stored = sessionStorage.getItem(RecommendationStorageService.FORM_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get form data:', error);
      return null;
    }
  }

  // Save recommendation result
  saveRecommendation(formData: any, recommendations: any[], recommendationId?: string): void {
    try {
      const history = this.getHistory();
      const newRecommendation: StoredRecommendation = {
        id: Date.now().toString(),
        formData,
        recommendations,
        timestamp: Date.now(),
        recommendationId
      };

      history.recommendations.unshift(newRecommendation);
      
      // Keep only the latest MAX_HISTORY recommendations
      if (history.recommendations.length > RecommendationStorageService.MAX_HISTORY) {
        history.recommendations = history.recommendations.slice(0, RecommendationStorageService.MAX_HISTORY);
      }

      localStorage.setItem(RecommendationStorageService.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save recommendation:', error);
    }
  }

  // Get recommendation history
  getHistory(): RecommendationHistory {
    try {
      const stored = localStorage.getItem(RecommendationStorageService.STORAGE_KEY);
      return stored ? JSON.parse(stored) : { recommendations: [] };
    } catch (error) {
      console.error('Failed to get recommendation history:', error);
      return { recommendations: [] };
    }
  }

  // Get specific recommendation by ID
  getRecommendationById(id: string): StoredRecommendation | null {
    const history = this.getHistory();
    return history.recommendations.find(rec => rec.id === id) || null;
  }

  // Delete specific recommendation
  deleteRecommendation(id: string): void {
    try {
      const history = this.getHistory();
      history.recommendations = history.recommendations.filter(rec => rec.id !== id);
      localStorage.setItem(RecommendationStorageService.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to delete recommendation:', error);
    }
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(RecommendationStorageService.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }

  // Clear form data
  clearFormData(): void {
    try {
      sessionStorage.removeItem(RecommendationStorageService.FORM_KEY);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }
}

export const recommendationStorage = new RecommendationStorageService();
