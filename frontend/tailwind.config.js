/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js}',
    './src/pages/**/*.html'
  ],
  
  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      }
    }
  },
  
  plugins: []
};
