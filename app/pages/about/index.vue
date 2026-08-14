<template>
  <windowFrame narrow>
    <!-- 资料卡：头像 + 右侧竖直（名字 + 个签），整体左对齐 -->
    <div class="flex items-center gap-5">
      <img src="/images/im.jpg" alt="头像" class="w-24 h-24 md:w-28 md:h-28 rounded-full shadow-lg shrink-0">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl md:text-4xl font-bold text-[#7E6AD0]">Lestine</h1>
        <p class="text-xl md:text-2xl text-[#AC9EE5]">梦想在远方，我在月球</p>
      </div>
    </div>

    <!-- 关于我介绍 -->
    <section class="mt-10">
      <h2 class="text-2xl font-bold text-[#7E6AD0] mb-3">关于我</h2>
      <p class="text-gray-600 leading-relaxed">
        Lestine，一个乐子人大学生，喜欢折腾电子产品，打打游戏，搞点小项目。
      </p>
    </section>

    <!-- 大学进度：2025.9.1 → 2029.6.30 转百分制，不显示日期 -->
    <section class="mt-10">
      <h2 class="text-2xl font-bold text-[#7E6AD0] mb-3">大学</h2>
      <div class="flex items-center justify-between mb-2">
        <span class="text-[#5B4B9E]">专业：网络空间安全</span>
        <span class="text-[#7E6AD0] font-bold">{{ progress.toFixed(1) }}%</span>
      </div>
      <div class="h-3 rounded-full bg-[#7E6AD0]/15 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-[#AC9EE5] to-[#7E6AD0] transition-all duration-1000 ease-out"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </section>
  </windowFrame>
</template>

<script setup lang="ts">
// 学制起止：2025-09-01 ~ 2029-06-30（本地时区；月份 0-indexed）
const START = new Date(2025, 8, 1).getTime()
const END = new Date(2029, 5, 30).getTime()

// ref(0) 初始值：SSR 与 hydrate 一致，避免 hydration mismatch；onMounted 用真实当前时间更新
const progress = ref(0)

onMounted(() => {
  const p = ((Date.now() - START) / (END - START)) * 100
  progress.value = Math.max(0, Math.min(100, p))
})
</script>
