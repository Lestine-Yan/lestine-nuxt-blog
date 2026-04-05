<template>
    <a :href="url" target="_blank">
    <div class=" bg-white/50 hover:bg-white/70 shadow-md hover:shadow-xl p-6 rounded-md  w-[200px] h-[200px] m-4 border border-white transition-all duration-300 animate-fade-up">
        <img :src="image" alt="友链" class="w-24 h-24 rounded-full mx-auto">
        <h2 class="text-lg font-bold my-1">{{ name }}</h2>
        <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
    </a>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
    url: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    
})
</script>

<style scoped>

@import '/assets/animates.css'

</style>