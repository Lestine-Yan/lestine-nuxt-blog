<template>
  <div class="absolute bottom-full left-0 mb-2 w-full max-h-56 overflow-y-auto rounded-xl border border-white/90 bg-white/90 p-1.5 shadow-lg backdrop-blur-lg">
    <p v-if="!songs.length" class="py-4 text-center text-sm text-gray-400">暂无歌曲</p>
    <ul v-else>
      <li v-for="(s, i) in songs" :key="s.id">
        <div
          class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition"
          :class="s.id === currentId ? 'bg-[#FBF5FE]' : 'hover:bg-[#FBF5FE]/70'"
          @click="$emit('select', i)"
        >
          <img :src="songCover(s)" class="h-9 w-9 shrink-0 rounded object-cover" loading="lazy" alt="">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm" :class="s.id === currentId ? 'font-medium text-[#7E6AD0]' : ''">{{ s.title }}</p>
            <p class="truncate text-xs text-gray-400">{{ s.artist }}</p>
          </div>
          <span class="shrink-0 text-xs text-gray-400">{{ formatDuration(s.duration_seconds) }}</span>
          <NuxtLink
            :to="`/music/${s.id}`"
            class="shrink-0 text-gray-300 transition hover:text-[#7E6AD0]"
            aria-label="查看歌曲感想"
            @click.stop
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3v10.55A4 4 0 1 0 11 17V7h6V3z"/></svg>
          </NuxtLink>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { SongListItem } from '~/types/margaret'

defineProps<{
  songs: SongListItem[]
  currentId?: number
}>()

defineEmits<{
  select: [index: number]
}>()
</script>
