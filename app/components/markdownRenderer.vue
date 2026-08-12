<template>
  <!-- 用 @nuxtjs/mdc 的 MDCRenderer 渲染 parseMarkdown 产出的 AST，显式映射 24 个 Prose*.vue 覆盖样式 -->
  <MDCRenderer v-if="value?.body" :body="value.body" :components="components" :prose="false" />
</template>

<script setup lang="ts">
import MDCRenderer from '@nuxtjs/mdc/runtime/components/MDCRenderer.vue'
import ProseA from './content/ProseA.vue'
import ProseBlockquote from './content/ProseBlockquote.vue'
import ProseCode from './content/ProseCode.vue'
import ProseEm from './content/ProseEm.vue'
import ProseH1 from './content/ProseH1.vue'
import ProseH2 from './content/ProseH2.vue'
import ProseH3 from './content/ProseH3.vue'
import ProseH4 from './content/ProseH4.vue'
import ProseH5 from './content/ProseH5.vue'
import ProseH6 from './content/ProseH6.vue'
import ProseHr from './content/ProseHr.vue'
import ProseImg from './content/ProseImg.vue'
import ProseLi from './content/ProseLi.vue'
import ProseOl from './content/ProseOl.vue'
import ProseP from './content/ProseP.vue'
import ProsePre from './content/ProsePre.vue'
import ProseStrong from './content/ProseStrong.vue'
import ProseTable from './content/ProseTable.vue'
import ProseTbody from './content/ProseTbody.vue'
import ProseTd from './content/ProseTd.vue'
import ProseTh from './content/ProseTh.vue'
import ProseThead from './content/ProseThead.vue'
import ProseTr from './content/ProseTr.vue'
import ProseUl from './content/ProseUl.vue'

defineProps<{ value: any }>()

// markdown 标签 -> Prose 组件的映射（替代 @nuxt/content 的 prose 映射）
const components = {
  p: ProseP,
  a: ProseA,
  blockquote: ProseBlockquote,
  code: ProseCode,
  pre: ProsePre,
  em: ProseEm,
  h1: ProseH1,
  h2: ProseH2,
  h3: ProseH3,
  h4: ProseH4,
  h5: ProseH5,
  h6: ProseH6,
  hr: ProseHr,
  img: ProseImg,
  ul: ProseUl,
  ol: ProseOl,
  li: ProseLi,
  strong: ProseStrong,
  table: ProseTable,
  thead: ProseThead,
  tbody: ProseTbody,
  td: ProseTd,
  th: ProseTh,
  tr: ProseTr
}
</script>
