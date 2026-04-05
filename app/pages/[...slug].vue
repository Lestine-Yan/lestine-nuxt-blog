<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData(
  `page-${route.path}`,
  () => queryCollection('content').path(route.path).first(),
  {
    watch: [() => route.path]
  }
)
</script>

<template>
  <div class="min-h-[100dvh] bg-white/70 backdrop-blur-lg w-[100dvw] md:w-full-no-scrollbar z-10 flex flex-col py-12 md:py-16 lg:py-24">
    <article class="w-full px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col mx-auto animate-fade-up transition-all duration-300 max-w-3xl xl:max-w-4xl 2xl:max-w-4xl">
      <header></header>
      <ContentRenderer v-if="page" :value="page" />
      <div v-else class="flex items-center justify-center min-h-[50dvh]">
        <p class="text-gray-500">页面未找到</p>
      </div>
      <footer></footer>
    </article>
  </div>
</template>

<style scoped>
@import '/assets/animates.css';
</style>
