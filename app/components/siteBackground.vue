<template>
  <div class="bg-layer" aria-hidden="true">
    <!-- 坐标轴层：以视窗中心为原点的四象限二维坐标轴 + 沿 y=x/-x 的短十字刻度，整体 CSS 呼吸 -->
    <svg class="axes" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <g class="axes-breathe" :class="{ 'no-anim': reduceMotion }">
        <!-- x / y 轴：较长虚线，保留原色 #AC9EE5 -->
        <line class="axis" x1="0" y1="50%" x2="100%" y2="50%" />
        <line class="axis" x1="50%" y1="0" x2="50%" y2="100%" />
        <!-- 沿 y=x / y=-x，y 值每隔 5% 视窗取点，从该点向 x/y 轴作垂线（竖直到 x 轴 + 水平到 y 轴），构成网格 -->
        <g v-for="(t, i) in ticks" :key="i">
          <line class="tick" :x1="`${t.x}%`" :y1="`${t.y}%`" :x2="`${t.x}%`" y2="50%" />
          <line class="tick" :x1="`${t.x}%`" :y1="`${t.y}%`" x2="50%" :y2="`${t.y}%`" />
        </g>
      </g>
    </svg>
    <!-- 小猪 + 尾迹层：参数曲线轨迹 + 虚线尾迹，Canvas rAF 绘制 -->
    <canvas ref="cv" class="pig-canvas"></canvas>
  </div>
</template>

<script setup>
// ---- 对角刻度点（纯百分比，SSR 安全）----
// 沿 y=x 与 y=-x，y 值每隔 5% 视窗取一个点；过滤超出 [0,100] 的点
const ticks = []
for (let k = 1; k <= 10; k++) {
  for (const x of [50 + 5 * k, 50 - 5 * k]) {
    for (const y of [50 + 5 * k, 50 - 5 * k]) {
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) ticks.push({ x, y })
    }
  }
}
const cv = ref(null)
const reduceMotion = ref(false)

// ---- 可调常量 ----
const PIG_COUNT = 12
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
  rafId = requestAnimationFrame(frame)
}

function setupCanvas() {
  W = cv.value.clientWidth
  H = cv.value.clientHeight
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

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ctx = cv.value.getContext('2d')
  setupCanvas()
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

.tick {
  fill: none;
  stroke: #ac9ee5;
  stroke-width: 1;
  stroke-dasharray: 4 6;
  stroke-opacity: 0.55;
}

.pig-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes axes-breathe {
  0%, 100% { opacity: 0.95; }
  50% { opacity: 0.35; }
}
</style>
