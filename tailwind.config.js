/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        ink: '#17202A',
        civic: '#0F766E',
        signal: '#E11D48',
        ballot: '#F7F3EA',
        maize: '#F2C94C',
      },
      boxShadow: {
        panel: '0 18px 48px rgba(23, 32, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
