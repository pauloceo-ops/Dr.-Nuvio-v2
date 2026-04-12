/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nuvio V3 Palette
        nuvio: {
          navy: '#0A1628',
          ocean: '#1B3A5C',
          blue: '#2E86AB',
          cyan: '#4ECDC4',
          'cyan-light': '#7EFADB',
          cloud: '#E8F0F8',
          white: '#FFFFFF',
        },
        // Semantic aliases
        primary: {
          50: '#E8F0F8',
          100: '#D1E1F1',
          200: '#A3C4E3',
          300: '#75A7D5',
          400: '#4ECDC4',
          500: '#2E86AB',
          600: '#1B3A5C',
          700: '#0A1628',
          800: '#070F1C',
          900: '#040A12',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
