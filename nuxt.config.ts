export default defineNuxtConfig({
  // For static site generation
  target: 'static',
  ssr: true,

  // Generate configuration
  generate: {
    // Since it's a single page, we only need to generate the home route
    routes: ['/']
  },

  app: {
    head: {
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
        { children: '<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">' },
        {
          children: `
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NJW3365L"
height="0" width="0" style="display:none;visibility:hidden"></iframe>
          `
        }
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
          // Google Tag Manager
          type: 'text/javascript',
          children: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NJW3365L');
          `
        }
      ]
    }
  },

  // Include your global CSS
  css: [
    '@/assets/css/main.css'
  ],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
  ],

  plugins: [
      'plugins/vue-gtm-client.js',
  ],

  // Add PostCSS configuration here
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
      // Add any other PostCSS plugins you're using
    },
  },

  // Enable auto-import of components
  components: true,

  compatibilityDate: '2024-10-01'
})
