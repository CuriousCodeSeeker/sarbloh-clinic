/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sarbloh: {
          red: '#C41E3A',       // Deep red from logo
          'red-dark': '#9B1830',
          'red-light': '#E04A5F',
          green: '#6B8E23',     // Olive / leaf green from logo
          'green-dark': '#556B2F',
          'green-light': '#8FBC3F',
          cream: '#FDF8F3',
          gray: '#F5F5F5',
        },
      },
    },
  },
  plugins: [],
};
