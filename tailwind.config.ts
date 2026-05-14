import type { Config } from 'tailwindcss';
import sharedConfig from 'C:/Users/Admin/Documents/skilljourney/sj-future-bridge-ui-v2/sj-future-bridge-ui-v2/tailwind.config.ts';

export default {
  ...sharedConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;
