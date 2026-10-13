<template>
  <ClientOnly>
    <div v-if="player.playlist.value.length" class="fixed bottom-4 left-4 z-20 select-none">
      <!-- 展开面板：锚在浮窗上方 -->
      <div
        v-if="expanded"
        class="absolute bottom-14 left-0 w-[calc(100vw-2rem)] max-w-xs animate-pop-up rounded-2xl border border-white/90 bg-white/70 p-4 shadow-lg backdrop-blur-lg"
        role="region"
        aria-label="音乐播放器"
      >
        <!-- 播放列表弹层 -->
        <musicPlayerPlaylist
          v-if="showPlaylist"
          :songs="player.playlist.value"
          :current-id="player.current.value?.id"
          @select="onPlaylistSelect"
        />

        <!-- 头部：封面 + 歌名/歌手 -->
        <div class="flex items-center gap-3">
          <img
            :src="coverSrc"
            class="h-14 w-14 shrink-0 rounded-full animate-disc-spin"
            :class="{ 'is-paused': !player.isPlaying.value }"
            alt="歌曲封面"
            @error="coverFailed = true"
          >
          <div class="min-w-0">
            <p class="truncate font-medium">{{ player.current.value?.title || '未在播放' }}</p>
            <p class="truncate text-sm text-gray-500">{{ player.current.value?.artist }}</p>
          </div>
        </div>

        <!-- 进度条（可拖拽）+ 双侧时间 -->
        <div class="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <span class="shrink-0 tabular-nums">{{ formatDuration(player.currentTime.value) }}</span>
          <div
            ref="barEl"
            class="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-[#7E6AD0]/15"
            @pointerdown="onBarDown"
            @pointermove="onBarMove"
            @pointerup="onBarUp"
            @pointercancel="onBarUp"
          >
            <div class="absolute inset-y-0 left-0 rounded-full bg-[#7E6AD0]" :style="{ width: progressPct }" />
            <div
              class="absolute top-1/2 -ml-1.5 h-3 w-3 rounded-full bg-[#7E6AD0] opacity-0 transition-opacity group-hover:opacity-100"
              :style="{ left: progressPct }"
            />
          </div>
          <span class="shrink-0 tabular-nums">{{ formatDuration(totalDuration) }}</span>
        </div>

        <!-- 错误提示 -->
        <p v-if="player.loadError.value" class="mt-2 text-xs text-red-400">{{ player.loadError.value }}</p>

        <!-- 按钮组 -->
        <div class="mt-3 flex items-center justify-between">
          <button
            class="text-gray-600 transition hover:text-[#7E6AD0]"
            aria-label="上一首"
            @click="player.prev()"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>
          </button>
          <button
            class="text-[#7E6AD0] transition hover:opacity-70"
            aria-label="播放/暂停"
            @click="player.togglePlay()"
          >
            <svg v-if="player.isPlaying.value" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
            <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button
            class="text-gray-600 transition hover:text-[#7E6AD0]"
            aria-label="下一首"
            @click="player.next()"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>
          </button>
          <button
            class="text-gray-600 transition hover:text-[#7E6AD0]"
            aria-label="播放列表"
            @click="showPlaylist = !showPlaylist"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h12v2H3zM3 11h12v2H3zM3 16h8v2H3z"/><path d="M16 13l6 3.5-6 3.5z"/></svg>
          </button>
          <NuxtLink
            v-if="player.current.value"
            :to="`/music/${player.current.value.id}`"
            class="text-gray-600 transition hover:text-[#7E6AD0]"
            aria-label="查看歌曲感想"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3z"/></svg>
          </NuxtLink>
          <span v-else class="inline-block h-5 w-5 text-gray-300" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3z"/></svg>
          </span>
          <button
            class="text-gray-600 transition hover:text-[#7E6AD0]"
            aria-label="收起播放器"
            @click="expanded = false"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- 未激活态：封面小圆浮窗 -->
      <button
        class="h-12 w-12 overflow-hidden rounded-full border border-white/90 bg-white/70 shadow-lg backdrop-blur-lg transition hover:scale-105 animate-disc-spin"
        :class="{ 'is-paused': !player.isPlaying.value }"
        aria-label="展开音乐播放器"
        @click="expanded = true"
      >
        <img :src="coverSrc" class="h-full w-full object-cover" alt="歌曲封面" @error="coverFailed = true">
      </button>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// 全局唯一的歌单请求（musicPlayer 挂在 app.vue，任意路由只拉一次）
const { data: songsData } = useSongs()
const player = usePlayer()
watch(songsData, d => d && player.setPlaylist(d.items))

// UI 状态（局部持有，刷新后恒为收起态）
const expanded = ref(false)
const showPlaylist = ref(false)
const coverFailed = ref(false)

// 当前歌曲变化时重置封面加载失败标记
watch(() => player.current.value?.id, () => {
  coverFailed.value = false
})

const coverSrc = computed(() => (coverFailed.value ? '/images/svg/disc.svg' : songCover(player.current.value)))

// ---- 进度条 ----
const barEl = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragRatio = ref(0)

const totalDuration = computed(() => player.duration.value || player.current.value?.duration_seconds || 0)

function rawRatio() {
  const d = totalDuration.value
  return d > 0 ? player.currentTime.value / d : 0
}

const progressPct = computed(() => {
  const ratio = dragging.value ? dragRatio.value : rawRatio()
  return `${Math.min(100, Math.max(0, ratio * 100))}%`
})

function ratioFromEvent(e: PointerEvent) {
  const el = barEl.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
}

function onBarDown(e: PointerEvent) {
  dragging.value = true
  dragRatio.value = ratioFromEvent(e)
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onBarMove(e: PointerEvent) {
  if (!dragging.value) return
  dragRatio.value = ratioFromEvent(e)
}

function onBarUp() {
  if (!dragging.value) return
  dragging.value = false
  const d = totalDuration.value
  if (d > 0) player.seek(dragRatio.value * d)
}

function onPlaylistSelect(index: number) {
  player.playIndex(index)
  showPlaylist.value = false
}
</script>

<style scoped>
@import '~/assets/animates.css';
</style>
