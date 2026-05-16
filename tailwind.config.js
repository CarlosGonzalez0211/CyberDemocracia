/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0A0014',
        civic: '#6e36ad',
        signal: '#FF3B5C',
        ballot: '#F5F0FF',
        maize: '#F2C94C',
      },
      boxShadow: {
        panel: '0 18px 48px rgba(110, 54, 173, 0.10)',
      },
    },
  },
  plugins: [],
};
