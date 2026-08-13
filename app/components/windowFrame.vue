<template>
  <!-- 内容窗口：透明、无边框、无阴影，直接融入全局背景；仅保留宽度与内边距约束阅读列 -->
  <div class="w-full px-4 md:px-6 py-24 md:py-28 flex justify-center">
    <div :class="['w-full p-6 md:p-10 animate-fade-up transition-[max-width] duration-300 ease-in-out', narrow ? 'max-w-3xl' : 'max-w-4xl']">
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
