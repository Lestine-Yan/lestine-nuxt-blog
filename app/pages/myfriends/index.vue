<template>
  <windowFrame>
    <h1 class="text-4xl font-bold text-center text-[#7E6AD0] tracking-[0.15em] mb-10">友人帐</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <friendCard
        v-for="friend in friendLink"
        :key="friend.id"
        :image="friend.image"
        :name="friend.name"
        :description="friend.description"
        :url="friend.url"
      />
    </div>
  </windowFrame>
</template>

<script setup lang="ts">
import { friendLink } from '@/data/friendLink'
</script>
