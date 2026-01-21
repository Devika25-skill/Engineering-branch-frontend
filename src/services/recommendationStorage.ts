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
  private static STORAGE_KEY = "recommendation_data";
  private static MAX_HISTORY = 10;

  // Separate storage keys for each step
  private static MEDICAL_ACADEMIC_KEY = "medical_academic_details";
  private static MEDICAL_PREFERENCES_KEY = "medical_preferences";
  private static MEDICAL_PRIORITIES_KEY = "medical_priorities";
  private static ENGINEERING_ACADEMIC_KEY = "engineering_academic_details";
  private static ENGINEERING_PREFERENCES_KEY = "engineering_preferences";
  private static ENGINEERING_PRIORITIES_KEY = "engineering_priorities";

  // Determine if current recommendation is medical
  private isMedicalRecommendation(): boolean {
    return localStorage.getItem("recommendation_type") === "First_Year_Medical";
  }

  // Save academic details
  saveAcademicDetails(data: any): void {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_ACADEMIC_KEY
        : RecommendationStorageService.ENGINEERING_ACADEMIC_KEY;
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save academic details:", error);
    }
  }

  // Get academic details
  getAcademicDetails(): any | null {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_ACADEMIC_KEY
        : RecommendationStorageService.ENGINEERING_ACADEMIC_KEY;
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to get academic details:", error);
      return null;
    }
  }

  // Save preferences
  savePreferences(data: any): void {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_PREFERENCES_KEY
        : RecommendationStorageService.ENGINEERING_PREFERENCES_KEY;
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  }

  // Get preferences
  getPreferences(): any | null {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_PREFERENCES_KEY
        : RecommendationStorageService.ENGINEERING_PREFERENCES_KEY;
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to get preferences:", error);
      return null;
    }
  }

  // Save priorities
  savePriorities(data: any): void {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_PRIORITIES_KEY
        : RecommendationStorageService.ENGINEERING_PRIORITIES_KEY;
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save priorities:", error);
    }
  }

  // Get priorities
  getPriorities(): any | null {
    try {
      const key = this.isMedicalRecommendation()
        ? RecommendationStorageService.MEDICAL_PRIORITIES_KEY
        : RecommendationStorageService.ENGINEERING_PRIORITIES_KEY;
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to get priorities:", error);
      return null;
    }
  }

  // Save complete form data (combines all steps)
  saveFormData(formData: any): void {
    try {
      const academicFields = [
        "tenthMarks",
        "twelfthMarks",
        "groupingMarks",
        "reservationCategory",
        "grouping",
        "cetPercentile",
        "jeePercentile",
        "neetPercentile",
        "neetAllIndiaRank",
        "neetRollNumber",
        "gender",
        "otherExamName",
        "otherExamPercentile",
        "sportsAchievements",
        "certifications",
        "internships",
        "otherAchievements",
      ];

      const preferencesFields = [
        "preferredStreams",
        "preferredMedicalPrograms",
        "preferredCities",
        "hostelPreference",
        "campusSetting",
        "transportFacility",
        "district",
      ];

      const prioritiesFields = [
        "maxBudget",
        "collegeTypes",
        "priorities",
        "wifiTechInfrastructure",
        "coCurricularActivities",
      ];

      // Extract and save each section separately
      const academicData: any = {};
      const preferencesData: any = {};
      const prioritiesData: any = {};

      Object.keys(formData).forEach((key) => {
        if (academicFields.includes(key)) {
          academicData[key] = formData[key];
        } else if (preferencesFields.includes(key)) {
          preferencesData[key] = formData[key];
        } else if (prioritiesFields.includes(key)) {
          prioritiesData[key] = formData[key];
        }
      });

      this.saveAcademicDetails(academicData);
      this.savePreferences(preferencesData);
      this.savePriorities(prioritiesData);
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }

  // Get complete form data (combines all steps)
  getFormData(): any | null {
    try {
      const academic = this.getAcademicDetails() || {};
      const preferences = this.getPreferences() || {};
      const priorities = this.getPriorities() || {};

      return { ...academic, ...preferences, ...priorities };
    } catch (error) {
      console.error("Failed to get form data:", error);
      return null;
    }
  }

  // Save recommendation result
  saveRecommendation(
    formData: any,
    recommendations: any[],
    recommendationId?: string
  ): void {
    try {
      const history = this.getHistory();
      const newRecommendation: StoredRecommendation = {
        id: Date.now().toString(),
        formData,
        recommendations,
        timestamp: Date.now(),
        recommendationId,
      };

      history.recommendations.unshift(newRecommendation);

      // Keep only the latest MAX_HISTORY recommendations
      if (
        history.recommendations.length >
        RecommendationStorageService.MAX_HISTORY
      ) {
        history.recommendations = history.recommendations.slice(
          0,
          RecommendationStorageService.MAX_HISTORY
        );
      }

      localStorage.setItem(
        RecommendationStorageService.STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error("Failed to save recommendation:", error);
    }
  }

  // Get recommendation history
  getHistory(): RecommendationHistory {
    try {
      const stored = localStorage.getItem(
        RecommendationStorageService.STORAGE_KEY
      );
      return stored ? JSON.parse(stored) : { recommendations: [] };
    } catch (error) {
      console.error("Failed to get recommendation history:", error);
      return { recommendations: [] };
    }
  }

  // Get specific recommendation by ID
  getRecommendationById(id: string): StoredRecommendation | null {
    const history = this.getHistory();
    return history.recommendations.find((rec) => rec.id === id) || null;
  }

  // Delete specific recommendation
  deleteRecommendation(id: string): void {
    try {
      const history = this.getHistory();
      history.recommendations = history.recommendations.filter(
        (rec) => rec.id !== id
      );
      localStorage.setItem(
        RecommendationStorageService.STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error("Failed to delete recommendation:", error);
    }
  }

  // Clear all history
  clearHistory(): void {
    try {
      localStorage.removeItem(RecommendationStorageService.STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }

  // Clear form data
  clearFormData(): void {
    try {
      sessionStorage.removeItem(
        RecommendationStorageService.MEDICAL_ACADEMIC_KEY
      );
      sessionStorage.removeItem(
        RecommendationStorageService.MEDICAL_PREFERENCES_KEY
      );
      sessionStorage.removeItem(
        RecommendationStorageService.MEDICAL_PRIORITIES_KEY
      );
      sessionStorage.removeItem(
        RecommendationStorageService.ENGINEERING_ACADEMIC_KEY
      );
      sessionStorage.removeItem(
        RecommendationStorageService.ENGINEERING_PREFERENCES_KEY
      );
      sessionStorage.removeItem(
        RecommendationStorageService.ENGINEERING_PRIORITIES_KEY
      );
    } catch (error) {
      console.error("Failed to clear form data:", error);
    }
  }

  // Medical recommendation storage methods
  setMedicalRecommendations(
    recommendations: any[],
    formData: any,
    isPaid: boolean = false,
    acceptPayment: boolean = true
  ): void {
    try {
      sessionStorage.setItem(
        "cachedMedicalRecommendations",
        JSON.stringify(recommendations)
      );
      sessionStorage.setItem(
        "medicalRecommendationPaymentData",
        JSON.stringify({
          is_payment: isPaid,
          accept_payment: acceptPayment,
        })
      );
      this.saveFormData(formData);
    } catch (error) {
      console.error("Failed to save medical recommendations:", error);
    }
  }

  getMedicalRecommendations(): any[] | null {
    try {
      const cached = sessionStorage.getItem("cachedMedicalRecommendations");
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to get medical recommendations:", error);
      return null;
    }
  }

  getMedicalPaymentData(): { is_payment: boolean; accept_payment: boolean } {
    try {
      const data = sessionStorage.getItem("medicalRecommendationPaymentData");
      return data
        ? JSON.parse(data)
        : { is_payment: false, accept_payment: true };
    } catch (error) {
      console.error("Failed to get medical payment data:", error);
      return { is_payment: false, accept_payment: true };
    }
  }

  getMedicalPaidStatus(): boolean {
    const paymentData = this.getMedicalPaymentData();
    return paymentData.is_payment;
  }

  setMedicalPaidStatus(isPaid: boolean): void {
    try {
      const currentData = this.getMedicalPaymentData();
      sessionStorage.setItem(
        "medicalRecommendationPaymentData",
        JSON.stringify({
          ...currentData,
          is_payment: isPaid,
        })
      );
    } catch (error) {
      console.error("Failed to set medical paid status:", error);
    }
  }

  clearMedicalRecommendations(): void {
    try {
      sessionStorage.removeItem("cachedMedicalRecommendations");
      sessionStorage.removeItem("medicalRecommendationPaymentData");
      sessionStorage.removeItem("cachedMedicalRound2Recommendations");
      localStorage.removeItem("medicalRound2Recommendations");
    } catch (error) {
      console.error("Failed to clear medical recommendations:", error);
    }
  }
}

export const recommendationStorage = new RecommendationStorageService();
