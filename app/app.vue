<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 背景层：坐标轴 + 呼吸虚线 + 参数曲线小猪（见 components/siteBackground.vue） -->
    <SiteBackground />
    <!-- layout=default -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

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
