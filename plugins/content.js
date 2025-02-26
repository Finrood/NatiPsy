export default defineNuxtPlugin(() => {
  const isDev = process.env.NODE_ENV === 'development'
  
  // Only show draft posts in development
  const queryBuilder = (query) => {
    if (!isDev) {
      query.where({ draft: { $ne: true } })
    }
    return query
  }

  return {
    provide: {
      blogQuery: queryBuilder
    }
  }
}) 