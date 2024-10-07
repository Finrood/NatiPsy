export default defineNuxtConfig({
  target: 'static',
  ssr: true,

  generate: {
    routes: ['/']
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'pt-BR'
      },
      title: 'Psicóloga Natalia Ferreira',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Psicóloga Natalia Ferreira - Terapia Online e Consultoria em Psicologia. Descubra o poder da terapia online para sua saúde mental.' },
        { name: 'keywords', content: 'psicologia, terapia online, psicóloga, psicóloga Natalia Ferreira, saúde mental, psicoterapia, ansiedade, depressão, burnout, estresse, consultoria psicológica' },
        { name: 'author', content: 'Natalia Ferreira' },
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:title', content: 'Psicóloga Natalia Ferreira' },
        { property: 'og:description', content: 'Descubra o poder da terapia online com a psicóloga Natalia Ferreira. Consultoria e terapia para sua saúde mental.' },
        { property: 'og:image', content: 'https://psicologanataliaferreira.com/assets/logo.webp' },
        { property: 'og:url', content: 'https://psicologanataliaferreira.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Psicóloga Natalia Ferreira' }
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        { rel: 'preload', href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap', as: 'style', onload: "this.onload=null;this.rel='stylesheet'" },
        { rel: 'canonical', href: 'https://psicologanataliaferreira.com' }
      ],
      noscript: [
        { children: '<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">' }
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Natalia Ferreira",
            "description": "Psicóloga especializada em terapia online e consultoria em psicologia.",
            "url": "https://psicologanataliaferreira.com",
            "image": "https://psicologanataliaferreira.com/assets/logo.webp",
            "sameAs": ["https://www.linkedin.com/in/natalia-ferreira-santos"]
          })
        },
        {
          type: 'text/javascript',
          children: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PVQJWCR4');
          `
        }
      ]
    }
  },

  css: [
    '@/assets/css/main.css'
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],

  plugins: [
    'plugins/vue-gtm-client.js',
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      cssnano: {
        preset: 'default',
      },
    },
  },

  site: {
    url: 'https://psicologanataliaferreira.com',
  },

  sitemap: {
    hostname: 'https://psicologanataliaferreira.com',
    routes: ['/']
  },

  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: 'https://psicologanataliaferreira.com/sitemap.xml'
  },

  nitro: {
    compressPublicAssets: true,
    minify: true,
  },

  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      cssCodeSplit: true, // Ensure CSS is split into separate files
    },
    optimizeDeps: {
      include: ['vue'],
    },
  },

  components: true,

  compatibilityDate: '2024-10-07'
})
