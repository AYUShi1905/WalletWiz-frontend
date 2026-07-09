/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: 'rgba(255, 255, 255, 0.05)',
          accent: '#3B82F6', // Vibrant Blue
        }
      }
    },
  },
  plugins: [],
}

