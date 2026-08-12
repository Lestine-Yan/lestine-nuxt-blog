<template>
  <NuxtLink :to="`/learn/${article.slug}`" class="block group">
    <div class="flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl transition-colors duration-300 group-hover:bg-[#FBF5FE]">
      <!-- 左：标题 / 时间·分类 / 摘要 -->
      <div class="flex-1 min-w-0">
        <h2 class="text-lg md:text-xl font-bold text-[#7E6AD0] mb-1.5 line-clamp-1">{{ article.title }}</h2>
        <div class="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-2">
          <span>{{ formatDate(article.created_at) }}</span>
          <template v-if="article.category">
            <span>·</span>
            <span class="text-[#7E6AD0]">{{ article.category }}</span>
          </template>
        </div>
        <p class="text-sm md:text-base text-gray-600 line-clamp-2">{{ article.summary }}</p>
      </div>
      <!-- 右：封面缩略图 -->
      <img
        v-if="article.cover_url"
        :src="article.cover_url"
        :alt="article.title"
        class="shrink-0 w-28 h-20 md:w-40 md:h-28 object-cover rounded-lg"
        loading="lazy"
      >
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ArticleListItem } from '~/types/margaret'

defineProps<{ article: ArticleListItem }>()
</script>
