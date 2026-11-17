/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9bebe',
          300: '#f49090',
          600: '#a01f1f',
          700: '#8B1A1A',
          800: '#6e1515',
          900: '#521010',
        },
        gold: {
          50:  '#fefbeb',
          100: '#fef3c7',
          400: '#d4a017',
          500: '#C8A84B',
          600: '#b8942a',
        },
      },
    },
  },
  plugins: [],
};
