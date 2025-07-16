


const getApiBaseUrl = () => {
  const currentDomain = window.location.href;

  
  if (currentDomain.startsWith('https://futurebridge.skilljourney.in/')) {
    // Production domain
    return 'https://prod-fb-brd8dagqc9cfe6hv.eastus-01.azurewebsites.net';
  } else if (currentDomain.startsWith('playground.staging.futurebridge.skilljourney.in')) {
    // Staging domain
    return 'https://staging-futurebridge.azurewebsites.net';
  } else {
    // Default to staging for development and other domains
    return 'https://staging-futurebridge.azurewebsites.net';
  }
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
} as const;
