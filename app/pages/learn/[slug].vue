<template>
  <div>
    <!-- 返回 -->
    <NuxtLink to="/learn" class="inline-flex items-center text-[#7E6AD0] hover:opacity-70 transition mb-6 text-sm">← 返回随笔</NuxtLink>

    <!-- 加载中 -->
    <div v-if="pending && !article" class="text-center text-gray-400 py-16">加载中…</div>

    <!-- 404 / 错误 -->
    <div v-else-if="error || !article" class="text-center py-16">
      <img src="/images/svg/404.svg" alt="404" class="mx-auto my-4 object-contain">
      <p class="text-[#7E6AD0] text-2xl font-bold mt-4">未找到文章</p>
      <NuxtLink to="/learn" class="inline-block bg-[#7E6AD0] hover:opacity-80 px-8 py-2 mt-8 rounded-xl text-white text-xl font-bold transition">返回随笔</NuxtLink>
    </div>

    <!-- 文章正文 -->
    <article v-else>
      <h1 class="text-3xl md:text-4xl font-bold text-[#7E6AD0] mb-4">{{ article.title }}</h1>
      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-8 pb-6 border-b border-[#7E6AD0]/15">
        <span>{{ formatDate(article.created_at) }}</span>
        <span v-if="article.category" class="px-2 py-0.5 rounded-full bg-[#7E6AD0]/10 text-[#7E6AD0] text-xs">{{ article.category }}</span>
        <div v-if="article.tags && article.tags.length" class="flex flex-wrap gap-1.5">
          <span v-for="t in article.tags" :key="t" class="text-xs text-gray-400">#{{ t }}</span>
        </div>
      </div>
      <markdownRenderer v-if="parsed" :value="parsed" />
    </article>
  </div>
</template>

<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const { data: article, pending, error } = useArticle(slug)

// 把 API 返回的 Markdown 正文解析为 AST，经 markdownRenderer(MDCRenderer) 渲染，复用 Prose*.vue 样式
const parsed = ref<any>(null)
watch(article, async (a) => {
  if (!a) {
    parsed.value = null
    return
  }
  try {
    parsed.value = await parseMarkdown(a.content)
  } catch (e) {
    console.error('[learn/[slug]] markdown 解析失败:', e)
    parsed.value = null
  }
}, { immediate: true })
</script>
