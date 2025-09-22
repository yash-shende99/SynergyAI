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
        background: '#000000', // True black for the main background
        surface: '#121212', 
        secondarySurface: '#222222',   // A very dark gray for cards, sidebars
        primary: '#9112BC',   // Vibrant blue accent for buttons and active states
        'primary-hover': '#7A0FA1',
        secondary: '#64748B', // Muted text color for secondary information
        border: '#27272A',     // A soft border color for dark themes
      },
    },
  },
  plugins: [],
};
