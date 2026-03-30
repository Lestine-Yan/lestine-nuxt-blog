<template>
  <NuxtLink :to="link">
  <div class="bg-white rounded-2xl my-8 w-full shadow-2xl pb-2 transition-transform duration-300 hover:-translate-y-2 hover:shadow-3xl animate-fade-up">
    <img :src="image" :alt="title" class="w-full h-48 object-cover rounded-t-lg transition-all">
    <div class="z-10 bg-white/10 pl-2 ml-4 mt-4">
      <h2 class="text-xl font-bold text-black mb-1">{{ title }}</h2>
      <p class="text-md text-gray-600 mb-2">{{ content }}</p>
    </div>
    <div class="flex ml-6">
      <img src="/images/clock.svg" class="w-4 h-4">
      <p class="text-sm text-gray-600">{{ date }}</p>
    </div>
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
  },
  image: {
    type: String,
    default: '/images/default.jpg'
  },
  date: {
    type: String,
    default: '2026-08-01'
  }
})
</script>

<style scoped>

@import '/assets/animates.css'

</style>