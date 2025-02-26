export default defineContentConfig({
  documentDriven: true,
  markdown: {
    remarkPlugins: ['remark-html'],
  },
  collections: {
    blog: {
      directory: 'content/blog',
    },
    authors: {
      directory: 'content/blog/_authors',
    }
  }
}) 