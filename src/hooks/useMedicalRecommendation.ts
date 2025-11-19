import { useState } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { recommendationStorage } from '@/services/recommendationStorage';
import type { StoreMedicalConfigRequest, GenerateMedicalRecommendationsRequest } from '@/types/medical';

export const useMedicalRecommendation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const generateMedicalRecommendation = async (formData: any) => {
    if (!isLoggedIn || !user) {
      throw new Error('User must be logged in to generate recommendations');
    }

    // Validate mandatory fields
    const requiredFields = [
      'tenthMarks', 'reservationCategory', 'twelfthMarks', 'grouping', 'groupingMarks',
      'neetPercentile', 'neetAllIndiaRank', 'neetRollNumber', 'preferredMedicalPrograms', 'maxBudget'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Information",
        description: "Please fill in all required fields before generating recommendations.",
        variant: "destructive"
      });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate NEET Percentile (0-100, max 2 decimal places)
    if (formData.neetPercentile < 0 || formData.neetPercentile > 100) {
      toast({
        title: "Invalid NEET Percentile",
        description: "NEET percentile must be between 0 and 100.",
        variant: "destructive"
      });
      throw new Error('Invalid NEET percentile range');
    }

    // Validate NEET All India Rank (>= 1)
    if (formData.neetAllIndiaRank < 1) {
      toast({
        title: "Invalid NEET Rank",
        description: "NEET All India Rank must be at least 1.",
        variant: "destructive"
      });
      throw new Error('Invalid NEET rank');
    }

    // Validate NEET Roll Number (10 digits)
    if (formData.neetRollNumber < 1000000000 || formData.neetRollNumber > 9999999999) {
      toast({
        title: "Invalid NEET Roll Number",
        description: "NEET Roll Number must be a 10-digit number.",
        variant: "destructive"
      });
      throw new Error('Invalid NEET roll number');
    }

    // Validate Annual Budget (>= 0)
    if (formData.maxBudget < 0) {
      toast({
        title: "Invalid Budget",
        description: "Annual Budget must be a positive number.",
        variant: "destructive"
      });
      throw new Error('Invalid annual budget');
    }

    setIsGenerating(true);

    try {
      // Use gender from form data
      const gender = formData.gender || 'M';

      // Create medical configuration request
      const configPayload: StoreMedicalConfigRequest = {
        username: user.email,
        gender,
        academic_credentials: {
          educationBackground: {
            educationType: '12th',
            stream: formData.grouping
          },
          academicMarks: {
            _10thGradeMarksPercent: Number(formData.tenthMarks.toFixed(2)),
            _12thGradeMarksPercent: Number(formData.twelfthMarks.toFixed(2)),
            groupingMarksPercent: Number(formData.groupingMarks.toFixed(2))
          },
          examPercentiles: {
            NEETPercentile: Number(formData.neetPercentile.toFixed(2)),
            NEETAllIndiaRank: formData.neetAllIndiaRank,
            NEETRollNumber: formData.neetRollNumber,
            otherEntranceExam: formData.otherExamName && formData.otherExamPercentile ? [{
              examName: formData.otherExamName,
              percentileOrScore: Number(formData.otherExamPercentile)
            }] : undefined
          },
          reservationCategory: formData.reservationCategory,
          achievementsExperience: {
            sportsAchievements: formData.sportsAchievements,
            certifications: formData.certifications,
            internshipsWorkExperience: formData.internships,
            otherAchievements: formData.otherAchievements
          },
          preferences: {
            medicalPrograms: formData.preferredMedicalPrograms || [],
            preferredCities: formData.preferredCities || []
          },
          campusFacilitiesEnvironment: {
            hostelFacility: formData.hostelPreference,
            campusSetting: formData.campusSetting,
            transportFacility: formData.transportFacility
          },
          annualBudget: formData.maxBudget,
          collegeTypePreferences: formData.collegeTypes || ["ALL"],
          priorityFactors: formData.priorities || ["ALL"]
        }
      };

      // Store medical configuration
      const configResponse = await apiService.storeMedicalConfiguration(configPayload);

      if (!configResponse.success) {
        throw new Error('Failed to store medical configuration');
      }

      // Generate recommendations for Round 1
      const recommendationPayload: GenerateMedicalRecommendationsRequest = {
        round: 1,
        medical_configuration_request: configPayload
      };

      const response = await apiService.generateMedicalRecommendations(recommendationPayload);

      if (response.success) {
        const token = user.accessToken;
        if (!token) {
          throw new Error('No access token available');
        }

        // Transform the API response to categorized format
        const categorizedRecommendations = {
          Dream: response.data.Dream || [],
          Reach: response.data.Reach || [],
          Match: response.data.Match || [],
          Safety: response.data.Safety || []
        };

        // Store in session storage for quick access
        recommendationStorage.setMedicalRecommendations(categorizedRecommendations as any, formData, response.data.is_payment || false);

      const totalCount = (categorizedRecommendations.Dream?.length || 0) +
                          (categorizedRecommendations.Reach?.length || 0) +
                          (categorizedRecommendations.Match?.length || 0) +
                          (categorizedRecommendations.Safety?.length || 0);

      toast({
        title: "Recommendations Generated!",
        description: `Found ${totalCount} medical colleges matching your profile.`,
      });

      return {
        recommendations: categorizedRecommendations,
        formData,
        isPaid: response.data.is_payment
      };
      } else {
        throw new Error(response.message || 'Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error generating medical recommendations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMedicalRecommendation,
    isGenerating,
    isLoggedIn
  };
};
