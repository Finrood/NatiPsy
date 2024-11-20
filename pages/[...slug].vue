<template>
  <div>
    <NuxtErrorBoundary>
      <template #error="{ error }">
        <Error :error="error" />
      </template>
    </NuxtErrorBoundary>
  </div>
</template>

<script setup>
// Throw 404 error for any undefined route
import Error from "~/error.vue";

throw createError({
  statusCode: 404,
  message: "Page not found"
})
</script>
