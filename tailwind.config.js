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
          dark: '#070A13',
          card: 'rgba(15, 23, 42, 0.45)',
          accent: '#6366F1', // Soft Indigo
        }
      }
    },
  },
  plugins: [],
}

