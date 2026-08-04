# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请保持使用中文与用户进行交流。终端和文件均使用 UTF-8 编码，避免中文出现乱码。本项目使用 **pnpm** 进行包管理。

## Project Overview

Lestine's personal blog (ilestine.cn), built with Nuxt 4 (v4.3.1) and Vue 3. Content is authored in Markdown and statically generated at build time via `@nuxt/content` v3. The site is deployed in mainland China with ICP备案 (赣ICP备2026007056号-1).

This is a **pre-rendered static site** — `nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'`. There is no runtime backend; all pages are generated into `.output/public/` at build time and served as static files by Nginx.

## Project Structure & Module Organization

Nuxt 4 directory layout — application code lives under `app/`:

- `app/app.vue` — Root component: applies the global background image, wraps `<NuxtLayout><NuxtPage /></NuxtLayout>`, and defines global scrollbar styles.
- `app/pages/` — File-based routing: `index.vue` (home), `learn/index.vue`, `talk/index.vue`, `myfriends/index.vue`, `about/index.vue`, and `[...slug].vue` (catch-all dynamic route for markdown content).
- `app/components/` — `navbar.vue`, `blogPostCard.vue`, `friendCard.vue`, and `content/Prose*.vue` (24 custom overrides for every markdown element rendered by `<ContentRenderer>`).
- `app/layouts/default.vue` — Default layout.
- `app/assets/` — `animates.css` (slide-down / fade-up keyframe animations), `fontstyle.css` (global font: self-hosted 站酷快乐体 / ZCOOL KuaiLe via `@font-face` + `body` font-family, registered globally in `nuxt.config.ts` `css`), and `fonts/ZCOOLKuaiLe.ttf` (the self-hosted web font, ~1.5 MB, tracked in git).
- `app/data/friendLink.ts` — Friend-link data source for `/myfriends`.
- `content.config.ts` — Defines the three `@nuxt/content` collections.
- `content/` — Markdown source for posts (`learnpost/*.md`, `talkpost/*.md`). **Note: both `content/` and `public/` are gitignored** (see Security & Configuration Tips).
- `public/` — Static assets: favicon/icon set, `manifest.json`, `robots.txt`, `browserconfig.xml`, and `images/` (background, post images, SVG icons).
- `deploy/` — `Dockerfile`, `docker-compose.yml`, `deploy.sh`, `.dockerignore`.
- `nuxt.config.ts`, `tailwind.config.js`, `tsconfig.json` — Project config. (There is no root-level `assets/`; custom CSS lives under `app/assets/`.)

## Build, Test, and Development Commands

Package manager is **pnpm** (not npm/yarn).

```bash
pnpm install      # Install dependencies (postinstall auto-runs `nuxt prepare`)
pnpm dev          # Start dev server with HMR
pnpm build        # Nuxt build
pnpm generate     # Static generation -> .output/public/ (used in the production Docker build)
pnpm preview      # Preview the generated static site locally
pnpm postinstall  # Runs `nuxt prepare` (auto-triggered after install)
```

`better-sqlite3` is a native dependency (used by `@nuxt/content`'s local SQLite store). Its prebuilt binary is fetched from `npmmirror.com` during the Docker build. If installing locally fails, set `BETTER_SQLITE3_BINARY_SITE=https://npmmirror.com/mirrors/better-sqlite3` and re-run.

There is currently **no test script and no test framework configured**. See [Testing Guidelines](#testing-guidelines) for conventions to follow when tests are added.

## Architecture

### Content system (`content.config.ts`)

Three collections drive all content:

| Collection | Type | Source | Purpose |
|---|---|---|---|
| `learnpost` | data | `content/learnpost/*.md` | 随笔 — learning/essay posts on homepage & `/learn` |
| `talkpost` | data | `content/talkpost/*.md` | 杂谈 — casual talk posts on homepage & `/talk` |
| `content` | page | `content/**/*.md` | Catch-all for dynamic routing via `[...slug].vue` |

`learnpost` and `talkpost` use an explicit schema: `id` (number|string), `title`, `content` (excerpt), `link`, `image`, `date`. The `content` collection uses the default page schema. Content is queried at page level with `queryCollection('learnpost').all()` and sorted by date descending.

### Routing

- `/` — Home: hero section + latest learnposts + latest talkposts
- `/learn` — Lists all learnposts
- `/talk` — Lists all talkposts
- `/myfriends` — Friend links from `app/data/friendLink.ts`
- `/about` — About page
- `/[...slug]` — Catch-all dynamic route resolving markdown from the `content` collection via `queryCollection('content').path(route.path).first()`

Dynamic routes are pre-rendered; Nuxt discovers their paths automatically from the content collections at build time.

### Key components

- `components/navbar.vue` — Responsive nav (desktop: centered pill bar with SVG icons; mobile: hamburger drawer). Breakpoint at 768px.
- `components/blogPostCard.vue` — Reusable card: image, title, excerpt (content), date. Links via `<NuxtLink :to="link">`.
- `components/friendCard.vue` — External-link card for friend links.
- `components/content/Prose*.vue` (24 files) — Custom overrides for every markdown element rendered by `@nuxt/content`'s `<ContentRenderer>`. Customize markdown styling by editing these (e.g. `ProseA.vue` adds red link styling).

### Styling

- **TailwindCSS** via `@nuxtjs/tailwindcss`. `tailwind.config.js` extends the theme with `fontFamily.sans` set to 站酷快乐体 (ZCOOL KuaiLe) so Preflight applies it site-wide, plus a custom width utility `w-full-no-scrollbar` (`calc(100dvw - 8px)`) to account for scrollbar width. The `content` glob includes `vue`.
- **Global font** 站酷快乐体 (ZCOOL KuaiLe) is self-hosted: `app/assets/fontstyle.css` defines `@font-face` (loading `./fonts/ZCOOLKuaiLe.ttf` with `font-display: swap`) and sets `body { font-family }` with a CJK fallback stack (`PingFang SC`, `Microsoft YaHei`, `system-ui`); it is registered globally via `nuxt.config.ts` `css: ['~/assets/fontstyle.css']`. List-page heading color/letter-spacing use Tailwind classes (`text-red-800` = `#991b1b`, `tracking-[0.15em]`) instead of the old per-page `@import`. `app/assets/animates.css` holds slide-down/fade-up keyframes (still per-page `@import`ed where needed).
- **Background** `bg-[url('/images/example-app-bg.png')]` and custom scrollbar styling are applied globally in `app/app.vue`.

### SSG configuration

`nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'`. Modules: `@nuxtjs/tailwindcss`, `@nuxt/content`. Devtools are enabled in dev and disabled under `$production`. `app.head` configures the site title (`lestine个人站`), viewport, theme-color, and a full PWA icon set plus `manifest.json`.

### TypeScript

Nuxt-managed TypeScript — `tsconfig.json` delegates to generated configs in `.nuxt/`. No manual TS config is needed; Nuxt discovers `.ts` and `.vue` files automatically throughout the `app/` directory.

## Coding Style & Naming Conventions

- Use UTF-8 for source files, Markdown, configs, and terminal output to avoid Chinese text corruption.
- TypeScript and Vue follow the existing Nuxt + Vue 3 style: 2-space indentation. Component files are lowercase camelCase (`blogPostCard.vue`, `friendCard.vue`, `navbar.vue`); data/composable files are camelCase (`friendLink.ts`). Nuxt auto-imports components, composables, and `app/utils` — prefer auto-imports over explicit `~/` imports.
- Markdown frontmatter must match the collection schema in `content.config.ts` (`id`, `title`, `content`, `link`, `image`, `date` for `learnpost`/`talkpost`).
- For markdown rendering styling, prefer editing the `Prose*.vue` overrides rather than working around `@nuxt/content` defaults.

## Deployment

`deploy/Dockerfile` is a multi-stage build:

1. **builder** (`node:20-alpine`) — switches to Aliyun mirrors, installs native build deps (python3, make, g++, sqlite-dev for `better-sqlite3`), enables pnpm via corepack, installs dependencies, rebuilds `better-sqlite3` against npmmirror binaries, then runs `pnpm run generate` to produce `.output/public/`.
2. **runner** (`nginx:alpine`) — copies `.output/public/` to `/usr/share/nginx/html` and serves it on port 80.

`deploy/docker-compose.yml` builds the image, maps `8080:80`, and adds a healthcheck against `http://localhost:80`. `deploy/deploy.sh` is the production deploy flow: `git pull` → `docker compose up -d --build --force-recreate` → `docker cp` the built html from the container to `/www/wwwroot/ilestine.cn/` → `docker compose down`. The container is used as a build/temp-serve vehicle; production ultimately serves static files from `/www/wwwroot/ilestine.cn/` on the host.

## Testing Guidelines

No test framework is configured yet. When tests are added:

- Use **Vitest** with Vue Test Utils, placing unit tests as `*.test.ts(x)` next to the source.
- Add a `test` script to `package.json` and run `pnpm test` before committing.
- Keep tests deterministic and offline — no live network calls or real filesystem state outside Vitest temp dirs.

Until then, verify changes with `pnpm dev` (visual check) and `pnpm generate` (build-time correctness, including content collection schema validation) before committing.

## Commit & Pull Request Guidelines

- Prefer Conventional Commits: `type(scope): summary`. Examples: `feat(content): add learnpost on bitwise ops`, `fix(navbar): correct mobile drawer breakpoint`, `docs: update CLAUDE.md`, `chore(deploy): switch runner to nginx`. Common types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`.
- Keep each commit focused on one logical change. PRs should explain the change, list verification commands (`pnpm generate`, `pnpm dev`, etc.), link related issues, and include UI screenshots when frontend behavior is affected.

## Security & Configuration Tips

- Never commit secrets, `.env`, generated build artifacts (`.output/`, `.nuxt/`, `.nitro`, `.cache`, `dist/`), `node_modules/`, or local runtime data (`.data/`). All are gitignored.
- `content/` and `public/` are also gitignored in this repo — post markdown and static images are kept local on purpose. Do **not** `git add -f` them unless intentionally bringing content under version control; confirm with the user first.
- When introducing new configuration keys, update `nuxt.config.ts` (and `tailwind.config.js` for styling) and document them here. Prefer `NUXT_PUBLIC_*` env vars for environment-specific values.
- The Docker build uses Chinese mirrors (Aliyun, npmmirror) for packages and `better-sqlite3` binaries; keep these when editing the Dockerfile unless the build environment changes.
