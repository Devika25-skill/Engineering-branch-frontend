
import { useState } from 'react';
import { apiService, type GenerateRecommendationRequest } from '@/services/api';
import { type CollegeRecommendation } from '@/services/cutoffService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { recommendationStorage } from '@/services/recommendationStorage';
import { useMedicalRecommendation } from './useMedicalRecommendation';

export const useRecommendation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { generateMedicalRecommendation } = useMedicalRecommendation();

  const generateRecommendation = async (formData: any) => {
    const recommendationType = localStorage.getItem('recommendation_type');
    
    // Route to medical recommendations if it's a medical program
    if (recommendationType === 'First_Year_Medical') {
      const result = await generateMedicalRecommendation(formData);
      return {
        recommendations: result.recommendations,
        formData: result.formData,
        success: true
      };
    }
    if (!isLoggedIn || !user) {
      throw new Error('User must be logged in to generate recommendations');
    }

    // Validate mandatory fields - removed 'preferredCities' as it's now optional
    const requiredFields = [
      'tenthMarks', 'reservationCategory', 'twelfthMarks', 'grouping', 'groupingMarks',
      'cetPercentile', 'preferredStreams', 'maxBudget'
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

    if (formData.cetPercentile < 0 || formData.cetPercentile > 100) {
      toast({
        title: "Invalid CET Percentile",
        description: "CET percentile must be between 0 and 100.",
        variant: "destructive"
      });
      throw new Error('Invalid CET percentile range');
    }

    setIsGenerating(true);

    try {
      // Create recommendation record
      const payload: GenerateRecommendationRequest = {
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
            CET: formData.cetPercentile,
            JEE: formData.jeePercentile && formData.jeePercentile !== '' ? Number(formData.jeePercentile) : undefined,
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
            engineeringBranches: formData.preferredStreams || [],
            preferredCities: formData.preferredCities || []
          },
          campusFacilitiesEnvironment: {
            hostelFacility: formData.hostelPreference,
            campusSetting: formData.campusSetting,
            transportFacility: formData.transportFacility,
            wifiTechInfrastructure: formData.wifiTechInfrastructure,
            coCurricularActivities: formData.coCurricularActivities
          },
          annualBudget: formData.maxBudget,
          collegeTypePreferences: formData.collegeTypes || [],
          priorityFactors: formData.priorities || []
        },
        username: user.email
      };

      const response = await apiService.generateRecommendation(payload);

      if (response.success) {

        const token = user.accessToken;
        if (!token) {
          throw new Error('No access token available');
        }


        const recommendationPayload = {
          category: formData.reservationCategory,
          cet_percentile: formData.cetPercentile,
          cet_course: formData.preferredStreams || [],
          location: formData.preferredCities || []
        };

        const recommendationsResponse = await apiService.getRecommendations(recommendationPayload, token);



        if (recommendationsResponse.success) {

          if (!recommendationsResponse.data.accept_payment || recommendationsResponse.data.is_payment) {
            localStorage.setItem('recommendationUnlocked', "true");
          }
          const allRecommendations: CollegeRecommendation[] = [];
          const categories = ['Dream', 'Reach', 'Match', 'Safety'] as const;

          categories.forEach((categoryName) => {
            const categoryData = recommendationsResponse.data[categoryName];

            if (Array.isArray(categoryData)) {
              categoryData.forEach((item: any, index: number) => {

                const recommendation: CollegeRecommendation = {
                  college: {
                    id: item.college.SJ_Institute_Code,
                    name: item.college.College_Name,
                    logo: item.college.College_Logo || null,
                    city: item.college.City,
                    type: item.college.College_Type || 'Private',
                    rating: item.college.College_Reviews_out_of_5 || null,
                    fees: item.college["Annual_Fees_(INR)"] || null,
                    placement: item.college.Overall_College_Placement_Percentage || null,
                    Student_Intake: item.college.Student_Intake || null,
                    College_Website: item.college.College_Website || null,
                    College_Hostel_Available: item.college.College_Hostel_Available || 'No',
                    College_Bus_Facility_Available: item.college.College_Bus_Facility_Available || 'No',
                    Sports_Facilities: item.college.Sports_Facilities || null,
                    Lab_Facilities: item.college.Lab_Facilities || null,
                    Top_Recruiters: item.college.Top_Recruiters || []
                  },
                  course_name: item.course,
                  category: categoryName,
                  admission_probability: item.admission_probability,
                  probability_message: item.probability_message,
                  cutoff_percentile: item.cutoff,
                  match_reasons: [
                    'Based on your CET percentile and category',
                    'Matches your preferred location',
                    'Offers your preferred course',
                    'Within your specified criteria'
                  ]
                };

                allRecommendations.push(recommendation);
              });
            }
          });


          if (allRecommendations.length > 0) {
            // Save to localStorage and sessionStorage
            recommendationStorage.saveRecommendation(
              formData,
              allRecommendations,
              response.data.recommendation_id
            );

            // Store in sessionStorage for immediate access
            sessionStorage.setItem('recommendationFormData', JSON.stringify(formData));
            sessionStorage.setItem('cachedRecommendations', JSON.stringify(allRecommendations));

            

            return {
              ...response.data,
              recommendations: allRecommendations,
              success: true
            };
          } else {
           

            return {
              ...response.data,
              recommendations: [],
              success: false
            };
          }
        } else {
          throw new Error(recommendationsResponse.message || 'Failed to fetch recommendations from college-list API');
        }
      } else {
        throw new Error(response.message || 'Failed to generate recommendation');
      }
    } catch (error: any) {
      console.error('❌ Error generating recommendation:', error);

      toast({
        title: "Failed to Generate Recommendation",
        description: error.message || 'Unable to generate AI recommendation. Please try again.',
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateRecommendation,
    isGenerating,
    isLoggedIn
  };
};
