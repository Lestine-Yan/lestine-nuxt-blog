<template>
  <div class="relative my-6 rounded-xl overflow-hidden border border-[#7E6AD0]/15 shadow-sm">
    <div v-if="filename" class="bg-[#352D48] text-[#AC9EE5] text-xs font-mono px-4 py-2 border-b border-[#2A2438]">
      {{ filename }}
    </div>
    <!-- :class="class" 承载 Shiki 注入的 shiki 类，使 html .shiki span{color:var(--shiki-default)} 生效 -->
    <pre class="overflow-x-auto p-4 text-sm leading-relaxed font-mono bg-[#2A2438] text-[#E8E4F5]" :class="class" :language="language"><slot /></pre>
  </div>
</template>

<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: undefined
  },
  filename: {
    type: String,
    default: undefined
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  },
  meta: {
    type: String,
    default: undefined
  },
  class: {
    type: String,
    default: undefined
  }
})
</script>

<style scoped>
/* Shiki 按行输出 <span class="line">，需块级显示以正确换行 */
:deep(.line) {
  display: block;
}
</style>
