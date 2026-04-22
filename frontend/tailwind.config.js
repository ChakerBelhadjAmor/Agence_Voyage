/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          500: '#2d7df7',
          600: '#1f63d4',
          700: '#194fa8',
        },
      },
    },
  },
  plugins: [],
};
