# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请保持使用中文与用户进行交流。终端和文件均使用 UTF-8 编码，避免中文出现乱码。本项目使用 **pnpm** 进行包管理。

## Project Overview

Lestine's personal blog (ilestine.cn), built with Nuxt 4 (v4.3.1) and Vue 3. Content is authored in Markdown and statically generated at build time via `@nuxt/content` v3. The site is deployed in mainland China with ICP备案 (赣ICP备2026007056号-1).

This is a **pre-rendered static site** — `nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'`. There is no runtime backend; all pages are generated into `.output/public/` at build time and served as static files by Nginx.

## Project Structure & Module Organization

Nuxt 4 directory layout — application code lives under `app/`:

- `app/app.vue` — Root component: renders `<SiteBackground />` (global background), wraps `<NuxtLayout><NuxtPage /></NuxtLayout>`, and defines global scrollbar styles.
- `app/pages/` — File-based routing: `index.vue` (home), `learn/index.vue`, `talk/index.vue`, `myfriends/index.vue`, `about/index.vue`, and `[...slug].vue` (catch-all dynamic route for markdown content).
- `app/components/` — `navbar.vue`, `blogPostCard.vue`, `friendCard.vue`, `siteBackground.vue` (global decorative background: SVG coordinate axes + SVG floating math/Greek symbols + Canvas pig trajectories), and `content/Prose*.vue` (24 custom overrides for every markdown element rendered by `<ContentRenderer>`).
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
- **Background** is a fixed, full-viewport decorative layer rendered by `app/components/siteBackground.vue` (mounted in `app/app.vue`), `pointer-events:none`, `z-index:-1`, white base. It has three stacked sub-layers:
  - **SVG coordinate axes** (inline `<svg>`): a 4-quadrant 2D axis centered at the viewport center. A fixed-pixel square grid (`GRID_PX = 64`) is drawn over the whole viewport — non-axis grid lines are lighter dashed (`stroke-dasharray="4 6"`, `stroke-opacity:0.4`), and the x/y axes (the `k=0` lines) are heavier dashed (`stroke-dasharray="16 10"`, color `#AC9EE5`, `stroke-opacity:0.9`). Every grid intersection (including on the axes) gets a small darker dot (`#7E6AD0`, `r=2`, slightly larger than the 1px stroke). Axis tick labels are small (`10px`, every `LABEL_EVERY = 2` cells plus the four axis ends; y is flipped so up is positive). The grid is computed client-side from measured viewport dimensions (reactive `viewW`/`viewH` set in `setupCanvas` and re-derived on resize) — SSR/first frame render nothing to avoid hydration mismatch. The whole axis group breathes via a CSS `@keyframes` opacity animation (`0.95 ↔ 0.35`, 7s, scoped to the component).
  - **SVG floating symbols** (inline `<svg class="symbols">`, sits above the axes, below the pig canvas): a small fixed pool (`SYMBOL_COUNT = 5`) of math symbols and Greek letters (~60-char set) drift slowly from bottom-left to top-right while self-rotating and swaying side-to-side (leaf-like). Each symbol is three nested `<g>/<text>` driven by pure CSS `@keyframes` (`drift` translate+fade, `sway` alternate `translateX`, `spin-cw`/`spin-ccw` rotate) with per-symbol randomness injected via inline CSS custom properties; seeded-pseudo-random (`symRng`, decoupled from pigs). The initial batch spawns with negative `animation-delay` so the screen is populated mid-flight immediately; when a symbol's drift ends (off-screen top-right) it is recycled - each symbol carries an `expireAt` timestamp, and the shared pig rAF loop replaces it with a fresh bottom-left spawn when elapsed (a new `:key` id restarts the drift animation). Recycling is time-driven (not `animationend`, which proved unreliable here), so it is deterministic and stays in sync with the CSS animations' pause/resume on tab hide. SSR/first frame renders nothing (`symbols` starts `[]`, filled in `onMounted`); respects `prefers-reduced-motion` (layer omitted). Slow: drift 22–36s, sway 4–8s half-cycle, spin 8–18s/turn; low opacity (0.45–0.7) in `#AC9EE5`/`#7E6AD0`; serif math font stack (`'Cambria Math', 'Segoe UI Symbol', 'Times New Roman', Georgia, serif`).
  - **Canvas pig trajectories** (client-only, `requestAnimationFrame`): ~8 pigs (`/pigs/pigrun.webp`, pixelated) each follow one of five parametric curves — 玫瑰线 (rose), 心形线 (cardioid), 双纽线 (lemniscate), 星形线 (astroid, all closed loops), or 对数螺线 (logarithmic spiral, open). Each leaves a dashed trail (`#AC9EE5`, `setLineDash`) that fades by age (retention ~2.6s, alpha-banded) and is pruned by length. Pigs are seeded-pseudo-randomly distributed across the viewport (overlap allowed) and mirror to face their travel direction. Any pig about to leave the viewport (or, for the spiral, breaching its r bounds) reverses direction (`dir *= -1`). DPR-aware; pauses on tab hide; respects `prefers-reduced-motion` (static single frame). The canvas is transparent and sits above the SVG axes.
  - Custom scrollbar styling remains global in `app/app.vue`.

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
