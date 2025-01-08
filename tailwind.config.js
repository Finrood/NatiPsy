/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
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
      typography: {
        DEFAULT: {
          css: {
            // Headings
            h1: {
              color: '#131b35', // primary-blue
              fontWeight: '700',
            },
            h2: {
              color: '#131b35', // primary-blue
              fontWeight: '600',
              borderBottomWidth: '1px',
              borderBottomColor: '#f4ddd5', // primary-pink
              paddingBottom: '0.5rem',
            },
            h3: {
              color: '#131b35', // primary-blue
              fontWeight: '500',
            },
            h4: {
              color: '#131b35', // primary-blue
              fontWeight: '500',
            },
            // Paragraph
            p: {
              color: '#131b35', // primary-blue
            },
            // Links
            a: {
              color: '#131b35', // primary-blue
              textDecoration: 'none',
              fontWeight: 'inherit',
              '&:hover': {
                color: '#d3bcb2', // primary-pink-dark
                textDecoration: 'none',
              },
            },
            // Prevent automatic links on headings
            'h1 a, h2 a, h3 a, h4 a': {
              color: 'inherit !important',
              textDecoration: 'none !important',
              fontWeight: 'inherit !important',
              pointerEvents: 'none',
            },
            // Lists
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
              color: '#131b35', // primary-blue
            },
            li: {
              color: '#131b35', // primary-blue
            },
            // Other elements
            strong: {
              color: '#131b35', // primary-blue
            },
            em: {
              color: '#131b35', // primary-blue
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}