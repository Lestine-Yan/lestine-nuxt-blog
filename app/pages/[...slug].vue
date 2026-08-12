<template>
  <!-- catch-all：本地 markdown 内容已迁至 Margaret，未知路径统一显示 404 -->
  <div class="min-h-[100dvh] z-10 flex flex-col items-center justify-center py-12 md:py-16 lg:py-24">
    <div class="flex flex-col items-center justify-center animate-fade-up">
      <img src="/images/svg/404.svg" alt="404" class="my-4 object-contain" />
      <p class="text-[#7E6AD0] text-2xl font-bold mt-4">未找到页面</p>
      <NuxtLink to="/" class="bg-[#7E6AD0] hover:opacity-80 px-8 py-2 mt-8 rounded-xl text-white text-2xl font-bold transition">回到首页</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
@import '~/assets/animates.css';
</style>
