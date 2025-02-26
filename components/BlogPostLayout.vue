// components/BlogPostLayout.vue
<template>
  <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
    </header>
    <TableOfContents :content="post.body" />
    
    <div class="prose prose-lg max-w-none">
      <ContentDoc>
        <template #empty>
          <BlogPostEmpty />
        </template>
        <template #not-found>
          <BlogPostNotFound />
        </template>
      </ContentDoc>
    </div>

    <BlogShare :post="post" />
    <BlogRelatedPosts :currentPost="post" />
  </article>
</template>

<script setup>
const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (date) => {
  // Ensure we're working with UTC dates
  const utcDate = new Date(date)
  return utcDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
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