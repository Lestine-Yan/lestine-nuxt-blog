<template>
  <div class="relative my-6">
    <div v-if="filename" class="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded-t-lg border-b border-gray-600">
      {{ filename }}
    </div>
    <pre :class="[
      'overflow-x-auto p-4 text-sm leading-relaxed',
      filename ? 'rounded-b-lg' : 'rounded-lg',
      'bg-gray-900 text-gray-100'
    ]" :language="language"><slot /></pre>
  </div>
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
  },
  filename: {
    type: String,
    default: undefined
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  },
  meta: {
    type: String,
    default: undefined
  }
})
</script>
