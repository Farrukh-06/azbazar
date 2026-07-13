import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { serif: ['Georgia', 'serif'] },
      colors: {
        navy: { DEFAULT: '#0D1B2A', mid: '#1B2E45' },
        gold: { DEFAULT: '#C9A84C', light: '#E8C97A' },
      },
    },
  },
  plugins: [],
};
export default config;
