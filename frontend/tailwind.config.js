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
          light: '#f5f7ff',
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#4f46e5', // Primary Indigo
          600: '#4338ca',
          700: '#3730a3',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          500: '#06b6d4', // Cyan accent
          600: '#0891b2',
        },
        navy: {
          50: '#f0f4f9',
          500: '#1d4ed8', // Royal Blue
          800: '#1e293b',
          950: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium': '0 12px 40px -12px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.15)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
