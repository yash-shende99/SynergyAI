/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Sets Inter as the default font
      },
      colors: {
        background: '#000000',
        surface: '#121212', 
        secondarySurface: '#222222',
        primary: '#9112BC',
        'primary-hover': '#7A0FA1',
        secondary: '#64748B',
        border: '#27272A',
        // SynergyAI colors as direct color utilities
        'synergy-ai': {
          primary: '#9112BC',
          'primary-hover': '#7A0FA1',
          purple: '#9112BC',
          'purple-light': '#A846D0',
          blue: '#6366F1',
          cyan: '#06B6D4',
          dark: '#121212',
          darker: '#000000',
        }
      },
    },
  },
  plugins: [],
};
