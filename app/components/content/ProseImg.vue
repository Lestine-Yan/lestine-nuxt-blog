<template>
  <img :src="src" :alt="alt" :width="width" :height="height" loading="lazy" class="block mx-auto rounded-xl my-6 max-w-full h-auto shadow-md ring-1 ring-[#7E6AD0]/10" />
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
