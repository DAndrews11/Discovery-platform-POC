/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf2f2',
          100: '#fde8e8',
          500: '#9B2C2C',
          600: '#822727',
          700: '#631D1D',
        },
      },
    },
  },
  plugins: [],
} 