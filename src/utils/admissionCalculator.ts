
export interface AdmissionChancesInput {
  cetPercentile: number;
  twelfthPercentage: number;
  collegeMinCutoff: number;
  collegeMaxCutoff: number;
  collegeType: 'Government' | 'Private' | 'Autonomous';
}

export function calculateAdmissionProbability(input: AdmissionChancesInput): number {
  const { cetPercentile, twelfthPercentage, collegeMinCutoff, collegeType } = input;
  
  // Check 12th standard eligibility (must be above 50%)
  if (twelfthPercentage < 50) {
    return 5; // Very low chances if not eligible
  }
  
  // Use ONLY CET percentile for probability calculation
  const referenceCutoff = collegeMinCutoff || 50; // Default cutoff if not available
  const difference = cetPercentile - referenceCutoff;
  
  let probability = 0;
  
  // Apply the precise formula based ONLY on difference from CET cutoff
  if (difference >= 4) {
    probability = 99;
  } else if (difference >= 3) {
    probability = 95;
  } else if (difference >= 2) {
    probability = 90;
  } else if (difference >= 1) {
    probability = 85;
  } else if (difference >= 0.5) {
    probability = 80;
  } else if (difference >= 0) {
    probability = 75;
  } else if (difference >= -0.5) {
    probability = 70;
  } else if (difference >= -1) {
    probability = 65;
  } else if (difference >= -2) {
    probability = 50;
  } else if (difference >= -3) {
    probability = 40;
  } else {
    probability = 20;
  }
  
  // Apply college type adjustment
  if (collegeType === 'Government') {
    probability = Math.max(5, probability - 3);
  } else if (collegeType === 'Private') {
    probability = Math.min(99, probability + 2);
  }
  
  return Math.max(5, Math.min(99, Math.round(probability)));
}

export function getAdmissionChanceColor(probability: number): string {
  if (probability >= 80) return 'text-green-600';
  if (probability >= 60) return 'text-blue-600';
  if (probability >= 40) return 'text-yellow-600';
  if (probability >= 20) return 'text-orange-600';
  return 'text-red-600';
}

export function getAdmissionChanceLabel(probability: number): string {
  if (probability >= 80) return 'Very High';
  if (probability >= 60) return 'High';
  if (probability >= 40) return 'Moderate';
  if (probability >= 20) return 'Low';
  return 'Very Low';
}
