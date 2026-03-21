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
  <div class="min-h-[100dvh] bg-white/90 w-full-no-scrollbar z-10 flex flex-col  py-24">
    <div class="w-2/5 flex flex-col mx-auto">
      <header></header>
      <ContentRenderer v-if="page" :value="page" />
      <div v-else class="flex items-center justify-center min-h-[50dvh]">
        <p class="text-gray-500">页面未找到</p>
      </div>
      <footer></footer>
    </div>
  </div>
</template>
