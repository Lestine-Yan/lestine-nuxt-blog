<template>
  <div class="container mx-auto p-0 m-0">
    <!-- 引入并使用导航栏组件 -->
    <Navbar />
    <!-- 页面内容将通过 <Nuxt /> 插槽渲染 -->
    <main class="flex flex-col items-center justify-center">
      <NuxtPage />
    </main>
  </div>
  <div>
    <!-- 脚注 -->
    <footer class="w-full py-6 bg-white text-black">
      <div class="container mx-auto px-4 text-center">
        <p class="mb-2">© {{ new Date().getFullYear() }} Lestine Blog. All rights reserved.</p>
        <div class="flex justify-center items-center">
          <a href="https://beian.miit.gov.cn/" target="_blank" class="text-black hover:underline mx-2">
            <p class="text-md">赣ICP备2026007056号-1</p>
          </a>
          <a href="https://beian.mps.gov.cn/#/query/webSearch" target="_blank" class="flex text-black hover:underline mx-2">
            <img src="/images/logo.png" alt="logo" class="w-5 h-5 mr-1" />
            <p class="text-md">赣公网安备36073202360995号</p>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
<script setup>
// 引入组件
import Navbar from '~/components/navbar.vue';
</script>