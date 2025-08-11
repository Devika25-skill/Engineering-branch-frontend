import { IntegratedAdmissionType } from '@/types/integratedAdmission';

// Branch options for each admission type
export const branchOptions: Record<IntegratedAdmissionType, string[]> = {
  'BCA_MCA_Int': [
    'Computer Applications',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cyber Security',
    'Digital Marketing',
    'E-Commerce'
  ],
  'BBA_BMS_BBM_MBA_Int': [
    'Finance',
    'Marketing',
    'Human Resources',
    'Operations Management',
    'International Business',
    'Supply Chain Management',
    'Digital Marketing',
    'Business Analytics',
    'Entrepreneurship',
    'Banking & Insurance'
  ],
  'B_and_D_Pharmacy': [
    'Pharmaceutics',
    'Pharmaceutical Chemistry',
    'Pharmacology',
    'Pharmacognosy',
    'Hospital Pharmacy',
    'Clinical Pharmacy',
    'Industrial Pharmacy',
    'Pharmaceutical Analysis'
  ]
};

// City options for each admission type
export const cityOptions: Record<IntegratedAdmissionType, string[]> = {
  'BCA_MCA_Int': [
    'Mumbai',
    'Pune',
    'Nashik',
    'Nagpur',
    'Aurangabad',
    'Kolhapur',
    'Sangli',
    'Solapur',
    'Amravati',
    'Akola',
    'Latur',
    'Nanded',
    'Parbhani',
    'Jalgaon',
    'Dhule',
    'Ahmednagar',
    'Satara',
    'Ratnagiri',
    'Sindhudurg',
    'Thane',
    'Raigad',
    'Navi Mumbai'
  ],
  'BBA_BMS_BBM_MBA_Int': [
    'Mumbai',
    'Pune',
    'Nashik',
    'Nagpur',
    'Aurangabad',
    'Kolhapur',
    'Sangli',
    'Solapur',
    'Amravati',
    'Akola',
    'Latur',
    'Nanded',
    'Parbhani',
    'Jalgaon',
    'Dhule',
    'Ahmednagar',
    'Satara',
    'Ratnagiri',
    'Sindhudurg',
    'Thane',
    'Raigad',
    'Navi Mumbai'
  ],
  'B_and_D_Pharmacy': [
    'Mumbai',
    'Pune',
    'Nashik',
    'Nagpur',
    'Aurangabad',
    'Kolhapur',
    'Sangli',
    'Solapur',
    'Amravati',
    'Akola',
    'Latur',
    'Nanded',
    'Parbhani',
    'Jalgaon',
    'Dhule',
    'Ahmednagar',
    'Satara'
  ]
};

// Category options for each admission type
export const categoryOptions: Record<IntegratedAdmissionType, Array<{ value: string; label: string }>> = {
  'BCA_MCA_Int': [
    { value: 'GOPENS', label: 'Open Category (General)' },
    { value: 'GSCS', label: 'Scheduled Caste (SC)' },
    { value: 'GSTS', label: 'Scheduled Tribe (ST)' },
    { value: 'GVJS', label: 'VJNT (Vimukta Jati and Nomadic Tribes)' },
    { value: 'GNT1S', label: 'NT1 (Nomadic Tribe - Category 1)' },
    { value: 'GNT2S', label: 'NT2 (Nomadic Tribe - Category 2)' },
    { value: 'GNT3S', label: 'NT3 (Nomadic Tribe - Category 3)' },
    { value: 'GOBCS', label: 'Other Backward Class (OBC)' },
    { value: 'LOPENS', label: 'Open Category (General) - Linguistic Minority' },
    { value: 'LSCS', label: 'Scheduled Caste (SC) - Linguistic Minority' },
    { value: 'LNT2S', label: 'NT2 (Nomadic Tribe - Category 2) - Linguistic Minority' },
    { value: 'LOBCS', label: 'OBC - Linguistic Minority' },
    { value: 'TFWS', label: 'Tuition Fee Waiver Scheme' },
    { value: 'EWS', label: 'Economically Weaker Section' }
  ],
  'BBA_BMS_BBM_MBA_Int': [
    { value: 'GOPENS', label: 'Open Category (General)' },
    { value: 'GSCS', label: 'Scheduled Caste (SC)' },
    { value: 'GSTS', label: 'Scheduled Tribe (ST)' },
    { value: 'GVJS', label: 'VJNT (Vimukta Jati and Nomadic Tribes)' },
    { value: 'GNT1S', label: 'NT1 (Nomadic Tribe - Category 1)' },
    { value: 'GNT2S', label: 'NT2 (Nomadic Tribe - Category 2)' },
    { value: 'GNT3S', label: 'NT3 (Nomadic Tribe - Category 3)' },
    { value: 'GOBCS', label: 'Other Backward Class (OBC)' },
    { value: 'LOPENS', label: 'Open Category (General) - Linguistic Minority' },
    { value: 'LSCS', label: 'Scheduled Caste (SC) - Linguistic Minority' },
    { value: 'LNT2S', label: 'NT2 (Nomadic Tribe - Category 2) - Linguistic Minority' },
    { value: 'LOBCS', label: 'OBC - Linguistic Minority' },
    { value: 'TFWS', label: 'Tuition Fee Waiver Scheme' },
    { value: 'EWS', label: 'Economically Weaker Section' }
  ],
  'B_and_D_Pharmacy': [
    { value: 'GOPENS', label: 'Open Category (General)' },
    { value: 'GSCS', label: 'Scheduled Caste (SC)' },
    { value: 'GSTS', label: 'Scheduled Tribe (ST)' },
    { value: 'GVJS', label: 'VJNT (Vimukta Jati and Nomadic Tribes)' },
    { value: 'GNT1S', label: 'NT1 (Nomadic Tribe - Category 1)' },
    { value: 'GNT2S', label: 'NT2 (Nomadic Tribe - Category 2)' },
    { value: 'GNT3S', label: 'NT3 (Nomadic Tribe - Category 3)' },
    { value: 'GOBCS', label: 'Other Backward Class (OBC)' },
    { value: 'LOPENS', label: 'Open Category (General) - Linguistic Minority' },
    { value: 'LSCS', label: 'Scheduled Caste (SC) - Linguistic Minority' },
    { value: 'LNT2S', label: 'NT2 (Nomadic Tribe - Category 2) - Linguistic Minority' },
    { value: 'LOBCS', label: 'OBC - Linguistic Minority' },
    { value: 'DEFOPENS', label: 'Open - Defense Quota' },
    { value: 'DEFROBCS', label: 'OBC - Defense Quota' },
    { value: 'TFWS', label: 'Tuition Fee Waiver Scheme' },
    { value: 'EWS', label: 'Economically Weaker Section' }
  ]
};

// Helper function to get category label from value
export const getCategoryLabel = (admissionType: IntegratedAdmissionType, categoryValue: string): string => {
  const category = categoryOptions[admissionType].find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

// Helper function to get all available branches for an admission type
export const getBranchesForAdmissionType = (admissionType: IntegratedAdmissionType): string[] => {
  return branchOptions[admissionType] || [];
};

// Helper function to get all available cities for an admission type
export const getCitiesForAdmissionType = (admissionType: IntegratedAdmissionType): string[] => {
  return cityOptions[admissionType] || [];
};

// Helper function to get all available categories for an admission type
export const getCategoriesForAdmissionType = (admissionType: IntegratedAdmissionType): Array<{ value: string; label: string }> => {
  return categoryOptions[admissionType] || [];
};