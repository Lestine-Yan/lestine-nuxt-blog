<template>
  <header v-if="!isMobile" class="py-4 mx-auto z-50 flex justify-center fixed inset-x-0 animate-slide-down">
    <div class="m-0 flex justify-center w-auto px-0">
      <nav class="bg-white/70 rounded-full px-8 py-1 shadow-lg border backdrop-blur-lg border-white/90 w-auto">
        <ul class="flex flex-nowrap justify-center items-center text-center">
          <li><NuxtLink to="/" :class="['flex items-center gap-2 px-5 py-2 rounded-full font-medium text-base transition-all duration-300', isActive('/') ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white']"><img src="/images/svg/home.svg" alt="首页图标" class="w-5 h-5" />首页</NuxtLink></li>
          <li><NuxtLink to="/talk" :class="['flex items-center gap-2 px-5 py-2 rounded-full font-medium text-base transition-all duration-300', isActive('/talk') ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white']"><img src="/images/svg/talk.svg" alt="杂谈图标" class="w-5 h-5" />杂谈</NuxtLink></li>
          <li><NuxtLink to="/learn" :class="['flex items-center gap-2 px-5 py-2 rounded-full font-medium text-base transition-all duration-300', isActive('/learn') ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white']"><img src="/images/svg/learn.svg" alt="随笔图标" class="w-5 h-5" />随笔</NuxtLink></li>
          <li><NuxtLink to="/myfriends" :class="['flex items-center gap-2 px-5 py-2 rounded-full font-medium text-base transition-all duration-300', isActive('/myfriends') ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white']"><img src="/images/svg/friend.svg" alt="友人帐图标" class="w-5 h-5" />友人帐</NuxtLink></li>
          <li><NuxtLink to="/about" :class="['flex items-center gap-2 px-5 py-2 rounded-full font-medium text-base transition-all duration-300', isActive('/about') ? 'bg-red-700 text-white' : 'hover:bg-red-700 hover:text-white']"><img src="/images/svg/about.svg" alt="关于我图标" class="w-5 h-5" />关于我</NuxtLink></li>
        </ul>
      </nav>
    </div>
  </header>

  <div v-if="isMobile" class="z-40 fixed inset-x-0 top-0">
    <nav class="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/50 w-full px-4 py-2 flex justify-between items-center">
      <NuxtLink to="/" class="font-bold text-red-800 text-lg">Lestine</NuxtLink>
      <button @click="toggleDrawer" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <svg v-if="!isDrawerOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </nav>

    <div 
      v-show="isDrawerOpen" 
      class="fixed inset-0 top-[52px] bg-black/50 z-30"
      @click="closeDrawer"
    ></div>

    <div 
      class="fixed top-[52px] inset-x-0 bg-white/95 backdrop-blur-lg shadow-xl z-30 transform transition-all duration-300 origin-top"
      :class="isDrawerOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'"
    >
      <ul class="flex flex-col ">
        <li><NuxtLink to="/" @click="closeDrawer" :class="['flex gap-2 px-6 py-3 mx-2 rounded-full font-medium text-base transition-all duration-300 border-b border-gray-100 text-center', isActive('/') ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white']"><img src="/images/svg/home.svg" alt="首页图标" class="w-5 h-5" />首页</NuxtLink></li>
        <li><NuxtLink to="/talk" @click="closeDrawer" :class="['flex gap-2 px-6 py-3 mx-2 rounded-full font-medium text-base transition-all duration-300 border-b border-gray-100 text-center', isActive('/talk') ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white']"><img src="/images/svg/talk.svg" alt="杂谈图标" class="w-5 h-5" />杂谈</NuxtLink></li>
        <li><NuxtLink to="/learn" @click="closeDrawer" :class="['flex gap-2 px-6 py-3 mx-2 rounded-full font-medium text-base transition-all duration-300 border-b border-gray-100 text-center', isActive('/learn') ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white']"><img src="/images/svg/learn.svg" alt="随笔图标" class="w-5 h-5" />随笔</NuxtLink></li>
        <li><NuxtLink to="/myfriends" @click="closeDrawer" :class="['flex gap-2 px-6 py-3 mx-2 rounded-full font-medium text-base transition-all duration-300 border-b border-gray-100 text-center', isActive('/myfriends') ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white']"><img src="/images/svg/friend.svg" alt="友人帐图标" class="w-5 h-5" />友人帐</NuxtLink></li>
        <li><NuxtLink to="/about" @click="closeDrawer" :class="['flex gap-2 px-6 py-3 mx-2 rounded-full font-medium text-base transition-all duration-300 border-b border-gray-100 text-center', isActive('/about') ? 'bg-red-500 text-white' : 'hover:bg-red-500 hover:text-white']"><img src="/images/svg/about.svg" alt="关于我图标" class="w-5 h-5" />关于我</NuxtLink></li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const route = useRoute()
const currentPath = computed(() => route.path)

const isActive = (path) => {
  return currentPath.value === path
}

const isMobile = ref(false)
const isDrawerOpen = ref(false)
const MOBILE_BREAKPOINT = 768

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  if (!isMobile.value) {
    isDrawerOpen.value = false
  }
}

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const closeDrawer = () => {
  isDrawerOpen.value = false
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
@import '/assets/animates.css'
</style>
