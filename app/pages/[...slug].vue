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
  <div class=" min-h-[100dvh] bg-white/90 w-[99dvw] z-10 flex flex-col items-center py-24">
    <header></header>
      <ContentRenderer v-if="page" :value="page" />
      <div v-else class="flex items-center justify-center min-h-[50dvh]">
        <p class="text-gray-500">页面未找到</p>
      </div>
    <footer></footer>
  </div>
</template>
