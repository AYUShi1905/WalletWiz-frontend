/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#09090B',
          card: 'rgba(24, 24, 27, 0.45)',
          accent: '#3F51B5', // Indigo 500
        },
        indigoCustom: {
          50: '#E8EAF6',
          100: '#C5CAE9',
          200: '#9FA8DA',
          300: '#7986CB',
          400: '#5C6BC0',
          500: '#3F51B5',
          600: '#3949AB',
          700: '#303F9F',
          800: '#283593',
          900: '#1A237E',
          A100: '#8C9EFF',
          A200: '#536DFE',
          A400: '#3D5AFE',
          A700: '#304FFE',
        }
      }
    },
  },
  plugins: [],
}
