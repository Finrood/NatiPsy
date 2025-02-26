export default {
  hostname: process.env.SITE_URL || 'https://example.com',
  gzip: true,
  exclude: [
    '/private/**',
    '/admin/**'
  ],
  routes: async () => {
    // Dynamic routes from content
    const { $content } = useNuxtApp()
    const posts = await $content('blog').only(['path']).fetch()
    return posts.map(post => post.path)
  }
} 