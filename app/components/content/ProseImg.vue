<template>
  <img :src="src" :alt="alt" :width="width" :height="height" class="rounded-lg my-4 max-w-full h-auto" />
</template>

<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: undefined
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  }
})
</script>
