/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Emerald 500
          600: '#16a34a',
          700: '#15803d',
          800: '#166534', // Fidelity-ish Green
          900: '#14532d',
        },
        slate: {
          850: '#1e293b', // Deep slate for sidebar
        }
      }
    },
  },
  plugins: [],
}
