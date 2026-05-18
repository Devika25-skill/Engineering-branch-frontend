
# AI Recommendation Engine Documentation

## Overview
The SkillJourney FutureBridge recommendation engine uses advanced algorithms to match students with engineering colleges based on their academic profile, preferences, and priorities. The system ensures that high-performing students are matched with appropriate colleges that align with their credentials.

## Student Profile Components

### 1. Academic Performance
- **Education Type**: 12th Grade or Diploma
- **Grouping**: PCM, PCB, PCMB (for 12th grade students)
- **Marks**: 12th Grade marks, Grouping marks, or Diploma marks
- **Entrance Scores**: CET, JEE, or other entrance exam scores

### 2. Preferences
- **Preferred Cities**: List of cities where student wants to study
- **Preferred Streams**: Engineering branches of interest
- **Budget Range**: Minimum and maximum fee tolerance
- **College Type**: Government, Private, or Autonomous preference
- **Hostel Requirement**: Whether hostel accommodation is needed

### 3. Priorities (Weighted by Student)
- **Academic Excellence**: Importance of college's academic reputation
- **Placement Record**: Weight given to placement statistics
- **Location Preference**: Importance of studying in preferred cities
- **Fee Affordability**: Priority given to cost considerations
- **Facility Quality**: Importance of infrastructure and amenities

## Scoring Algorithm

### Academic Score Calculation (Most Critical)
The academic score determines if a student is eligible and how well they match a college's academic standards.

```typescript
calculateAcademicScore(college: College, profile: StudentProfile): number {
  // Student's academic score
  let studentScore = Math.max(
    profile.twelfthMarks || 0,
    profile.groupingMarks || 0,
    profile.diplomaMarks || 0,
    profile.entranceScore || 0
  );
  
  // College's cutoff threshold
  let collegeThreshold = college.cutoff_percentile || 
                        college.cetCutoffRange?.min || 
                        (college.rating * 15);
  
  // Scoring logic
  if (studentScore >= collegeThreshold + 10) return 95; // Excellent fit
  if (studentScore >= collegeThreshold) return 85;      // Good fit
  if (studentScore >= collegeThreshold - 5) return 70;  // Moderate fit
  if (studentScore >= collegeThreshold - 10) return 50; // Reach
  return 20; // Poor fit
}
```

### Placement Score Calculation
Evaluates college's placement performance:
- 90%+ placement rate: 95 points
- 80-89% placement rate: 85 points
- 70-79% placement rate: 75 points
- 60-69% placement rate: 65 points
- 50-59% placement rate: 55 points
- Below 50%: 30 points

### Location Score Calculation
Matches student's city preferences:
- Preferred city: 95 points
- Non-preferred city: 40 points
- No preference specified: 80 points (neutral)

### Fee Score Calculation
Evaluates affordability within student's budget:
```typescript
calculateFeeScore(college: College, profile: StudentProfile): number {
  const [minBudget, maxBudget] = profile.preferences.budgetRange;
  const collegeFees = college.fees;
  
  if (collegeFees <= maxBudget) {
    // Within budget - better score for lower fees
    const budgetUtilization = collegeFees / maxBudget;
    return Math.max(60, 100 - (budgetUtilization * 40));
  } else {
    // Over budget - heavy penalty
    const overBudget = (collegeFees - maxBudget) / maxBudget;
    return Math.max(10, 50 - (overBudget * 30));
  }
}
```

### Stream Matching Score
Checks if college offers preferred engineering branches:
- Offers preferred stream: 95 points
- Doesn't offer preferred stream: 30 points
- No stream preference: 80 points

### College Type Score
Matches student's institutional preference:
- Preferred type (Govt/Private/Autonomous): 90 points
- Non-preferred type: 50 points
- No preference: 80 points

### Facility Score Calculation
Evaluates infrastructure and amenities:
```typescript
calculateFacilityScore(college: College, profile: StudentProfile): number {
  let score = 50; // Base score
  
  score += (college.rating - 3) * 10;           // Rating contribution
  score += (college.infrastructure_score / 10) * 15; // Infrastructure
  score += (college.faculty_score / 10) * 15;   // Faculty quality
  
  // Hostel requirement bonus/penalty
  if (profile.preferences.hostelRequired) {
    score += college.hasHostel ? 10 : -20;
  }
  
  return Math.min(100, Math.max(20, score));
}
```

## Final Recommendation Score

### Weighted Calculation
The final match percentage is calculated using student's priority weights:

```typescript
// Normalize user priorities to percentages
const totalWeight = sum(all_priority_values);
const normalizedPriorities = {
  academic: (priorities.academicExcellence / totalWeight) * 100,
  placement: (priorities.placementRecord / totalWeight) * 100,
  location: (priorities.locationPreference / totalWeight) * 100,
  fee: (priorities.feeAffordability / totalWeight) * 100,
  facility: (priorities.facilityQuality / totalWeight) * 100
};

// Calculate weighted match percentage
matchPercentage = (
  (academicScore × normalizedPriorities.academic) +
  (placementScore × normalizedPriorities.placement) +
  (locationScore × normalizedPriorities.location) +
  (feeScore × normalizedPriorities.fee) +
  (facilityScore × normalizedPriorities.facility) +
  (streamScore × 0.15) +  // Always important
  (typeScore × 0.05)      // Lower weight
) / 100;
```

## Eligibility Status Classification

Based on academic score, colleges are classified as:
- **Highly Likely** (85-100 points): Student is well above cutoff
- **Likely** (70-84 points): Student meets requirements comfortably
- **Possible** (50-69 points): Student has a reasonable chance
- **Reach** (below 50 points): Student is below typical requirements

## Quality Assurance Measures

### 1. Academic Priority Enforcement
- Academic score heavily influences final ranking
- High-credential students are matched with appropriate colleges
- Poor academic matches are filtered out (below 40% overall match)

### 2. Realistic Recommendations
- Maximum 20 recommendations per student
- Colleges sorted by match percentage and academic fit
- Match reasons clearly explained for each recommendation

### 3. Continuous Improvement
- Algorithm parameters regularly updated based on student feedback
- Historical admission data used to refine cutoff predictions
- Machine learning techniques planned for future versions

## Algorithm Strengths

1. **Academic Focus**: Prioritizes academic compatibility above all
2. **Personalized Weighting**: Respects individual student priorities
3. **Comprehensive Evaluation**: Considers multiple factors beyond just marks
4. **Realistic Expectations**: Provides honest eligibility assessments
5. **Transparency**: Clear explanation of why each college is recommended

## Known Limitations

1. **Data Dependency**: Quality depends on accurate college data
2. **Static Cutoffs**: Uses historical cutoffs, not real-time admission data
3. **Subjective Elements**: Some factors like "fit" are hard to quantify
4. **Limited Feedback Loop**: No real-time learning from admission outcomes

## Future Enhancements

1. **Machine Learning Integration**: Learn from historical admission patterns
2. **Real-time Cutoff Tracking**: Dynamic cutoff updates during admission season
3. **Peer Comparison**: Show how student compares to previous admits
4. **Success Prediction**: Predict likelihood of admission success
5. **Career Outcome Modeling**: Factor in long-term career prospects

## Technical Implementation

### Performance Optimization
- Efficient sorting algorithms for large college databases
- Caching mechanisms for repeated calculations
- Asynchronous processing for real-time recommendations

### Scalability Considerations
- Stateless design for horizontal scaling
- Database indexing for fast college retrieval
- API rate limiting for fair usage

---

## Contact & Support
For technical questions about the recommendation engine:
- Email: tech@skilljourneybridge.com
- Developer Documentation: Available in `/docs/api/`
- Issue Tracking: GitHub repository

*Last Updated: December 2024*  
*Algorithm Version: 2.1.0*
