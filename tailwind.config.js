/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#070A13',
          card: 'rgba(15, 23, 42, 0.45)',
          accent: '#00BCD4', // Cyan 500
        },
        cyanCustom: {
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
          A100: '#84FFFF',
          A200: '#18FFFF',
          A400: '#00E5FF',
          A700: '#00B8D4',
        }
      }
    },
  },
  plugins: [],
}

