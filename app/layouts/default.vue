<template>
  <div>
    <!-- 引入并使用导航栏组件 -->
    <Navbar />
    <!-- 页面内容将通过 <Nuxt /> 插槽渲染 -->
    <main class="container mx-auto p-5">
      <slot />
    </main>
  </div>
</template>
<script setup>
// 引入组件
import Navbar from '~/components/navbar.vue';
</script>