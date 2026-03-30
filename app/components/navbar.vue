<!-- components/Navbar.vue -->
<template>
  <header class="py-4 mx-auto z-50 container flex justify-center fixed inset-x-0 animate-slide-down">
    <div class=" m-0 flex justify-center">
      <nav class="bg-white/50 backdrop-blur-lg rounded-full px-10 py-3 shadow-lg border border-white/50">
        <ul class="flex  text-center">
          <li><NuxtLink to="/" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">首页</NuxtLink></li>
          <li><NuxtLink to="/talk" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">杂谈</NuxtLink></li>
          <li><NuxtLink to="/learn" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">随笔</NuxtLink></li>
          <li><NuxtLink to="/myfriends" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">友人帐</NuxtLink></li>
          <li><NuxtLink to="/about" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">关于我</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>

@import '/assets/animates.css'

</style>
