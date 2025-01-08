export default defineNuxtConfig({
  // Runtime config
  ssr: true,

  // App configuration
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Psicóloga Natalia Ferreira',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Psicóloga Natalia Ferreira - Terapia Online e Consultoria em Psicologia. Descubra o poder da terapia online para sua saúde mental.' },
        { name: 'keywords', content: 'psicologia, terapia online, psicóloga, psicóloga Natalia Ferreira, saúde mental, psicoterapia, ansiedade, depressão, burnout, estresse, consultoria psicológica' },
        { name: 'author', content: 'Natalia Ferreira' },
        // SEO meta tags
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        // Open Graph meta tags
        { property: 'og:title', content: 'Psicóloga Natalia Ferreira' },
        { property: 'og:description', content: 'Descubra o poder da terapia online com a psicóloga Natalia Ferreira. Consultoria e terapia para sua saúde mental.' },
        { property: 'og:image', content: '/assets/logo.webp' },
        { property: 'og:url', content: 'https://psicologanataliaferreira.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Psicóloga Natalia Ferreira' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap', media: 'print', onload: "this.media='all'" },
        { rel: 'canonical', href: 'https://psicologanataliaferreira.com' },
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
            "image": "/assets/logo.webp",
            "sameAs": ["https://www.linkedin.com/in/natalia-ferreira-santos"],
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

  // CSS configuration
  css: ['@/assets/css/main.css'],

  // Modules configuration
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    '@nuxt/content',
    '@nuxtjs/mdc',
    '@nuxt/image',
  ],

  // Content configuration
  content: {
    markdown: {
      toc: { depth: 3, searchDepth: 3 },
      remarkPlugins: ['remark-html'],
      prose: {
        copyButton: false,
        highlight: { theme: 'github-light' }
      },
      anchorLinks: { depth: 0 }
    }
  },

  // Build optimization
  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },

  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue'],
          }
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      cssnano: { preset: 'default' },
    },
  },

  // Site configuration
  site: {
    url: 'https://psicologanataliaferreira.com'
  },

  // Sitemap configuration
  sitemap: {
    hostname: 'https://psicologanataliaferreira.com',
  },

  // Robots configuration
  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: 'https://psicologanataliaferreira.com/sitemap.xml'
  },

  // Development configuration
  typescript: {
    strict: true
  },

  compatibilityDate: '2025-01-08'
})