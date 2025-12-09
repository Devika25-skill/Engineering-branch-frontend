export enum State {
  // States
  ANDHRA_PRADESH = "Andhra Pradesh",
  ARUNACHAL_PRADESH = "Arunachal Pradesh",
  ASSAM = "Assam",
  BIHAR = "Bihar",
  CHHATTISGARH = "Chhattisgarh",
  GOA = "Goa",
  GUJARAT = "Gujarat",
  HARYANA = "Haryana",
  HIMACHAL_PRADESH = "Himachal Pradesh",
  JHARKHAND = "Jharkhand",
  KARNATAKA = "Karnataka",
  KERALA = "Kerala",
  MADHYA_PRADESH = "Madhya Pradesh",
  MAHARASHTRA = "Maharashtra",
  MANIPUR = "Manipur",
  MEGHALAYA = "Meghalaya",
  MIZORAM = "Mizoram",
  NAGALAND = "Nagaland",
  ODISHA = "Odisha",
  PUNJAB = "Punjab",
  RAJASTHAN = "Rajasthan",
  SIKKIM = "Sikkim",
  TAMIL_NADU = "Tamil Nadu",
  TELANGANA = "Telangana",
  TRIPURA = "Tripura",
  UTTARAKHAND = "Uttarakhand",
  UTTAR_PRADESH = "Uttar Pradesh",
  WEST_BENGAL = "West Bengal",

  // Union Territories
  ANDAMAN_AND_NICOBAR_ISLANDS = "Andaman and Nicobar Islands",
  CHANDIGARH = "Chandigarh",
  DADRA_NAGAR_HAVELI_DAMAN_DIU = "Dadra and Nagar Haveli and Daman and Diu",
  DELHI = "Delhi",
  JAMMU_AND_KASHMIR = "Jammu and Kashmir",
  LADAKH = "Ladakh",
  LAKSHADWEEP = "Lakshadweep",
  PUDUCHERRY = "Puducherry"
}

// Helper to get all state values as an array
export const getAllStates = (): string[] => Object.values(State);
