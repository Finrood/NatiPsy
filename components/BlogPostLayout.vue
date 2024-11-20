// components/BlogPostLayout.vue
<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <!-- Post Header -->
    <header class="mb-8">
      <div class="flex items-center text-sm text-gray-500 mb-4">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span class="mx-2">•</span>
        <span>{{ post.readTime }}</span>
        <span class="mx-2">•</span>
        <span>{{ post.category }}</span>
      </div>

      <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
        {{ post.title }}
      </h1>

      <p class="text-xl text-gray-600">
        {{ post.description }}
      </p>
    </header>

    <!-- Author Info -->
    <div class="flex items-center space-x-4 mb-8 border-b pb-8">
      <img
          v-if="post.author?.avatar"
          :src="post.author.avatar"
          :alt="post.author.name"
          class="w-12 h-12 rounded-full"
      />
      <div>
        <div class="font-medium text-gray-900">{{ post.author?.name }}</div>
        <div class="text-sm text-gray-500">{{ post.author?.bio }}</div>
      </div>
    </div>

    <!-- Post Content -->
    <div class="prose prose-lg max-w-none">
      <ContentDoc />
    </div>
  </article>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style>
/* Custom styles for markdown content */
.prose img {
  @apply rounded-lg shadow-lg;
}

.prose blockquote {
  @apply border-l-4 border-blue-500 bg-blue-50 p-4 my-6;
}

.prose blockquote p {
  @apply text-blue-700 mb-0;
}

/* Add more custom styles as needed */
</style>