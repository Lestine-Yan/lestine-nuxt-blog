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
      <div v-else class="mx-auto items-center justify-center flex flex-col min-h-[50dvh] ">
        <img src="/images/svg/404.svg" alt="404" class="my-4 object-contain" />
        <p class="text-red-700 text-2xl font-bold mt-4">未找到页面</p>
        <NuxtLink to="/" class="bg-red-700 hover:bg-red-400 hover:shadow-md px-8 py-2 mt-8 rounded-xl text-white  text-2xl font-bold  transition-all duration-300 ">回到首页</NuxtLink>
      </div>
      <footer></footer>
    </article>
  </div>
</template>

<style scoped>
@import '/assets/animates.css';
</style>
