<template>
  <!-- 父级窗口：在 /learn 与 /learn/[slug] 之间切换时保持挂载，只重新加载 NuxtPage 内容 -->
  <windowFrame :narrow="isDetail">
    <NuxtPage />
  </windowFrame>
</template>

<script setup lang="ts">
const route = useRoute()
// 详情页用窄窗口提升阅读体验，列表页用宽窗口；切换时 windowFrame 宽度平滑过渡
const isDetail = computed(() => !!route.params.slug)
</script>
