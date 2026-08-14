<template>
  <div>
    <!-- 标题 -->
    <h1 class="text-4xl font-bold text-center text-[#7E6AD0] tracking-[0.15em] mb-8">随笔</h1>

    <!-- 分类筛选 -->
    <div v-if="categories && categories.length" class="flex flex-wrap items-center justify-center gap-2 mb-8">
      <button @click="selectCategory('')" :class="filterBtnClass(category === '')">全部</button>
      <button v-for="c in categories" :key="c" @click="selectCategory(c)" :class="filterBtnClass(category === c)">{{ c }}</button>
    </div>

    <!-- 文章列表 -->
    <div v-if="pending && !data" class="text-center text-gray-400 py-16">加载中…</div>
    <div v-else-if="error" class="text-center py-16">
      <p class="text-gray-500 mb-4">加载失败，请稍后重试</p>
      <button @click="refresh()" class="px-4 py-2 rounded-lg bg-[#7E6AD0] text-white hover:opacity-80 transition">重试</button>
    </div>
    <div v-else-if="data && data.items.length === 0" class="text-center text-gray-400 py-16">暂无文章</div>
    <div v-else class="flex flex-col divide-y divide-[#7E6AD0]/10">
      <articleCard v-for="post in data?.items" :key="post.id" :article="post" />
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        @click="gotoPage(page - 1)"
        :disabled="page <= 1"
        class="px-3 h-9 rounded-lg bg-white/60 text-[#7E6AD0] text-sm border border-[#7E6AD0]/30 hover:bg-[#FBF5FE] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >上一页</button>
      <template v-for="(p, i) in pageList" :key="i">
        <span v-if="p === '...'" class="text-gray-400 px-1">…</span>
        <button v-else @click="gotoPage(p as number)" :class="pageBtnClass(p === page)">{{ p }}</button>
      </template>
      <button
        @click="gotoPage(page + 1)"
        :disabled="page >= totalPages"
        class="px-3 h-9 rounded-lg bg-white/60 text-[#7E6AD0] text-sm border border-[#7E6AD0]/30 hover:bg-[#FBF5FE] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const pageSize = 10
const page = ref(Number(route.query.page) || 1)
const category = ref((route.query.category as string) || '')

const { data, pending, error, refresh } = useArticles(page, pageSize, category)
const { data: categories } = useCategories()

const totalPages = computed(() => (data.value ? Math.ceil(data.value.total / pageSize) : 1))

const pageList = computed<(number | string)[]>(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set<number>([1, total, cur, cur - 1, cur + 1, cur - 2, cur + 2])
  const sorted = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: (number | string)[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push('...')
    result.push(p)
    prev = p
  }
  return result
})

function filterBtnClass(active: boolean) {
  return active
    ? 'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 bg-[#FBF5FE] text-[#7E6AD0]'
    : 'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 text-black hover:bg-[#FBF5FE] hover:text-[#7E6AD0]'
}
function pageBtnClass(active: boolean) {
  return active
    ? 'w-9 h-9 rounded-lg bg-[#7E6AD0] text-white text-sm transition'
    : 'w-9 h-9 rounded-lg bg-white/60 text-[#7E6AD0] text-sm border border-[#7E6AD0]/30 hover:bg-[#FBF5FE] transition'
}

function selectCategory(c: string) {
  category.value = c
  page.value = 1
  router.replace({ query: { category: c || undefined, page: undefined } })
}
function gotoPage(p: number) {
  if (p < 1 || p > totalPages.value || p === page.value) return
  page.value = p
  router.replace({ query: { category: category.value || undefined, page: p === 1 ? undefined : p } })
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
