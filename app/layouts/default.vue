<template>
  <div class="container mx-auto p-0 m-0">
    <!-- 引入并使用导航栏组件 -->
    <Navbar />
    <!-- 页面内容将通过 <Nuxt /> 插槽渲染 -->
    <main class="flex flex-col items-center justify-center">
      <NuxtPage />
    </main>
  </div>
</template>
<script setup>
// 引入组件
import Navbar from '~/components/navbar.vue';
</script>