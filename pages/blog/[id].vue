<!-- pages/blog/[...slug].vue -->
<template>
  <article class="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
    <!-- Article Header -->
    <header class="mb-8">
      <!-- Back Button -->
      <NuxtLink
          to="/pages"
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

      <!-- Author -->
      <div class="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <img
            v-if="post.author?.avatar"
            :src="post.author.avatar"
            :alt="post.author.name"
            class="h-12 w-12 rounded-full object-cover ring-2 ring-white"
        />
        <div>
          <div class="font-medium text-gray-900">{{ post.author?.name }}</div>
          <div class="text-sm text-gray-600">{{ post.author?.credentials }}</div>
        </div>
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
            to="/pages"
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

// Get author data
if (post.value?.author) {
  const authorData = await queryContent('blog/_authors')
      .where({ slug: post.author })
      .findOne()

  if (authorData) {
    post.author = authorData
  } else {
    console.error('Author not found:', post.author)
    post.author = {}
  }
}

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
    // Open Graph
    { property: 'og:title', content: post.value?.title },
    { property: 'og:description', content: post.value?.description },
    { property: 'og:image', content: post.value?.image },
    // Twitter
    { name: 'twitter:title', content: post.value?.title },
    { name: 'twitter:description', content: post.value?.description },
    { name: 'twitter:image', content: post.value?.image },
  ]
})
</script>