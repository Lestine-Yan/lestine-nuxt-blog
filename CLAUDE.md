# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lestine's personal blog, built with Nuxt 4 (v4.3.1) and Vue 3. Content is authored in Markdown and statically generated at build time via `@nuxt/content` v3. The site is deployed in mainland China with ICP备案 (赣ICP备2026007056号-1).

## Commands

```bash
pnpm dev          # Start dev server (HMR)
pnpm build        # Nuxt build
pnpm generate     # Static generation (used in production Docker build)
pnpm preview      # Preview the generated static site
pnpm postinstall  # Runs `nuxt prepare` — auto-triggered after pnpm install
```

Package manager is **pnpm** (not npm/yarn).

## Architecture

### Content system (`content.config.ts`)

Three collections drive all content:

| Collection | Type | Source | Purpose |
|---|---|---|---|
| `learnpost` | data | `content/learnpost/*.md` | 随笔 — learning/essay posts on homepage & /learn |
| `talkpost` | data | `content/talkpost/*.md` | 杂谈 — casual talk posts on homepage & /talk |
| `content` | page | `content/**/*.md` | Catch-all for dynamic routing via `[...slug].vue` |

Content frontmatter has `id`, `title`, `content` (excerpt), `link`, `image`, `date`. Content is queried at page-level with `queryCollection('learnpost').all()` and sorted by date descending.

### Routing

- `/` — Home: hero section + latest learnposts + latest talkposts
- `/learn` — Lists all learnposts
- `/talk` — Lists all talkposts
- `/myfriends` — Friend links from `data/friendLink.ts`
- `/about` — Placeholder about page
- `/[...slug]` — Catch-all dynamic route resolving markdown from the `content` collection via `queryCollection('content').path(route.path).first()`

### Key components

- `components/navbar.vue` — Responsive nav (desktop: centered pill bar with SVG icons; mobile: hamburger drawer). Breakpoint at 768px.
- `components/blogPostCard.vue` — Reusable card: image, title, excerpt (content), date. Links via `<NuxtLink :to="link">`.
- `components/friendCard.vue` — External link card for friend links.
- `components/content/Prose*.vue` (28 files) — Custom overrides for every markdown element rendered by `@nuxt/content`'s `<ContentRenderer>`. Customize styling by editing these (e.g., `ProseA.vue` adds red link styling).

### Styling

- **TailwindCSS** via `@nuxtjs/tailwindcss`. Config in `tailwind.config.js` adds a custom `w-full-no-scrollbar` utility (`calc(100dvw - 8px)`) to account for scrollbar width.
- **Custom CSS** in `assets/animates.css` (slide-down, fade-up keyframe animations) and `assets/fontstyle.css` (STXingkai/KaiTi font family, red color `#991b1b` for h1/h2/p).
- Background: `bg-[url('/images/example-app-bg.png')]` applied in `app.vue`.

### SSG configuration

`nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'` — this is a **pre-rendered static site**. Dynamic routes (`[...slug].vue`) need their paths known at build time for pre-rendering; Nuxt discovers these from the content collections automatically.

### Docker deployment

`deploy/Dockerfile` is a multi-stage build:
1. **builder** stage: installs build deps (python3, make, g++, sqlite-dev for better-sqlite3 native addon), runs `pnpm generate`
2. **runner** stage: copies `.output/public` and serves via `serve` on port 3000

Uses Chinese mirrors (aliyun, npmmirror) for package downloads.

### TypeScript

Nuxt-managed TypeScript — `tsconfig.json` delegates to generated configs in `.nuxt/`. No manual TS config needed; Nuxt discovers `.ts` and `.vue` files automatically throughout the `app/` directory.
