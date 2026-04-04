<template>
  <code class="bg-red-800 text-white px-1.5 py-0.5 rounded text-sm font-mono">
    <slot />
  </code>
</template>

<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: undefined
  }
})
</script>
