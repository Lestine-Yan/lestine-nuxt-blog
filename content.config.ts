import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    learnpost: defineCollection({
      type: 'data',
      source: 'learnpost/*.md',
      schema: z.object({
        id: z.union([z.number(), z.string()]),
        title: z.string(),
        content: z.string(),
        link: z.string(),
        image: z.string()
      })
    }),
    talkpost: defineCollection({
      type: 'data',
      source: 'talkpost/*.md',
      schema: z.object({
        id: z.union([z.number(), z.string()]),
        title: z.string(),
        content: z.string(),
        link: z.string(),
        image: z.string()
      })
    }),
    content: defineCollection({
      type: 'page',
      source: '**/*.md'
    })
  }
})
