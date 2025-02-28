/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
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
  }
}
