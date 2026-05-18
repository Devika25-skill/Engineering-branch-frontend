
# Admission Probability Calculation Documentation

## Overview
This document explains how the admission probability is calculated for students applying to engineering colleges based on their academic credentials.

## Formula Components

### Input Parameters
1. **CET Percentile** - Student's MH-CET percentile score (Primary and ONLY factor for calculation)
2. **12th Grade Percentage** - Student's HSC/12th grade percentage (Eligibility check ONLY)
3. **College Cutoff Range** - Historical cutoff data for the college
4. **College Type** - Government, Private, or Autonomous

### Calculation Logic

#### 1. Eligibility Check
The 12th standard marks are used ONLY as an eligibility criterion:

```
If 12th Percentage < 50%: Return 5% (Very Low - Not Eligible)
If 12th Percentage >= 50%: Proceed with CET-ONLY calculation
```

**Important**: The 12th marks are NOT used in the probability calculation - they serve only as a pass/fail eligibility check.

#### 2. CET-ONLY Probability Calculation
The student's CET percentile is compared against the college's historical minimum cutoff with precise probability bands based EXCLUSIVELY on CET score difference:

**Above Cutoff:**
- **CET >= Cutoff + 4 points**: 99% chance
- **CET >= Cutoff + 3 points**: 95% chance  
- **CET >= Cutoff + 2 points**: 90% chance
- **CET >= Cutoff + 1 points**: 85% chance
- **CET >= Cutoff + 0.5 points**: 80% chance
- **CET >= Cutoff + 0 points**: 75% chance

**At or Below Cutoff:**
- **CET <= Cutoff (within 0.5 points)**: 70% chance
- **CET <= Cutoff - 1 point**: 65% chance
- **CET <= Cutoff - 2 points**: 50% chance
- **CET <= Cutoff - 3 points**: 40% chance
- **CET <= Cutoff - 3+ points**: 20% chance

#### 3. College Type Adjustment
Minor adjustments based on college type to maintain band structure:

- **Government Colleges**: -3% (more competitive)
- **Private Colleges**: +2% (slightly easier admission)
- **Autonomous Colleges**: No adjustment (baseline)

#### 4. Final Probability Calculation

```javascript
function calculateAdmissionProbability(
  cetPercentile: number,
  twelfthPercentage: number,
  collegeMinCutoff: number,
  collegeMaxCutoff: number,
  collegeType: string
): number {
  // Check 12th standard eligibility ONLY
  if (twelfthPercentage < 50) {
    return 5; // Not eligible
  }
  
  // Use ONLY CET percentile for calculation
  const referenceCutoff = collegeMinCutoff;
  const difference = cetPercentile - referenceCutoff;
  
  let probability = 0;
  
  // Calculate probability based ONLY on CET difference
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
```

## Example Calculations

### Example 1: High CET Performer
- Student: CET = 95%ile, 12th = 85%
- College: Min Cutoff = 91, Type = Government
- Eligibility: 85% > 50% ✓ (Eligible)
- Difference: 95 - 91 = 4 points above cutoff
- Base probability: 99%
- Government adjustment: 99 - 3 = 96%
- **Final Probability: 96%**

### Example 2: CET Below Cutoff
- Student: CET = 87%ile, 12th = 95%
- College: Min Cutoff = 91, Type = Government
- Eligibility: 95% > 50% ✓ (Eligible)
- Difference: 87 - 91 = -4 points (more than 3 points below)
- Base probability: 20%
- Government adjustment: 20 - 3 = 17%
- **Final Probability: 17%**

### Example 3: CET Near Cutoff
- Student: CET = 91.5%ile, 12th = 60%
- College: Min Cutoff = 91, Type = Private
- Eligibility: 60% > 50% ✓ (Eligible)
- Difference: 91.5 - 91 = 0.5 points above cutoff
- Base probability: 80%
- Private adjustment: 80 + 2 = 82%
- **Final Probability: 82%**

## Key Features

1. **CET-Only Calculation**: Probability is determined exclusively by CET percentile vs college cutoff
2. **12th Marks for Eligibility Only**: 12th percentage serves only as a 50% minimum eligibility threshold
3. **Precise Probability Bands**: Clear-cut probability ranges based on exact point differences
4. **Realistic Below-Cutoff Penalties**: Students below cutoff get appropriately lower probabilities
5. **College Type Adjustments**: Minor modifications that don't disrupt core probability bands

## Factors Considered

### Primary Factor
- **CET Percentile** relative to college's minimum cutoff (ONLY factor in calculation)

### Eligibility Factor
- **12th Grade Marks** above 50% (pass/fail threshold only)

### Secondary Adjustments
- **College Type** (Government: -3%, Private: +2%, Autonomous: no change)

## Limitations
1. This calculation assumes historical cutoffs remain consistent
2. Does not account for reservation categories
3. Does not consider other factors like home state quota
4. Based on statistical probability, not guaranteed outcomes
5. Actual admission depends on seat availability and competition in specific year

## Updates and Maintenance
This formula should be reviewed annually and updated based on:
- Latest admission data and cutoff trends
- Changes in admission criteria by colleges
- Feedback from actual admission outcomes
- Analysis of CET score distribution patterns
