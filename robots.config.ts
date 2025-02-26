export default [
  {
    UserAgent: '*',
    Allow: '/',
    Disallow: ['/private', '/admin'],
    Sitemap: (req) => `https://${req.headers.host}/sitemap.xml`
  }
] 