<!-- components/Navbar.vue -->
<template>
  <header class="py-3 z-50 fixed inset-x-0 ">
    <div class="container mx-auto flex justify-center">
      <nav class="bg-white/40 backdrop-blur-lg rounded-full px-10 py-3 shadow-lg border border-white/30">
        <ul class="flex space-x-8 text-center">
          <li><NuxtLink to="/" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">首页</NuxtLink></li>
          <li><NuxtLink to="/talk" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">杂谈</NuxtLink></li>
          <li><NuxtLink to="/learn" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">笔录</NuxtLink></li>
          <li><NuxtLink to="/about" class="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-700 hover:text-white">关于我</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>
</template>