<template>
  <a :href="href" :target="target" :rel="target === '_blank' ? 'noopener noreferrer' : undefined" class="text-[#7E6AD0] hover:text-[#D286D2] transition-colors duration-200">
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
