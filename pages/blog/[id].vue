<!-- pages/blog/[...slug].vue -->
<template>
  <article class="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
    <!-- Article Header -->
    <header class="mb-8">
      <!-- Back Button -->
      <NuxtLink
          to="/"
          class="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-8 transition-colors"
      >
        <span class="mr-2">←</span> Back to Articles
      </NuxtLink>

      <!-- Category -->
      <div class="mb-4">
        <span class="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
          {{ post.category }}
        </span>
      </div>

      <!-- Title -->
      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
        {{ post.title }}
      </h1>

      <!-- Meta Information -->
      <div class="flex items-center space-x-4 text-gray-600 mb-8">
        <span>{{ formatDate(post.date) }}</span>
        <span>•</span>
        <span>{{ post.readTime }}</span>
      </div>

      <!-- Featured Image -->
      <div class="relative h-64 sm:h-96 rounded-xl overflow-hidden mb-8">
        <img
            v-if="post.image"
            :src="post.image"
            :alt="post.title"
            class="w-full h-full object-cover"
        />
      </div>
    </header>

    <!-- Article Content -->
    <div class="prose prose-lg max-w-none">
      <ContentDoc />
    </div>

    <!-- Footer -->
    <footer class="mt-16 pt-8 border-t border-gray-200">
      <!-- Share buttons or related articles could go here -->
      <div class="flex justify-between items-center">
        <NuxtLink
            to="/"
            class="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span class="mr-2">←</span> Back to Articles
        </NuxtLink>
      </div>
    </footer>
  </article>
</template>

<script setup>
const { path } = useRoute()

// Fetch current post
const { data: post } = await useAsyncData(`post-${path}`, () => queryContent(path).findOne())

// Format date helper
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Meta tags for SEO
useHead({
  title: post.value?.title,
  meta: [
    { name: 'description', content: post.value?.description },
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.description },
    { property: 'og:image', content: post.value?.image },
    { name: 'twitter:title', content: post.value?.title },
    { name: 'twitter:description', content: post.value?.description },
    { name: 'twitter:image', content: post.value?.image },
  ]
})
</script>