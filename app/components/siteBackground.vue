<template>
  <div class="bg-layer" aria-hidden="true">
    <!-- 坐标轴层：以视窗中心为原点的四象限坐标轴 + 固定像素正方形网格 + 全交点小圆点 + 刻度数字，整体 CSS 呼吸 -->
    <svg class="axes" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g class="axes-breathe" :class="{ 'no-anim': reduceMotion }">
        <g v-if="grid">
          <!-- 非轴网格线：固定 64px 间距，较淡虚线 -->
          <line v-for="l in grid.vlines" :key="`v${l.k}`" class="grid" :x1="l.x" :y1="0" :x2="l.x" :y2="viewH" />
          <line v-for="l in grid.hlines" :key="`h${l.k}`" class="grid" :x1="0" :y1="l.y" :x2="viewW" :y2="l.y" />
          <!-- x / y 轴：k=0 两条加重虚线，保留原色 #AC9EE5 -->
          <line class="axis" :x1="0" :y1="grid.cy" :x2="viewW" :y2="grid.cy" />
          <line class="axis" :x1="grid.cx" :y1="0" :x2="grid.cx" :y2="viewH" />
          <!-- 全部网格交点：深色小圆点（仅比虚线宽略大） -->
          <circle v-for="(d, i) in grid.dots" :key="`d${i}`" class="dot" :cx="d.x" :cy="d.y" :r="DOT_R" />
          <!-- x 轴刻度数字：居中，置于 x 轴下方 -->
          <text v-for="(lb, i) in grid.xLabels" :key="`xl${i}`" class="label" :x="lb.x" :y="grid.cy + 14" text-anchor="middle">{{ lb.text }}</text>
          <!-- y 轴刻度数字：右对齐，置于 y 轴左侧（向上为正） -->
          <text v-for="(lb, i) in grid.yLabels" :key="`yl${i}`" class="label" :x="grid.cx - 8" :y="lb.y + 3" text-anchor="end">{{ lb.text }}</text>
        </g>
      </g>
    </svg>
    <!-- 飘浮符号层：数学符号/希腊字符，左下->右上慢飘 + 自旋 + 左右轻摆，越界回收补新 -->
    <svg class="symbols" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g v-for="sym in symbols" :key="sym.id"
         class="symbol-drift"
         :style="driftStyle(sym)">
        <g class="symbol-sway" :style="swayStyle(sym)">
          <text class="symbol-spin" :style="spinStyle(sym)">{{ sym.char }}</text>
        </g>
      </g>
    </svg>
    <!-- 顶部装饰：blopigbg 置于 SVG 网格层上方、Canvas 小猪层下方 -->
    <img class="blopig-bg" src="/pigs/blopigbg.webp" alt="" aria-hidden="true" />
    <!-- 小猪 + 尾迹层：参数曲线轨迹 + 虚线尾迹，Canvas rAF 绘制 -->
    <canvas ref="cv" class="pig-canvas"></canvas>
  </div>
</template>

<script setup>
// ---- 坐标轴网格参数 ----
const GRID_PX = 64        // 正方形网格单元格边长（固定像素）
const LABEL_EVERY = 2     // 每 N 格标一个刻度数字（轴末端始终标注）
const DOT_R = 2           // 网格交点小圆点半径（仅比 1px 虚线宽略大）

// 视窗尺寸：客户端测量后赋值，驱动网格响应式重算
const viewW = ref(0)
const viewH = ref(0)

// ---- 正方形网格（以视窗中心为原点的四象限坐标）----
// 由 viewW/viewH 派生：网格线 / 轴线 / 全交点圆点 / 刻度数字。
// 初始 viewW=viewH=0 -> 返回 null -> SSR 与客户端首帧均不渲染，避免 hydration 不匹配。
const grid = computed(() => {
  const W = viewW.value, H = viewH.value
  if (!W || !H) return null
  const cx = W / 2, cy = H / 2
  const vlines = [], hlines = [], xLabels = [], yLabels = []
  // k 的有效范围：cx + k*GRID_PX 落在 [0, W] / [0, H] 内
  const kMinX = Math.ceil(-cx / GRID_PX), kMaxX = Math.floor((W - cx) / GRID_PX)
  const kMinY = Math.ceil(-cy / GRID_PX), kMaxY = Math.floor((H - cy) / GRID_PX)
  const labeled = k => k === 0 || k % LABEL_EVERY === 0
  for (let k = kMinX; k <= kMaxX; k++) {
    const x = cx + k * GRID_PX
    if (k !== 0) vlines.push({ x, k })                       // k=0 为 y 轴，单独绘制
    if (labeled(k) || k === kMinX || k === kMaxX) xLabels.push({ x, text: String(k) })
  }
  for (let k = kMinY; k <= kMaxY; k++) {
    const y = cy + k * GRID_PX
    if (k !== 0) hlines.push({ y, k })                       // k=0 为 x 轴，单独绘制
    // y 轴向上为正（数学坐标系）：刻度文字取 -k
    if (labeled(k) || k === kMinY || k === kMaxY) yLabels.push({ y, text: String(-k) })
  }
  // 全部网格交点（含坐标轴上的交点）
  const allX = vlines.map(v => v.x).concat(cx)
  const allY = hlines.map(h => h.y).concat(cy)
  const dots = []
  for (const x of allX) for (const y of allY) dots.push({ x, y })
  return { cx, cy, vlines, hlines, dots, xLabels, yLabels }
})

const cv = ref(null)
const reduceMotion = ref(false)

// ---- 可调常量 ----
const PIG_COUNT = 8
const T_RETAIN = 2600      // 尾迹保留时长（ms）
const MAX_TRAIL = 300      // 单只小猪尾迹最大点数
const TRAIL_BANDS = 8      // 尾迹透明度分桶数（实现逐渐消失）
const DASH = [6, 6]        // 尾迹虚线
const AXIS_COLOR = '#AC9EE5'
const FACES_LEFT = true    // pigrun.webp 默认朝向；朝右移动时镜像

const TRAJECTORIES = ['rose', 'cardioid', 'lemniscate', 'astroid', 'spiral']

// ---- 种子伪随机（mulberry32）：保证刷新后布局稳定 ----
function makeRng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---- 参数曲线：返回相对中心的 {x, y, r} ----
function curvePoint(type, t, a) {
  let x = 0, y = 0, r = 0
  switch (type) {
    case 'rose': // 玫瑰线 r = a·cos(2t)，4 瓣
      r = a * Math.cos(2 * t)
      x = r * Math.cos(t); y = r * Math.sin(t)
      break
    case 'cardioid': // 心形线 r = a(1+cos t)
      r = a * (1 + Math.cos(t))
      x = r * Math.cos(t); y = r * Math.sin(t)
      break
    case 'lemniscate': { // 双纽线（figure-8）
      const d = 1 + Math.sin(t) * Math.sin(t)
      x = (a * Math.cos(t)) / d
      y = (a * Math.sin(t) * Math.cos(t)) / d
      r = Math.hypot(x, y)
      break
    }
    case 'astroid': // 星形线
      x = a * Math.cos(t) ** 3
      y = a * Math.sin(t) ** 3
      r = a
      break
    case 'spiral': // 对数螺线 r = a·e^(0.15t)（不闭合，靠反向边界控制）
      r = a * Math.exp(0.15 * t)
      x = r * Math.cos(t); y = r * Math.sin(t)
      break
  }
  return { x, y, r }
}

// 把各类型的最大半径归一到 radius，使不同曲线大小可比
function aForType(type, radius) {
  switch (type) {
    case 'cardioid': return radius / 2   // max r = 2a
    case 'spiral': return radius * 0.3   // 起始半径小，靠 rMin/rMax 控制范围
    default: return radius               // rose / lemniscate / astroid：最大范围 = a
  }
}

// ---- 运行时状态（仅客户端）----
let ctx, W = 0, H = 0, dpr = 1, img = null, imgReady = false, pigW = 0, pigH = 0
let pigs = [], rafId = null, resizeTimer = null
const rng = makeRng(20260807)

function buildPigs() {
  const arr = []
  for (let i = 0; i < PIG_COUNT; i++) {
    arr.push({
      type: TRAJECTORIES[i % TRAJECTORIES.length],
      rx: (rng() - 0.5) * 0.5,        // 中心横向偏移 [-0.25,0.25]·W
      ry: (rng() - 0.5) * 0.5,        // 中心纵向偏移 [-0.25,0.25]·H
      rRadius: 0.14 + rng() * 0.14,   // 相对 minD 的最大半径
      rot: rng() * Math.PI * 2,
      speed: 0.006 + rng() * 0.006,   // 每帧 t 步进（上限降低）
      dir: rng() > 0.5 ? 1 : -1,
      t: rng() * Math.PI * 2,
      rMinFrac: 0.25,                  // 螺线最小半径占比
      rMaxFrac: 1.0,                   // 螺线最大半径占比
      trail: [],
      dx: 0,
      cx: 0, cy: 0, a: 0, rMin: 0, rMax: 0,
      cur: null,
    })
  }
  return arr
}

function layoutPigs() {
  const minD = Math.min(W, H)
  pigH = Math.max(28, Math.min(56, H * 0.05))
  if (img && img.naturalHeight) pigW = img.naturalWidth * (pigH / img.naturalHeight)
  for (const p of pigs) {
    p.cx = W / 2 + p.rx * W
    p.cy = H / 2 + p.ry * H
    const radius = p.rRadius * minD
    p.a = aForType(p.type, radius)
    p.rMin = p.rMinFrac * radius
    p.rMax = p.rMaxFrac * radius
  }
}

function pigPos(p) {
  const c = curvePoint(p.type, p.t, p.a)
  const cr = Math.cos(p.rot), sr = Math.sin(p.rot)
  return {
    x: p.cx + c.x * cr - c.y * sr,
    y: p.cy + c.x * sr + c.y * cr,
    r: c.r,
  }
}

function stepPig(p, now) {
  const prev = p.cur
  p.t += p.speed * p.dir
  let pos = pigPos(p)
  // 通用越界安全网：即将离开视窗 -> 反向（对数螺线等不闭合轨迹由此来回）
  const margin = pigH * 0.7
  let reverse = pos.x < margin || pos.x > W - margin || pos.y < margin || pos.y > H - margin
  // 螺线额外用 r 边界控制，避免无限外扩/坍缩
  if (p.type === 'spiral' && (pos.r > p.rMax || pos.r < p.rMin)) reverse = true
  if (reverse) {
    p.dir *= -1
    p.t += p.speed * p.dir   // 回退一步，使其留在视窗内
    pos = pigPos(p)
  }
  // 平滑水平速度方向，用于镜像朝向（避免尖点处抖动）
  const inst = prev ? pos.x - prev.x : 0
  p.dx = p.dx * 0.8 + inst * 0.2
  p.cur = pos
  // 尾迹：记录近期点，按保留时长与点数上限裁剪
  p.trail.push({ x: pos.x, y: pos.y, born: now })
  while (p.trail.length && now - p.trail[0].born > T_RETAIN) p.trail.shift()
  if (p.trail.length > MAX_TRAIL) p.trail.splice(0, p.trail.length - MAX_TRAIL)
}

function drawTrail(p) {
  const tr = p.trail
  const n = tr.length
  if (n < 2) return
  const band = Math.max(1, Math.floor(n / TRAIL_BANDS))
  ctx.setLineDash(DASH)
  ctx.lineWidth = 1.5
  ctx.strokeStyle = AXIS_COLOR
  // 按 age 分桶，新→旧 透明度高→低，实现「逐渐消失」；桶内虚线连续
  for (let b = 0; b < TRAIL_BANDS; b++) {
    const start = b * band
    const end = b === TRAIL_BANDS - 1 ? n : Math.min(n, (b + 1) * band + 1) // +1 连接桶
    if (end - start < 2) continue
    ctx.globalAlpha = ((b + 1) / TRAIL_BANDS) * 0.65
    ctx.beginPath()
    ctx.moveTo(tr[start].x, tr[start].y)
    for (let i = start + 1; i < end; i++) ctx.lineTo(tr[i].x, tr[i].y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

function drawPig(p) {
  if (!imgReady || !p.cur) return
  const { x, y } = p.cur
  ctx.save()
  ctx.translate(x, y)
  const mirror = FACES_LEFT ? p.dx > 0 : p.dx < 0
  if (mirror) ctx.scale(-1, 1)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, -pigW / 2, -pigH / 2, pigW, pigH)
  ctx.restore()
}

function frame() {
  const now = performance.now()
  ctx.clearRect(0, 0, W, H)
  for (const p of pigs) {
    stepPig(p, now)
    drawTrail(p)
    drawPig(p)
  }
  // 飘浮符号到期回收：到 expireAt 即替换为新符号（新 id -> Vue 重建节点 -> 飘行动画从头播放，从左下出生）
  const syms = symbols.value
  for (let i = 0; i < syms.length; i++) {
    if (now >= syms[i].expireAt) syms[i] = makeSymbol(false, now)
  }
  rafId = requestAnimationFrame(frame)
}

function setupCanvas() {
  W = cv.value.clientWidth
  H = cv.value.clientHeight
  viewW.value = W
  viewH.value = H
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  cv.value.width = Math.round(W * dpr)
  cv.value.height = Math.round(H * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setupCanvas()
    layoutPigs()
  }, 150)
}

function onVisibility() {
  if (document.hidden) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  } else if (!reduceMotion.value) {
    if (!rafId) rafId = requestAnimationFrame(frame)
  }
}

// ---- 飘浮符号：数学符号/希腊字符，左下->右上慢飘 + 自旋 + 左右轻摆，越界回收补新 ----
const SYMBOL_COUNT = 5        // 同时存在的符号数（"几个"）
const SYMBOLS = [
  // 希腊小写
  'α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','π','ρ','σ','τ','υ','φ','χ','ψ','ω',
  // 希腊大写
  'Α','Δ','Σ','Ω','Π','Φ','Ψ','Γ','Λ','Θ',
  // 数学符号
  '∑','∏','∫','∂','∇','∞','√','≈','≠','≤','≥','∈','∉','∋','∪','∩','⊂','⊃','∀','∃','∅','∝','±','×','÷','∴','∵','≡','≅','⇒','⇔','->','←','↔','∠','⊥','∥','≪','≫','∘','⋅','⊕','⊗','ℝ','ℕ','ℤ','ℚ','ℂ'
]

const symbols = ref([])           // 活跃符号列表（SSR/首帧为空，onMounted 后填充）
let symbolId = 0
const symRng = makeRng(20260809)   // 独立种子，与小猪布局解耦

// 生成一个符号配置；initial=true 时带负延迟，使首屏即处于飘行中段（不全堆左下角）
// now 为生成时刻（performance.now()），用于计算到期回收时间戳 expireAt
function makeSymbol(initial, now) {
  const driftDur = 22 + symRng() * 14
  const delay = initial ? -(symRng() * driftDur * 0.85) : 0
  return {
    id: ++symbolId,
    char: SYMBOLS[Math.floor(symRng() * SYMBOLS.length)],
    startX: -60 + symRng() * (W * 0.4 + 60),      // 左下，略出屏飘入
    startY: H * 0.85 + symRng() * (H * 0.15 + 80),
    endX: W * 0.7 + symRng() * (W * 0.3 + 80),    // 右上，飘出屏
    endY: -80 + symRng() * (H * 0.15 + 80),
    driftDur,                                      // 22–36s 慢飘
    sway: 18 + symRng() * 34,                      // 18–52px 摆幅
    swayDur: 4 + symRng() * 4,                     // 4–8s 半周期
    spinDur: 8 + symRng() * 10,                    // 8–18s 自转一圈
    spinDir: symRng() > 0.5 ? 1 : -1,
    size: 18 + symRng() * 20,                      // 18–38px 字号
    color: symRng() > 0.5 ? '#AC9EE5' : '#7E6AD0',
    maxOpacity: 0.45 + symRng() * 0.25,            // 0.45–0.7
    delay,                                         // CSS animation-delay（initial 为负）
    expireAt: now + (driftDur + delay) * 1000,     // 到期回收时间戳（ms）
  }
}

function driftStyle(sym) {
  return {
    '--start-x': sym.startX + 'px',
    '--start-y': sym.startY + 'px',
    '--end-x': sym.endX + 'px',
    '--end-y': sym.endY + 'px',
    '--max-opacity': sym.maxOpacity,
    animationDuration: sym.driftDur + 's',
    animationDelay: sym.delay + 's',
  }
}

function swayStyle(sym) {
  return {
    '--sway': sym.sway + 'px',
    animationDuration: sym.swayDur + 's',
  }
}

function spinStyle(sym) {
  return {
    '--sym-color': sym.color,
    fontSize: sym.size + 'px',
    animationName: sym.spinDir > 0 ? 'spin-cw' : 'spin-ccw',
    animationDuration: sym.spinDur + 's',
  }
}

// 飘浮符号到期回收在 rAF 主循环 frame() 里按 expireAt 时间戳判定（确定性触发，
// 不依赖 animationend 事件；与 CSS 动画共享暂停/恢复语义）

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ctx = cv.value.getContext('2d')
  setupCanvas()
  // 飘浮符号初始化（reduce-motion 下不生成）
  if (!reduceMotion.value) {
    const now = performance.now()
    symbols.value = Array.from({ length: SYMBOL_COUNT }, () => makeSymbol(true, now))
  }
  pigs = buildPigs()
  layoutPigs()
  img = new Image()
  img.onload = () => {
    imgReady = true
    pigW = img.naturalWidth * (pigH / img.naturalHeight)
  }
  img.src = '/pigs/pigrun.webp'
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
  if (reduceMotion.value) {
    // 静态降级：仅画一帧（无尾迹、无呼吸）
    for (const p of pigs) { p.t = 0; p.cur = pigPos(p) }
    ctx.clearRect(0, 0, W, H)
    for (const p of pigs) drawPig(p)
  } else {
    rafId = requestAnimationFrame(frame)
  }
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<style scoped>
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background-color: #ffffff;
}

.axes {
  position: absolute;
  inset: 0;
  display: block;
}

.axes-breathe {
  animation: axes-breathe 7s ease-in-out infinite;
}
.axes-breathe.no-anim {
  animation: none;
}

.axis {
  fill: none;
  stroke: #ac9ee5;
  stroke-width: 1;
  stroke-dasharray: 16 10;
  stroke-opacity: 0.9;
}

.grid {
  fill: none;
  stroke: #ac9ee5;
  stroke-width: 1;
  stroke-dasharray: 4 6;
  stroke-opacity: 0.4;
}

.dot {
  fill: #7e6ad0;
  fill-opacity: 0.55;
}

.label {
  fill: #ac9ee5;
  fill-opacity: 0.7;
  font-size: 10px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.blopig-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  display: block;
  pointer-events: none;
  user-select: none;
}

.pig-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

/* ---- 飘浮符号层 ---- */
.symbols {
  position: absolute;
  inset: 0;
  display: block;
}

/* 外层：左下->右上主飘行 + 淡入淡出；duration/delay 由内联样式按符号注入 */
.symbol-drift {
  animation-name: drift;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

/* 中层：左右轻摆（叶子感）；duration 由内联注入 */
.symbol-sway {
  animation-name: sway;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

/* 内层：自旋；name(cw/ccw)/duration/颜色/字号由内联注入 */
.symbol-spin {
  text-anchor: middle;
  dominant-baseline: central;
  fill: var(--sym-color);
  font-family: 'Cambria Math', 'Segoe UI Symbol', 'Times New Roman', Georgia, serif;
  transform-box: fill-box;
  transform-origin: center;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes drift {
  0%   { transform: translate(var(--start-x), var(--start-y)); opacity: 0; }
  12%  { opacity: var(--max-opacity); }
  82%  { opacity: var(--max-opacity); }
  100% { transform: translate(var(--end-x), var(--end-y)); opacity: 0; }
}

@keyframes sway {
  from { transform: translateX(calc(var(--sway) * -1)); }
  to   { transform: translateX(var(--sway)); }
}

@keyframes spin-cw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes spin-ccw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}

@keyframes axes-breathe {
  0%, 100% { opacity: 0.95; }
  50% { opacity: 0.35; }
}
</style>
