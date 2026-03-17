<template>
  <!-- 首页 -->
  <div class="w-2/3 h-auto flex flex-col items-center justify-center">
    <div class="w-full h-[100dvh]  bg-white-1/30 flex flex-col items-center justify-center">
      <img src="/images/im.jpg" class="my-auto w-[10dvh] h-[10dvh] rounded-full mb-4" alt="头像">
      <div class="bg-black/80 rounded-lg w-1/2 h-1/7 px-6 py-3 mb-4">
        <!--博客主-->
        <h1 class="text-3xl text-red-800 font-bold text-center mb-1" style="font-family: 'Brush Script MT', 'Lucida Calligraphy', 'Edwardian Script ITC', 'Monotype Corsiva', 'French Script MT', 'Segoe Script', cursive;">Lestine</h1>
        <!--个性签名-->
        <p class="text-lg text-white text-center" style="font-family: 'STXingkai', 'Xingkai SC', 'KaiTi', '楷体', serif;">梦想在远方，我在月球</p>
      </div>
      <div class="flex space-x-4">
        <a href="#" target="_blank" class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-black/60 transition-colors">
          <img src="/images/qq.png" class="w-8 h-8 rounded-full" alt="QQ">
        </a>
        <a href="#" target="_blank" class="w-10 h-10 rounded-full bg-white flex items-center justify-center  hover:bg-black/60 transition-colors">
          <img src="/images/wx.png" class="w-8 h-8 rounded-full" alt="微信">
        </a>
        <a href="https://github.com/Lestine-Yan" target="_blank" class="w-10 h-10 rounded-full bg-white flex items-center justify-center  hover:bg-black/60 transition-colors">
          <img src="/images/gh.webp" class="w-8 h-8 rounded-full" alt="GitHub">
        </a>
      </div>
      <div class="mt-auto py-5 m-0">
      </div>
    </div>
  </div>
  <!--内容部分-->
  <div class="bg-white/75 m-0 p-0 w-[99dvw] h-auto backdrop-blur-lg flex flex-col items-center justify-center py-8">
    <blogPostCard v-for="post in posts" :key="post.id" :title="post.title" :content="post.content" :link="post.link"/>
  </div>

</template>


<script setup>
import blogPostCard from '@/components/blogPostCard.vue'
import { posts } from '~/data/blogPostCardItems'
</script>
