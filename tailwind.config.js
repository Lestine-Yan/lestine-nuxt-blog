/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      width: {
        'full-no-scrollbar': 'calc(100dvw - 8px)',
      },
    },
  },
  plugins: [],
}

