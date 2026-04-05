<template>
    <div class="w-[100dvw] md:w-full-no-scrollbar min-h-[100dvh] bg-white/70 z-10 flex flex-col  py-24 backdrop-blur-lg">
        <!--占位符，待完善-->
        <h1 class="text-4xl font-bold text-center py-16">友人帐</h1>
        <div class="md:flex mx-auto">
            <friendCard v-for="friend in friendLink" :key="friend.id" :image="friend.image" :name="friend.name" :description="friend.description" :url="friend.url" />
        </div>
    </div>
</template>

<script setup lang="ts">
import friendCard from '@/components/friendCard.vue'
import { friendLink } from '@/data/friendLink'
</script>

<style scoped>
@import '@/assets/fontstyle.css';
</style>