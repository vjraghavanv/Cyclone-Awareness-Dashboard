/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        severity: {
          yellow: '#FCD34D',
          orange: '#FB923C',
          red: '#EF4444',
        },
        freshness: {
          fresh: '#10B981',
          yellow: '#FCD34D',
          orange: '#FB923C',
          red: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}
