<template>
  <a :href="url" target="_blank" class="block h-full">
    <div class="bg-white/50 hover:bg-[#FBF5FE]/70 shadow-md hover:shadow-xl p-6 rounded-xl h-full flex flex-col items-center text-center border border-[#7E6AD0]/15 hover:border-[#7E6AD0]/40 transition-all duration-300 animate-fade-up">
      <img :src="image" alt="友链" class="w-24 h-24 rounded-full ring-2 ring-[#AC9EE5]/40">
      <h2 class="text-lg font-bold my-2 text-[#5B4B9E]">{{ name }}</h2>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
  </a>
</template>

<script setup lang="ts">
defineProps({
  url: { type: String, default: '' },
  image: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<style scoped>
@import '/assets/animates.css'
</style>
