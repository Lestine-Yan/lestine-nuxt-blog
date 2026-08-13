<template>
  <code class="px-1.5 py-0.5 rounded-md bg-[#7E6AD0]/10 text-[#7E6AD0] text-[0.9em] font-mono">
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
