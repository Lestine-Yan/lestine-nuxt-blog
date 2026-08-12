<template>
  <!-- 内容窗口：浮在装饰背景上的 #FDFDF2 卡片容器 -->
  <div class="w-full px-4 md:px-6 py-24 md:py-28 flex justify-center">
    <div :class="['w-full bg-[#FDFDF2] rounded-2xl shadow-xl p-6 md:p-10 animate-fade-up transition-[max-width] duration-300 ease-in-out', narrow ? 'max-w-3xl' : 'max-w-4xl']">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** 详情页用窄一些的宽度以提升阅读体验 */
  narrow?: boolean
}>()
</script>

<style scoped>
@import '~/assets/animates.css';
</style>
