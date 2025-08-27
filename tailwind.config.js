/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'santa-cruz': {
          // Azul principal del escudo/logo
          'blue': {
            50: '#e6f3ff',
            100: '#b3d9ff',
            200: '#80bfff',
            300: '#4da6ff',
            400: '#1a8cff',
            500: '#0066cc', // Color principal
            600: '#0052a3',
            700: '#003d7a',
            800: '#002952',
            900: '#001429',
          },
          // Dorado/amarillo del escudo
          'gold': {
            50: '#fffdf0',
            100: '#fff8d1',
            200: '#fff1a3',
            300: '#ffe975',
            400: '#ffe147',
            500: '#ffd700', // Dorado principal
            600: '#e6c200',
            700: '#cc9e00',
            800: '#b37900',
            900: '#995500',
          },
          // Verde del escudo/bandera
          'green': {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a', // Verde principal
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          }
        }
      },
    },
  },
  plugins: [],
};


