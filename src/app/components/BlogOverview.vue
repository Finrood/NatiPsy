// components/BlogOverview.vue
<template>
  <section id="minha-abordagem" class="my-approach-section py-16 sm:py-24 bg-primary-pink/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="max-w-2xl mx-auto text-center mb-16">
        <h2 class="text-4xl sm:text-5xl font-bold text-primary-blue mb-12 text-center">
          Blog
        </h2>
        <p class="text-gray-600 text-lg">
          Artigos sobre saúde mental, relacionamentos e desenvolvimento pessoal
        </p>
      </div>

      <!-- Blog Grid - Show only latest 3 posts -->
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <article
            v-for="post in latestPosts"
            :key="post._path"
            class="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <NuxtLink :to="`/blog/${post._path.split('/').pop()}`" class="block h-full">
            <!-- Category Tag -->
            <span
                v-if="post.category"
                class="absolute top-4 right-4 z-10 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full"
            >
              {{ post.category }}
            </span>

            <!-- Image Container -->
            <div class="relative h-48 overflow-hidden">
              <div class="absolute inset-0 bg-linear-to-t from-black/40 to-transparent z-10" />
              <nuxt-img
                  v-if="post.image"
                  :src="post.image"
                  :alt="post.title"
                  width="400"
                  height="192"
                  loading="lazy"
                  class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            <!-- Content Container -->
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                {{ post.title }}
              </h3>

              <p class="text-gray-600 mb-4 line-clamp-2">
                {{ post.description }}
              </p>

              <!-- Meta Information -->
              <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div class="flex items-center space-x-4">
                  <time :datetime="post.date">{{ formatDate(post.date) }}</time>
                  <span aria-hidden="true">•</span>
                  <span>{{ post.readTime }}</span>
                </div>
              </div>

              <!-- Author Section -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex items-center space-x-3">
                  <span class="font-medium text-gray-900">{{ post.author?.name }}</span>
                </div>
                <span class="text-blue-600 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">
                  →
                </span>
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const { data: posts } = await useAsyncData('blog-preview', () =>
    queryContent('blog')
        .where({
          draft: { $ne: true },
          _path: { $ne: null },  // Ensure path exists
          _path: { $not: /\/_authors/ },  // Exclude author paths
          _type: 'markdown'  // Ensure it's a markdown document
          }) // Exclude draft posts
        .sort({ date: -1 })
        .limit(3) // Only get latest 3 posts
        .find()
)

// Create a Map of authors for efficient lookup
const { data: authors } = await useAsyncData('authors', () =>
    queryContent('blog/_authors').find()
)

const authorsMap = new Map(authors.value?.map(author => [author.slug, author]) || [])

// Compute latest posts with author data
const latestPosts = computed(() => {
  if (!posts.value) return []

  return posts.value.map(post => ({
    ...post,
    author: post.author ? authorsMap.get(post.author) || {} : {}
  }))
})

// Date formatter
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
