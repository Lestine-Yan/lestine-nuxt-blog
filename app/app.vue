<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- 背景层：固定定位，横虚线 + 12只奔跑小猪 -->
    <div class="bg-layer" aria-hidden="true">
      <img
        v-for="n in 12"
        :key="n"
        class="pig"
        :style="pigStyle(n)"
        src="/pigs/pigrun.webp"
        alt=""
      />
    </div>
    <!-- layout=default -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// 简单的种子伪随机函数（0~1），保证 SSR 与客户端一致
const rand = (seed) => {
  const x = Math.sin(seed * 9999.1) * 10000
  return x - Math.floor(x)
}

// 为第 n 只小猪生成样式：伪随机的速度和初始 x 位置
const pigStyle = (n) => {
  // 速度：10s ~ 32s 之间伪随机
  const duration = 10 + rand(n * 3.7) * 22
  // 初始 x 位置：动画进度 0% ~ 100% 随机（通过负 delay 实现）
  const delay = -duration * rand(n * 7.3 + 1.5)
  return {
    top: `calc((100% / 12) * ${n - 0.5})`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  }
}
</script>

<style>
/* 全局样式 */
html {
  overflow-y: auto;
  scrollbar-gutter: stable;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(127, 29, 29, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(127, 29, 29, 0.8);
}

/* ===== 背景层 ===== */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  /* 纯白底色 + SVG 横虚线：12 条水平虚线划分出 12 个水平区域 */
  background-color: #ffffff;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'><line x1='0' y1='100%25' x2='100%25' y2='100%25' stroke='%23AC9EE5' stroke-width='1' stroke-dasharray='6 8'/></svg>");
  background-size: 100% calc(100% / 12);
  background-repeat: repeat-y;
}

/* ===== 小猪 ===== */
.pig {
  position: absolute;
  left: 0;
  /* 高度 = 所在条带高度的 60% */
  height: calc((100% / 12) * 0.6);
  width: auto;
  /* 初始状态：垂直居中 + 从右边界外开始 */
  transform: translate(100vw, -50%);
  animation-name: pig-move-left;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  image-rendering: pixelated;
}

/* 向左奔跑动画：从视口右侧外移动到左侧外 */
@keyframes pig-move-left {
  0% {
    transform: translate(100vw, -50%);
  }
  100% {
    transform: translate(-100%, -50%);
  }
}
</style>
