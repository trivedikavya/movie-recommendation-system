/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          primary: '#128c7e',
          dark: '#075e54',
          light: '#25d366',
          bubble: '#dcf8c6',
          bg: '#e5ddd5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.4s infinite ease-in-out both',
      }
    },
  },
  plugins: [],
}
