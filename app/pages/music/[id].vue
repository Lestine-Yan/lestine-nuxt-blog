<template>
  <windowFrame narrow>
    <div>
      <!-- 返回 -->
      <NuxtLink to="/" class="inline-flex items-center text-[#7E6AD0] hover:opacity-70 transition mb-6 text-sm">← 返回首页</NuxtLink>

      <!-- 加载中 -->
      <div v-if="pending && !song" class="text-center text-gray-400 py-16">加载中…</div>

      <!-- 404 / 错误（含非数字 id，后端 400/404 均落此分支） -->
      <div v-else-if="error || !song" class="text-center py-16">
        <img src="/images/svg/404.svg" alt="404" class="mx-auto my-4 object-contain">
        <p class="text-[#7E6AD0] text-2xl font-bold mt-4">未找到歌曲</p>
        <NuxtLink to="/" class="inline-block bg-[#7E6AD0] hover:opacity-80 px-8 py-2 mt-8 rounded-xl text-white text-xl font-bold transition">返回首页</NuxtLink>
      </div>

      <!-- 歌曲感想正文 -->
      <article v-else>
        <!-- 头部：左侧封面（可点击播放，联动浮窗）+ 右侧歌名/元信息 -->
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          <button
            class="group relative h-40 w-40 md:h-44 md:w-44 shrink-0 overflow-hidden rounded-2xl shadow-lg transition"
            :class="isCurrent && player.isPlaying.value ? 'ring-2 ring-[#7E6AD0] ring-offset-2' : 'hover:opacity-90'"
            :aria-label="isCurrent && player.isPlaying.value ? '暂停' : '播放'"
            @click="onCoverClick"
          >
            <img :src="coverSrc" class="h-full w-full object-cover" alt="歌曲封面" @error="coverFailed = true">
            <!-- 播放/暂停悬浮指示 -->
            <span class="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
              <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#7E6AD0]/85 text-white opacity-0 transition group-hover:opacity-100" :class="{ 'opacity-100': isCurrent && player.isPlaying.value }">
                <svg v-if="isCurrent && player.isPlaying.value" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </span>
            </span>
          </button>

          <div class="min-w-0 w-full text-center sm:text-left">
            <h1 class="text-3xl md:text-4xl font-bold text-[#7E6AD0] mb-4">{{ song.title }}</h1>
            <div class="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-sm text-gray-500 pb-6 border-b border-[#7E6AD0]/15">
              <span v-if="song.artist">{{ song.artist }}</span>
              <span v-if="song.album" class="px-2 py-0.5 rounded-full bg-[#7E6AD0]/10 text-[#7E6AD0] text-xs">{{ song.album }}</span>
              <span v-if="song.year">{{ song.year }}</span>
              <span>{{ formatDuration(song.duration_seconds) }}</span>
              <span v-if="song.genre" class="text-xs text-gray-400">{{ song.genre }}</span>
            </div>
          </div>
        </div>

        <!-- 感想 Markdown（与随笔详情同构：parseMarkdown -> markdownRenderer/Prose*.vue） -->
        <markdownRenderer v-if="parsed" :value="parsed" />
        <p v-else-if="!song.write" class="text-center text-gray-400 py-12">这首歌曲还没有写感想。</p>
      </article>
    </div>
  </windowFrame>
</template>

<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const route = useRoute()
const player = usePlayer()
const id = computed(() => String(route.params.id ?? ''))
const { data: song, pending, error } = useSong(id)

// 与 learn/[slug] 同构：把感想 Markdown 解析为 AST 交给 markdownRenderer
const parsed = ref<any>(null)
watch(song, async (s) => {
  if (!s) {
    parsed.value = null
    return
  }
  try {
    parsed.value = await parseMarkdown(s.write || '')
  } catch (e) {
    console.error('[music/[id]] markdown 解析失败:', e)
    parsed.value = null
  }
}, { immediate: true })

// ---- 封面播放联动浮窗 ----
const isCurrent = computed(() => player.current.value?.id === song.value?.id)

function onCoverClick() {
  if (!song.value) return
  if (isCurrent.value) player.togglePlay()
  else player.playById(song.value.id) // 歌单未就绪时由 usePlayer 挂起补播
}

// 封面加载失败兜底
const coverFailed = ref(false)
watch(id, () => {
  coverFailed.value = false
})
const coverSrc = computed(() => (coverFailed.value ? '/images/svg/disc.svg' : songCover(song.value)))
</script>

<style scoped>
@import '~/assets/animates.css';
</style>
