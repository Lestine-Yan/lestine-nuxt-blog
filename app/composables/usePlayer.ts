import type { SongListItem } from '~/types/margaret'

/**
 * 全局音乐播放器（模块级单例 store）
 *
 * 只负责播放状态与唯一的 HTMLAudioElement，不拥有数据请求：
 * 歌单由全局挂载的 musicPlayer.vue 用 useSongs() 拉取后经 setPlaylist() 注入。
 * 所有状态初值确定，服务端不建 audio、不写入，SSR 安全。
 */

const STORAGE_KEY = 'lestine-player-v1'

interface PersistedState {
  songId: number | null
  position: number
  volume: number
}

// ---- 模块级单例状态（跨组件共享）----
const playlist = shallowRef<SongListItem[]>([])
const currentIndex = ref(-1)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const loadError = ref<string | null>(null)

let audio: HTMLAudioElement | null = null
let pendingPlayId: number | null = null // 歌单未就绪时的点播兜底，setPlaylist 时补播
let restoredAt = 0 // 刷新恢复的进度，loadedmetadata 后 seek
let restored = false // setPlaylist 只恢复一次 localStorage 状态
let persistTimer: ReturnType<typeof setTimeout> | undefined
let consecutiveErrors = 0

const current = computed<SongListItem | null>(() => playlist.value[currentIndex.value] ?? null)

function persist() {
  if (!import.meta.client) return
  try {
    const state: PersistedState = {
      songId: current.value?.id ?? null,
      position: Math.floor(currentTime.value),
      volume: volume.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 序列化/存储异常（隐私模式等）静默忽略
  }
}

// timeupdate 里节流持久化：约每 5 秒写一次
function schedulePersist() {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = undefined
    persist()
  }, 5000)
}

function readPersisted(): PersistedState | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p !== 'object' || p === null) return null
    return {
      songId: typeof p.songId === 'number' ? p.songId : null,
      position: typeof p.position === 'number' && p.position >= 0 ? p.position : 0,
      volume: typeof p.volume === 'number' && p.volume >= 0 && p.volume <= 1 ? p.volume : 0.8,
    }
  } catch {
    return null
  }
}

/**
 * 创建唯一的 audio 元素并绑定事件（仅客户端）
 */
function ensureAudio(): HTMLAudioElement | null {
  if (!import.meta.client) return null
  if (audio) return audio

  audio = new Audio()
  audio.preload = 'metadata'
  audio.volume = volume.value

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio!.currentTime
    schedulePersist()
  })
  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio!.duration || 0
    // 刷新恢复：metadata 就绪后定位到上次进度（不自动续播）
    if (restoredAt > 0) {
      audio!.currentTime = Math.min(restoredAt, duration.value || restoredAt)
      currentTime.value = audio!.currentTime
      restoredAt = 0
    }
  })
  audio.addEventListener('ended', () => {
    persist()
    next()
  })
  audio.addEventListener('error', () => {
    if (currentIndex.value < 0) return // 已停止（主动 stop）触发的 error 不处理
    loadError.value = '音频加载失败，请稍后再试'
    // 连续错误 <2 时自动跳下一首；>=2 停止，防止音源整体故障时死循环
    consecutiveErrors++
    if (consecutiveErrors < 2 && playlist.value.length > 1) next()
  })
  audio.addEventListener('playing', () => {
    consecutiveErrors = 0
  })
  audio.addEventListener('play', () => {
    isPlaying.value = true
  })
  audio.addEventListener('pause', () => {
    isPlaying.value = false
    persist()
  })
  audio.addEventListener('volumechange', () => {
    volume.value = audio!.volume
  })
  window.addEventListener('pagehide', persist)

  return audio
}

/**
 * musicPlayer.vue 拿到歌单后注入；首次注入时执行 localStorage 恢复（暂停态）
 */
function setPlaylist(songs: SongListItem[]) {
  playlist.value = songs ?? []
  const a = ensureAudio()
  if (!a) return

  if (!restored) {
    restored = true
    const saved = readPersisted()
    if (saved) {
      volume.value = saved.volume
      a.volume = saved.volume
      const idx = saved.songId == null ? -1 : songs.findIndex(s => s.id === saved.songId)
      if (idx >= 0) {
        currentIndex.value = idx
        restoredAt = saved.position
        // preload='metadata' 只拉元数据，loadedmetadata 后 seek 到上次进度；isPlaying 恒 false
        a.src = songs[idx].url
      }
    }
  } else if (current.value) {
    // 歌单刷新：保持当前歌曲（若已不在列表中则停止）
    const idx = songs.findIndex(s => s.id === current.value!.id)
    if (idx >= 0) currentIndex.value = idx
    else stop()
  }

  // 补放歌单未就绪时的点播请求（如直接落地 /music/[id] 即点播放）
  if (pendingPlayId != null) {
    const idx = songs.findIndex(s => s.id === pendingPlayId)
    pendingPlayId = null
    if (idx >= 0) playIndex(idx)
  }
}

function stop() {
  const a = audio
  if (a) {
    a.pause()
    a.removeAttribute('src')
    a.load()
  }
  currentIndex.value = -1
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
  persist()
}

/**
 * 播放指定下标（环形），均在用户手势链路内调用
 */
function playIndex(i: number) {
  const n = playlist.value.length
  if (!n) return
  const idx = ((i % n) + n) % n
  const song = playlist.value[idx]
  const a = ensureAudio()
  if (!a) return
  currentIndex.value = idx
  loadError.value = null
  currentTime.value = 0
  // metadata 加载前先展示列表给的时长
  duration.value = song.duration_seconds || 0
  restoredAt = 0
  a.src = song.url
  a.play().catch(() => {
    isPlaying.value = false
  })
}

/**
 * 按 id 点播（详情页封面点击等场景）；歌单未就绪时挂起待补播
 */
function playById(id: number) {
  if (current.value?.id === id) {
    togglePlay()
    return
  }
  const idx = playlist.value.findIndex(s => s.id === id)
  if (idx >= 0) playIndex(idx)
  else pendingPlayId = id
}

function togglePlay() {
  const a = ensureAudio()
  if (!a) return
  if (!current.value) {
    playIndex(0)
    return
  }
  if (a.paused) a.play().catch(() => { isPlaying.value = false })
  else a.pause()
}

function next() {
  if (playlist.value.length) playIndex(currentIndex.value + 1)
}

function prev() {
  if (!playlist.value.length) return
  // 播放超过 3 秒先回到开头，否则上一首（业界惯例）
  if (currentTime.value > 3) seek(0)
  else playIndex(currentIndex.value - 1)
}

function seek(t: number) {
  const a = ensureAudio()
  if (!a) return
  const d = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : duration.value
  if (d > 0) a.currentTime = Math.min(Math.max(t, 0), d)
  currentTime.value = a.currentTime
}

function setVolume(v: number) {
  const a = ensureAudio()
  volume.value = Math.min(Math.max(v, 0), 1)
  if (a) a.volume = volume.value
  persist()
}

export function usePlayer() {
  return {
    playlist: readonly(playlist),
    current,
    isPlaying: readonly(isPlaying),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    volume: readonly(volume),
    loadError: readonly(loadError),
    setPlaylist,
    playIndex,
    playById,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  }
}
