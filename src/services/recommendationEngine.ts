import { College } from '@/types/college';

export interface StudentProfile {
  // Academic Information
  educationType: "12th" | "Diploma";
  grouping?: string;
  diplomaStream?: string;
  tenthMarks?: number;
  twelfthMarks?: number;
  diplomaMarks?: number;
  groupingMarks?: number;
  cetPercentile?: number;
  jeePercentile?: number;
  otherExamName?: string;
  otherExamPercentile?: number;
  reservationCategory?: string;
  sportsAchievements?: string;
  certifications?: string;
  internships?: string;
  otherAchievements?: string;
  
  // Preferences
  preferredStreams: string[];
  preferredCities: string[];
  hostelFacility?: string;
  campusSetting?: string;
  transportFacility?: string;
  wifiFacility?: string;
  coCurricular?: string;
  
  // Priorities
  budget: number;
  collegeTypes: string[];
  priorityFactors: string[];
}

export interface CollegeRecommendation {
  college: College;
  matchPercentage: number;
  matchReasons: string[];
  eligibilityStatus: 'Highly Likely' | 'Likely' | 'Possible' | 'Reach';
}

export interface RecommendationConfig {
  weights: {
    academicEligibility: number;
    streamMatch: number;
    locationMatch: number;
    collegeQuality: number;
    affordability: number;
  };
  priorityBonuses: {
    highRating: number;
    excellentPlacement: number;
    governmentCollege: number;
    topPerformer: number;
  };
  eligibilityBuffer: number;
}

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  weights: {
    academicEligibility: 40,
    streamMatch: 25,
    locationMatch: 10,
    collegeQuality: 20,
    affordability: 5
  },
  priorityBonuses: {
    highRating: 10,
    excellentPlacement: 8,
    governmentCollege: 5,
    topPerformer: 15
  },
  eligibilityBuffer: 2
};

// Improved scoring functions with better prioritization for high scorers
const calculateAcademicScore = (college: College, profile: StudentProfile): number => {
  let studentScore = 0;
  
  // Calculate student's best academic performance
  if (profile.educationType === '12th') {
    const baseMarks = profile.twelfthMarks || 0;
    const groupingMarks = profile.groupingMarks || baseMarks;
    studentScore = Math.max(baseMarks, groupingMarks);
  } else if (profile.educationType === 'Diploma') {
    studentScore = profile.diplomaMarks || 0;
  }
  
  // Prioritize entrance exam scores (more reliable predictors)
  if (profile.cetPercentile) {
    studentScore = Math.max(studentScore, profile.cetPercentile);
  }
  if (profile.jeePercentile) {
    studentScore = Math.max(studentScore, profile.jeePercentile);
  }
  if (profile.otherExamPercentile) {
    studentScore = Math.max(studentScore, profile.otherExamPercentile);
  }
  
  // Calculate college requirements with better range handling
  const collegeThreshold = college.cetCutoffRange?.max || 
                          college.cutoff_percentile || 
                          Math.max(50, college.rating * 12);
  
  const collegeMinThreshold = college.cetCutoffRange?.min || collegeThreshold - 10;
  
  // Improved scoring logic - heavily favor high scorers
  const scoreDiff = studentScore - collegeThreshold;
  
  if (scoreDiff >= 15) return 98; // Excellent overqualified candidate
  if (scoreDiff >= 10) return 95; // Very strong candidate
  if (scoreDiff >= 5) return 90;  // Strong candidate
  if (scoreDiff >= 0) return 85;  // Good fit
  if (scoreDiff >= -3) return 75; // Borderline good
  if (scoreDiff >= -5) return 65; // Possible
  if (scoreDiff >= -8) return 50; // Reach but possible
  if (scoreDiff >= -12) return 35; // Long reach
  return 20; // Very unlikely
};

const calculateStreamScore = (college: College, profile: StudentProfile): number => {
  if (!profile.preferredStreams || profile.preferredStreams.length === 0) return 70;
  
  const hasPreferredStream = profile.preferredStreams.some(stream => 
    college.streams.some(collegeStream => 
      collegeStream.toLowerCase().includes(stream.toLowerCase()) ||
      stream.toLowerCase().includes(collegeStream.toLowerCase())
    )
  );
  
  return hasPreferredStream ? 95 : 20;
};

const calculateLocationScore = (college: College, profile: StudentProfile): number => {
  if (!profile.preferredCities || profile.preferredCities.length === 0) return 70;
  
  const matchesLocation = profile.preferredCities.some(city => 
    college.city.toLowerCase().includes(city.toLowerCase()) ||
    city.toLowerCase().includes(college.city.toLowerCase())
  );
  
  return matchesLocation ? 90 : 30;
};

const calculateBudgetScore = (college: College, profile: StudentProfile): number => {
  const collegeFees = college.feesRange ? college.feesRange.min : college.fees;
  const userBudget = profile.budget || 500000;
  
  if (collegeFees <= userBudget * 0.8) return 95;
  if (collegeFees <= userBudget) return 80;
  if (collegeFees <= userBudget * 1.2) return 60;
  if (collegeFees <= userBudget * 1.5) return 40;
  return 20;
};

const calculateTypeScore = (college: College, profile: StudentProfile): number => {
  if (!profile.collegeTypes || profile.collegeTypes.length === 0) return 70;
  
  const matchesType = profile.collegeTypes.includes(college.type);
  return matchesType ? 85 : 50;
};

const calculateQualityScore = (college: College, studentProfile: StudentProfile): number => {
  let score = 40;
  
  // Rating contribution (stronger weight for high performers)
  const ratingBonus = (college.rating - 3) * 12;
  score += ratingBonus;
  
  // Placement contribution (more important for quality assessment)
  const placementBonus = Math.max(0, (college.placement - 60) * 0.5);
  score += placementBonus;
  
  // Infrastructure and faculty scores
  if (college.infrastructure_score) {
    score += (college.infrastructure_score / 10) * 3;
  }
  if (college.faculty_score) {
    score += (college.faculty_score / 10) * 3;
  }
  
  // Bonus for high-performing students getting quality colleges
  const studentScore = Math.max(
    studentProfile.cetPercentile || 0,
    studentProfile.jeePercentile || 0,
    studentProfile.twelfthMarks || 0,
    studentProfile.groupingMarks || 0
  );
  
  if (studentScore >= 95 && college.rating >= 4.5) {
    score += 15; // High performer bonus for top colleges
  } else if (studentScore >= 90 && college.rating >= 4.0) {
    score += 10; // Good performer bonus
  }
  
  return Math.min(100, Math.max(20, score));
};

const getEligibilityStatus = (academicScore: number): 'Highly Likely' | 'Likely' | 'Possible' | 'Reach' => {
  if (academicScore >= 80) return 'Highly Likely';
  if (academicScore >= 65) return 'Likely';
  if (academicScore >= 45) return 'Possible';
  return 'Reach';
};

const generateMatchReasons = (
  college: College, 
  scores: { [key: string]: number },
  profile: StudentProfile
): string[] => {
  const reasons: string[] = [];
  
  if (scores.academic >= 80) {
    reasons.push("Excellent academic match for your credentials");
  } else if (scores.academic >= 60) {
    reasons.push("Good academic fit based on your profile");
  }
  
  if (scores.stream >= 90) {
    reasons.push("Offers your preferred engineering streams");
  }
  
  if (scores.location >= 85) {
    reasons.push("Located in your preferred city");
  }
  
  if (scores.budget >= 80) {
    reasons.push("Fits well within your budget");
  }
  
  if (college.placement >= 80) {
    reasons.push(`Outstanding placement record (${college.placement}%)`);
  }
  
  if (college.rating >= 4.5) {
    reasons.push("Highly rated institution");
  }
  
  if (college.type === 'Government' && scores.budget >= 90) {
    reasons.push("Government college with affordable fees");
  }
  
  return reasons.length > 0 ? reasons : ["Matches your basic requirements"];
};

export const generateRecommendations = (
  colleges: College[],
  studentProfile: StudentProfile
): CollegeRecommendation[] => {

  const recommendations: CollegeRecommendation[] = [];
  
  // Get student's best score for better matching
  const studentBestScore = Math.max(
    studentProfile.cetPercentile || 0,
    studentProfile.jeePercentile || 0,
    studentProfile.twelfthMarks || 0,
    studentProfile.groupingMarks || 0,
    studentProfile.diplomaMarks || 0
  );
  
  for (const college of colleges) {
    // Calculate individual scores
    const academicScore = calculateAcademicScore(college, studentProfile);
    const streamScore = calculateStreamScore(college, studentProfile);
    const locationScore = calculateLocationScore(college, studentProfile);
    const budgetScore = calculateBudgetScore(college, studentProfile);
    const typeScore = calculateTypeScore(college, studentProfile);
    const qualityScore = calculateQualityScore(college, studentProfile);
    
    const scores = {
      academic: academicScore,
      stream: streamScore,
      location: locationScore,
      budget: budgetScore,
      type: typeScore,
      quality: qualityScore
    };
    
    // Enhanced weighted calculation - more emphasis on academic fit and quality for high scorers
    let academicWeight = 0.35; // Base academic weight
    let qualityWeight = 0.20;  // Base quality weight
    
    // Increase quality weight for high performers
    if (studentBestScore >= 95) {
      academicWeight = 0.30;
      qualityWeight = 0.30;
    } else if (studentBestScore >= 90) {
      academicWeight = 0.32;
      qualityWeight = 0.25;
    }
    
    const matchPercentage = (
      academicScore * academicWeight +
      streamScore * 0.20 +
      locationScore * 0.10 +
      budgetScore * 0.10 +
      typeScore * 0.05 +
      qualityScore * qualityWeight
    );
    
    // Higher threshold for inclusion - focus on relevant matches
    if (matchPercentage >= 40) {
      const eligibilityStatus = getEligibilityStatus(academicScore);
      const matchReasons = generateMatchReasons(college, scores, studentProfile);
      
      recommendations.push({
        college,
        matchPercentage: Math.round(matchPercentage),
        matchReasons,
        eligibilityStatus
      });
    }
  }
  
  
  // Enhanced sorting - prioritize academic fit and college quality for high scorers
  return recommendations
    .sort((a, b) => {
      // First sort by match percentage
      if (Math.abs(b.matchPercentage - a.matchPercentage) >= 5) {
        return b.matchPercentage - a.matchPercentage;
      }
      // If match percentages are close, prioritize higher rated colleges
      if (Math.abs(b.college.rating - a.college.rating) >= 0.2) {
        return b.college.rating - a.college.rating;
      }
      // Finally, prioritize better placement rates
      return b.college.placement - a.college.placement;
    })
    .slice(0, 20);
};

// Export the recommendation engine object
export const recommendationEngine = {
  generateRecommendations,
  updateConfig: (config: RecommendationConfig) => {
  }
};
