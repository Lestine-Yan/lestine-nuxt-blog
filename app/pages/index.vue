<template>
  <!-- 首页 -->
  <div class="w-2/3 h-auto flex flex-col items-center justify-center">
    <div class="w-full h-[100dvh]  bg-white-1/30 flex flex-col items-center justify-center animate-fade-up">
      <img src="/images/im.jpg" class="my-auto w-28 h-28 rounded-full mb-4" alt="头像">
      <div class="bg-black/80 rounded-lg w-full lg:w-[512px] h-1/7 px-2 lg:px-4 py-3 mb-4">
        <!--博客主-->
        <h1 class="text-3xl text-red-800 font-bold text-center mb-1" style="font-family: 'Brush Script MT', 'Lucida Calligraphy', 'Edwardian Script ITC', 'Monotype Corsiva', 'French Script MT', 'Segoe Script', cursive;">Lestine</h1>
        <!--个性签名-->
        <p class="text-lg text-white text-center" style="font-family: 'STXingkai', 'Xingkai SC', 'KaiTi', '楷体', serif;">梦想在远方，我在月球</p>
      </div>
      <div class="flex space-x-4">
        <a href="https://github.com/Lestine-Yan" target="_blank" class="w-10 h-10 rounded-full bg-white flex items-center justify-center  hover:bg-black/60 transition-colors">
          <img src="/images/gh.webp" class="w-8 h-8 rounded-full" alt="GitHub">
        </a>
      </div>
      <div class="mt-auto py-5 m-0">
        <img src="/images/arrow.svg" class="w-16 h-16 rounded-full animate-bounce" alt="箭头">
      </div>
    </div>
  </div>
  <!--内容部分-->
  <div class="bg-white/70 m-0 p-0 w-[100dvw] md:w-full-no-scrollbar h-auto backdrop-blur-lg flex flex-col items-center justify-center py-8">
    <div class="mx-auto items-center justify-center flex flex-col">
      <h2 class="text-2xl text-red-800 font-bold text-center mb-1" style="font-family: 'Brush Script MT', 'Lucida Calligraphy', 'Edwardian Script ITC', 'Monotype Corsiva', 'French Script MT', 'Segoe Script', cursive;">Articles</h2>
      <p class="text-xl text-red-800 text-center py-4" style="font-family: 'STXingkai', 'Xingkai SC', 'KaiTi', '楷体', serif;">分享我的学习、生活</p>
    </div>
    <div class="w-full px-4 lg:w-[912px] lg:px-0 ">
      <blogPostCard v-for="learnpost in learnposts" :key="learnpost.id" :title="learnpost.title" :content="learnpost.content" :link="learnpost.link" :image="learnpost.image" :date="learnpost.date"/>
      <blogPostCard v-for="talkpost in talkposts" :key="talkpost.id" :title="talkpost.title" :content="talkpost.content" :link="talkpost.link" :image="talkpost.image" :date="talkpost.date"/>
    </div>
  </div>

</template>


<script setup>
import blogPostCard from '@/components/blogPostCard.vue'
const learnposts = await queryCollection('learnpost').all()
const talkposts = await queryCollection('talkpost').all()
</script>

<style scoped>

@import '/assets/animates.css'

</style>
