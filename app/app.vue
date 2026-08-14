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
  scrollbar-color: rgba(126, 106, 208, 0.5) transparent;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(126, 106, 208, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(126, 106, 208, 0.8);
}

/* 鼠标选中文本：淡紫底，字体颜色保持不变 */
::selection {
  background: #F3DCFF;
}
</style>
