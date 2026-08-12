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
