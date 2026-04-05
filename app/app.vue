<template>
  <!-- 全局布局，比如一个容器 -->
  <div class="bg-[url('/images/example-app-bg.png')] bg-fixed bg-cover bg-center bg-no-repeat z-[-1]">
    <!-- layout=default -->
     <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// 可以在这里进行全局的状态初始化等
</script>

<style>
/* 全局样式 */
html {
  overflow-y: auto;
  scrollbar-gutter: stable;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(127, 29, 29, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(127, 29, 29, 0.8);
}
</style>