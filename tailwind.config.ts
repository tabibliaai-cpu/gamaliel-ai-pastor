import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c3d0ff',
          300: '#9db0fd',
          400: '#7487f8',
          500: '#4f60f0',
          600: '#3b46db',
          700: '#3038b8',
          800: '#2c3295',
          900: '#292f7a',
          950: '#1b1e4f',
        },
        gold: {
          300: '#fcd27a',
          400: '#f9b930',
          500: '#e8a020',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
