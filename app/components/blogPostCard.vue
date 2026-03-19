<template>
  <NuxtLink :to="link">
  <div class="border-solid border-2 border-red-800 rounded-lg p-3 m-2 min-w-[30dvw]">
    <h2 class="text-2xl font-bold text-red-800 m-2">{{ title }}</h2>
    <p class="text-lg text-black">{{ content }}</p>
  </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  link: {
    type: String,
  }
})
</script>