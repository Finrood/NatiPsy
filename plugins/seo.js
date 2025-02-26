const config = {
  defaultTitle: 'Blog Title',
  titleTemplate: '%s | Blog Title',
  defaultDescription: 'Default blog description',
  defaultImage: '/default-og-image.jpg',
  siteUrl: process.env.SITE_URL || 'https://example.com'
}

export const generateMeta = (post) => {
  return {
    title: post.title,
    meta: [
      { name: 'description', content: post.description },
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: post.title },
      { property: 'og:description', content: post.description },
      { property: 'og:image', content: `${config.siteUrl}${post.image}` },
      { property: 'article:published_time', content: post.date },
      { property: 'article:author', content: post.author.name },
      { property: 'article:section', content: post.category },
      { name: 'twitter:card', content: 'summary_large_image' }
    ]
  }
}

// Separate the Nuxt plugin from the core functionality
export default defineNuxtPlugin(() => {
  return {
    provide: {
      generateMeta
    }
  }
}) 