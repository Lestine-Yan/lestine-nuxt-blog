<template>
  <div class="w-full-no-scrollbar min-h-[100dvh] bg-white/70 z-10 flex flex-col  py-24 backdrop-blur-lg">
    <h1 class="text-4xl font-bold text-center py-16">杂谈</h1>
    <div class="w-full px-12 lg:w-[912px] lg:px-0 mx-auto">
      <blogPostCard v-for="post in posts" :key="post.id" :title="post.title" :content="post.content" :link="post.link" :image="post.image"/>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/fontstyle.css';
</style>

<script setup lang="ts">
import blogPostCard from '@/components/blogPostCard.vue'
import { posts } from '@/data/talkPostCardItems'
</script>