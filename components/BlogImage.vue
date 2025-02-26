<template>
  <figure class="my-8">
    <img
      :src="props.src"
      :alt="props.alt"
      :width="props.width"
      :height="props.height"
      loading="lazy"
      class="rounded-lg shadow-lg"
    />
    <figcaption v-if="props.caption" class="text-center text-sm text-gray-600 mt-2">
      {{ props.caption }}
    </figcaption>
  </figure>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 800
  },
  height: {
    type: Number,
    default: 600
  },
  caption: {
    type: String,
    default: ''
  }
})
</script> 