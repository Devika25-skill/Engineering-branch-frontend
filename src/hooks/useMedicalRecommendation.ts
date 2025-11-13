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

    if (formData.neetPercentile < 0 || formData.neetPercentile > 100) {
      toast({
        title: "Invalid NEET Percentile",
        description: "NEET percentile must be between 0 and 100.",
        variant: "destructive"
      });
      throw new Error('Invalid NEET percentile range');
    }

    setIsGenerating(true);

    try {
      // Determine gender from reservation category
      const gender = formData.reservationCategory?.startsWith('L') ? 'F' : 'M';

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
            _10thGradeMarksPercent: formData.tenthMarks,
            _12thGradeMarksPercent: formData.twelfthMarks,
            groupingMarksPercent: formData.groupingMarks
          },
          examPercentiles: {
            NEETPercentile: formData.neetPercentile,
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
          collegeTypePreferences: formData.collegeTypes || [],
          priorityFactors: formData.priorities || []
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

        // Transform the API response to match the expected format
        const transformedRecommendations = Object.entries(response.data.recommendations).flatMap(
          ([roundKey, colleges]) => 
            colleges.map(college => ({
              college_name: college.college_name,
              college_code: college.college_code,
              city: college.city,
              program: college.program,
              college_type: college.college_type,
              round: college.round,
              gender: college.gender,
              quota: college.quota,
              closing_rank: college.closing_rank,
              admission_chance: college.admission_chance,
              recommendation_date: college.recommendation_date
            }))
        );

        // Store in session storage for quick access
        recommendationStorage.setMedicalRecommendations(transformedRecommendations, formData);

        toast({
          title: "Recommendations Generated!",
          description: `Found ${transformedRecommendations.length} medical colleges matching your profile.`,
        });

        return {
          recommendations: transformedRecommendations,
          formData,
          isPaid: response.data.is_paid
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
