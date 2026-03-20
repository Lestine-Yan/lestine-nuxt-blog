<template>
  <a :href="href" :target="target" class="text-red-800 hover:text-red-600 underline transition-colors duration-200">
    <slot />
  </a>
</template>

<script setup lang="ts">
defineProps({
  href: {
    type: String,
    default: ''
  },
  target: {
    type: String,
    default: undefined
  }
})
</script>
