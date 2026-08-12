import type { Ref } from 'vue'
import type { ApiResponse, Paginated, ArticleListItem, Article } from '~/types/margaret'

/** Margaret API 基础路径（相对 /api/v1，由 Nginx/devProxy 转发） */
const useApiBase = () => useRuntimeConfig().public.margaretApiBase as string

/**
 * 文章列表（客户端拉取，分页 + 分类筛选，时间降序）
 */
export function useArticles(page: Ref<number>, pageSize: number, category: Ref<string>) {
  return useFetch<ApiResponse<Paginated<ArticleListItem>>>('/articles', {
    baseURL: useApiBase(),
    query: {
      page,
      page_size: pageSize,
      category,
      order: 'desc',
    },
    server: false,
    transform: (r: ApiResponse<Paginated<ArticleListItem>>) => r.data,
    watch: [page, category],
  })
}

/**
 * 文章详情（按 slug 客户端拉取）
 */
export function useArticle(slug: Ref<string>) {
  return useFetch<ApiResponse<Article>>(() => `/articles/${slug.value}`, {
    baseURL: useApiBase(),
    server: false,
    transform: (r: ApiResponse<Article>) => r.data,
    watch: [slug],
  })
}

/**
 * 分类列表（已发布文章去重分类）
 */
export function useCategories() {
  return useFetch<ApiResponse<string[]>>('/categories', {
    baseURL: useApiBase(),
    server: false,
    transform: (r: ApiResponse<string[]>) => r.data,
  })
}
