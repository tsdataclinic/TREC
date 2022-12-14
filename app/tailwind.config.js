/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        'app-slate': '#33424e',
        'app-blue': '#6d93b5',
        'app-green': '#adc9ba',
      },
    },
  },
  plugins: [],
};
