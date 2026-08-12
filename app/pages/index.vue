<template>
  <!-- 首页 -->
  <div class="w-full h-[100dvh] flex flex-col items-center justify-center animate-fade-up px-6 text-center">
    <!-- 博客主头像 -->
    <img src="/images/im.jpg" class="w-40 h-40 md:w-56 md:h-56 rounded-full mb-8 shadow-xl" alt="头像">
    <!-- 博客主名字 -->
    <h1 class="text-5xl md:text-7xl font-bold mb-4 text-[#D286D2]">Lestine</h1>
    <!-- 个性签名 -->
    <p class="text-4xl md:text-6xl text-[#C796D9]">梦想在远方，我在月球</p>
    <!-- GitHub 链接 -->
    <div class="flex space-x-4 mt-8">
      <a href="https://github.com/Lestine-Yan" target="_blank" class="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-[#C796D9]/40 hover:bg-[#C796D9]/15 hover:border-[#C796D9] transition-all duration-300">
        <img src="/images/gh.webp" class="w-8 h-8 rounded-full" alt="GitHub">
      </a>
    </div>
  </div>
</template>

<style scoped>
@import '/assets/animates.css'
</style>
