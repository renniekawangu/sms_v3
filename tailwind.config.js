/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#02A7BF',
          deep: '#0A6E7D',
        },
        secondary: {
          blue: '#5E9054',
        },
        accent: {
          yellow: '#7CCB74',
        },
        background: {
          light: '#F3F9FB',
        },
        card: {
          white: '#FFFFFF',
        },
        text: {
          dark: '#102033',
          muted: '#5F7187',
          capri: '#02A7BF',
        },
        border: {
          capri: '#02A7BF',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Sora', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        custom: '12px',
      },
      boxShadow: {
        custom: '0 8px 24px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
