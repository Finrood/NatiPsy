/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'white': '#ffffff',
        'primary-pink': '#f4ddd5',
        'primary-pink-dark': '#d3bcb2',
        'primary-blue': '#131b35',
      },
    },
  },
  plugins: [],
}
