// Margaret API 类型定义
// 统一响应体 { code, message, data }，code===0 成功

/** 统一响应体外壳 */
export interface ApiResponse<T> {
  code: number
  message: string
  data?: T
}

/** 分页数据 */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

/** 文章列表项（不含正文） */
export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary: string
  cover_url: string
  category: string
  tags: string[]
  created_at: string
  updated_at: string
}

/** 文章详情（含 Markdown 正文） */
export interface Article extends ArticleListItem {
  content: string
  status: string
}

/** 歌曲列表项（GET /songs 全量返回，音频为 irisImg 绝对直链） */
export interface SongListItem {
  id: number
  url: string
  title: string
  artist: string
  album: string
  duration_seconds: number
  embedded_cover_url: string
  cover_url: string
  created_at: string
}

/** 歌曲列表响应（全量不分页，无 page/page_size，勿复用 Paginated） */
export interface SongListResult {
  items: SongListItem[]
  total: number
}

/** 歌曲详情（含感想 Markdown，仅详情接口返回 write） */
export interface Song extends SongListItem {
  album_artist: string
  composer: string
  genre: string
  year: number
  track_number: number
  disc_number: number
  write: string
  updated_at: string
}
