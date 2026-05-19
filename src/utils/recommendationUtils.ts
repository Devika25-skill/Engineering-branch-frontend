export const mapApiResponseToFormData = (apiData: any) => {
  // Check if we received the full object with academic_credentials or just credentials
  const credentials = apiData.academic_credentials || apiData;
  const gender = apiData.gender;

  // Extract other exam details if available
  const otherExam = credentials.examPercentiles?.otherEntranceExam?.[0];

  return {
    // Academic Info
    gender: gender || undefined,
    reservationCategory:
      apiData.reservationCategory ||
      credentials.reservationCategory ||
      undefined,
    grouping:
      credentials.educationBackground?.stream ||
      "PCM (Physics, Chemistry, Mathematics)",
    tenthMarks: credentials.academicMarks?._10thGradeMarksPercent || undefined,
    twelfthMarks:
      credentials.academicMarks?._12thGradeMarksPercent || undefined,
    groupingMarks: credentials.academicMarks?.groupingMarksPercent || undefined,
    cetPercentile: credentials.examPercentiles?.CET || undefined,
    cetRank: credentials.examPercentiles?.CET_Rank || undefined,
    jeePercentile: credentials.examPercentiles?.JEE || undefined,
    otherExamName: otherExam?.examName || undefined,
    otherExamPercentile: otherExam?.percentileOrScore || undefined,
    sportsAchievements:
      credentials.achievementsExperience?.sportsAchievements || undefined,
    certifications:
      credentials.achievementsExperience?.certifications || undefined,
    internships:
      credentials.achievementsExperience?.internshipsWorkExperience ||
      undefined,
    otherAchievements:
      credentials.achievementsExperience?.otherAchievements || undefined,

    // Preferences
    preferredStreams: credentials.preferences?.engineeringBranches || [],
    preferredCities: credentials.preferences?.preferredCities || [],
    district:
      credentials.educationBackground?.district ||
      credentials.preferences?.preferredDistrict ||
      undefined,

    // Priorities
    hostelPreference:
      credentials.campusFacilitiesEnvironment?.hostelFacility || undefined,
    campusSetting:
      credentials.campusFacilitiesEnvironment?.campusSetting || undefined,
    transportFacility:
      credentials.campusFacilitiesEnvironment?.transportFacility || undefined,
    wifiTechInfrastructure:
      credentials.campusFacilitiesEnvironment?.wifiTechInfrastructure ||
      undefined,
    coCurricularActivities:
      credentials.campusFacilitiesEnvironment?.coCurricularActivities ||
      undefined,
    maxBudget: credentials.annualBudget || undefined,
    collegeTypes: credentials.collegeTypePreferences || [],
    priorities: credentials.priorityFactors || [],
  };
};
