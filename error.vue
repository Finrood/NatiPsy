<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-primary-blue text-white text-center p-6">
    <h1 class="text-6xl font-bold mb-4">404</h1>
    <p class="text-2xl mb-6">Oops! The page you're looking for doesn't exist.</p>
    <p class="text-lg mb-6">It looks like you've taken a wrong turn.</p>
    <NuxtLink
        to="/"
        class="bg-primary-pink text-primary-blue py-2 px-6 rounded-full text-lg font-semibold hover:bg-primary-pink-dark transition-colors duration-300"
    >
      Go back to Home
    </NuxtLink>
  </div>
</template>

<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => {
  clearError()
  window.location.href = '/'
}
</script>