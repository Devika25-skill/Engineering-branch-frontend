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
            preferredCities: formData.preferredCities && formData.preferredCities.length > 0 ? formData.preferredCities : ["ALL"]
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

      // Get the active round from sessionStorage, default to 1 if not set
      const activeRound = sessionStorage.getItem('medicalActiveRound');
      const roundNumber = (activeRound ? parseInt(activeRound.replace('round', ''), 10) : 1) as 1 | 2 | 3;
      
      // Clear ALL cached medical recommendation data before generating new ones
      // This ensures updated recommendations completely replace existing data
      sessionStorage.removeItem('cachedMedicalRound1Recommendations');
      sessionStorage.removeItem('cachedMedicalRound2Recommendations');
      sessionStorage.removeItem('cachedMedicalRound3Recommendations');
      sessionStorage.removeItem('cachedMedicalRecommendations'); // Old non-round-specific key
      sessionStorage.removeItem('medicalRecommendationPaymentData');
      localStorage.removeItem('medicalRound2Recommendations'); // Old Round 2 localStorage key
      
      // Generate recommendations for the active round
      const recommendationPayload: GenerateMedicalRecommendationsRequest = {
        round: roundNumber,
        medical_configuration_request: configPayload
      };

      // If Round 2, include the Round 1 college choice code
      if (roundNumber === 2) {
        try {
          const storedCollege = localStorage.getItem('medicalRound2SelectedCollege');
          if (storedCollege) {
            const collegeData = JSON.parse(storedCollege);
            if (collegeData?.college_code) {
              recommendationPayload.last_round_college_choice_code = collegeData.college_code;
            }
          }
        } catch (error) {
          console.error('Error retrieving Round 1 college selection:', error);
        }
      }

      const response = await apiService.generateMedicalRecommendations(recommendationPayload);

      if (response.success) {
        const token = user.accessToken;
        if (!token) {
          throw new Error('No access token available');
        }

        // Store the full API response with round-specific key
        const fullResponse = {
          Dream: response.data.Dream || [],
          Reach: response.data.Reach || [],
          Match: response.data.Match || [],
          Safety: response.data.Safety || [],
          is_payment: response.data.is_payment || false,
          accept_payment: response.data.accept_payment !== undefined ? response.data.accept_payment : true
        };

        // Cache with round-specific key
        const roundCacheKey = `cachedMedicalRound${roundNumber}Recommendations`;
        sessionStorage.setItem(roundCacheKey, JSON.stringify(fullResponse));
        
        // Also save form data
        recommendationStorage.saveFormData(formData);

      const totalCount = (fullResponse.Dream?.length || 0) +
                          (fullResponse.Reach?.length || 0) +
                          (fullResponse.Match?.length || 0) +
                          (fullResponse.Safety?.length || 0);

      toast({
        title: "Recommendations Generated!",
        description: `Found ${totalCount} medical colleges matching your profile.`,
      });

      return {
        recommendations: fullResponse,
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
