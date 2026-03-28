<template>
  <NuxtLink :to="link">
  <div class="border-solid border-2 border-red-800 rounded-lg p-3 my-8 w-full shadow-2xl">
    <img :src="image" :alt="title" class="w-full h-40 object-cover rounded-t-lg mb-2">
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
  },
  image: {
    type: String,
    default: '/images/default.jpg'
  }
})
</script>