# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

请保持使用中文与用户进行交流。终端和文件均使用 UTF-8 编码，避免中文出现乱码。本项目使用 **pnpm** 进行包管理。

## Project Overview

Lestine's personal blog (ilestine.cn), built with Nuxt 4 (v4.3.1) and Vue 3. **随笔 (articles) are authored in Markdown and served by the Margaret API** (a separate backend), fetched client-side at runtime; the markdown is parsed with `@nuxtjs/mdc`'s `parseMarkdown` and rendered via `MDCRenderer` + 24 custom `Prose*.vue` overrides. The site is deployed in mainland China with ICP备案 (赣ICP备2026007056号-1).

This is a **pre-rendered static site** - `nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'`. There is no Nuxt runtime backend; pages are generated into `.output/public/` at build time and served as static files by the host Nginx. Nginx also reverse-proxies `/api/` to the Margaret API and provides SPA fallback for the dynamic article route (`/learn/[slug]`) on direct load/refresh.

## Project Structure & Module Organization

Nuxt 4 directory layout - application code lives under `app/`:

- `app/app.vue` - Root component: renders `<SiteBackground />` (global background), wraps `<NuxtLayout><NuxtPage /></NuxtLayout>`, and defines global scrollbar styles.
- `app/pages/` - File-based routing: `index.vue` (home), `learn.vue` (parent: `windowFrame` + `<NuxtPage />`, wide/narrow switches by route), `learn/index.vue` (随笔 list), `learn/[slug].vue` (随笔 detail - fetches Margaret API + `parseMarkdown` + `markdownRenderer`), `myfriends/index.vue`, `about/index.vue`, and `[...slug].vue` (catch-all -> 404 page; local markdown has migrated to Margaret). `/talk` and `/talk/**` are redirected to `/learn` via `routeRules`.
- `app/components/` - `navbar.vue`, `friendCard.vue`, `articleCard.vue` (随笔 list card, links to `/learn/<slug>`), `markdownRenderer.vue` (renders the `parseMarkdown` AST via `@nuxtjs/mdc`'s `MDCRenderer` with `:prose="false"`, explicitly mapping the 24 `Prose*.vue`), `windowFrame.vue` (content card container `#FDFDF2`, wide for list / narrow for detail with smooth width transition), `siteBackground.vue` (global background: SVG coordinate axes + SVG floating math/Greek symbols + Canvas pig trajectories), and `content/Prose*.vue` (24 custom overrides for every markdown element rendered by `MDCRenderer`; styled in the site's purple theme, e.g. `ProseA` is purple with a color-shift hover and **no underline**).
- `app/layouts/default.vue` - Default layout (navbar + `<NuxtPage />` + footer with ICP/公安备案).
- `app/assets/` - `animates.css` (slide-down / fade-up keyframe animations), `fontstyle.css` (global font: self-hosted 站酷快乐体 / ZCOOL KuaiLe via `@font-face` + `body` font-family, registered globally in `nuxt.config.ts` `css`), and `fonts/ZCOOLKuaiLe.ttf` (the self-hosted web font, ~1.5 MB, tracked in git).
- `app/composables/useMargaret.ts` - Margaret API client composables (`useArticles` / `useArticle` / `useCategories`), all `server: false` (client-side fetch).
- `app/types/margaret.ts` - Margaret API types (`ApiResponse<T>` / `Paginated<T>` / `ArticleListItem` / `Article`).
- `app/utils/formatDate.ts` - RFC3339 -> `YYYY-MM-DD` date formatting (auto-imported).
- `app/data/friendLink.ts` - Friend-link data source for `/myfriends`.
- `public/` - Static assets: favicon/icon set, `manifest.json`, `robots.txt`, `browserconfig.xml`, and `images/` (background, post images, SVG icons).
- `deploy/` - `Dockerfile`, `docker-compose.yml`, `deploy.sh`, `.dockerignore`.
- `nuxt.config.ts`, `tailwind.config.js`, `tsconfig.json` - Project config. (There is no root-level `assets/`; custom CSS lives under `app/assets/`.)

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

There are **no native dependencies** - the Docker build is a plain `pnpm install` + `pnpm run generate` (no `better-sqlite3` or native compilation, since `@nuxt/content` was removed).

There is currently **no test script and no test framework configured**. See [Testing Guidelines](#testing-guidelines) for conventions to follow when tests are added.

## Architecture

### Content system (Margaret API + `@nuxtjs/mdc`)

Articles (随笔) live in the **Margaret API** (a separate backend), not in this repo. The client fetches them at runtime via composables in `app/composables/useMargaret.ts` (base path `useRuntimeConfig().public.margaretApiBase`, default `/api/v1`):

- `useArticles(page, pageSize, category)` -> `GET /articles` (paginated, filterable by category, time desc)
- `useArticle(slug)` -> `GET /articles/:slug` (returns the Markdown `content`)
- `useCategories()` -> `GET /categories`

All composables use `server: false` (client-side only). In dev, `/api/` is proxied to Margaret via `routeRules` (`MARGARET_API_TARGET` env, see `.env`); in production the host Nginx reverse-proxies `/api/` to Margaret.

Article detail (`learn/[slug].vue`) parses the Markdown `content` with `@nuxtjs/mdc`'s `parseMarkdown` and renders the AST through `markdownRenderer.vue` (`MDCRenderer` with `:prose="false"`, explicitly mapping the 24 `Prose*.vue` components). 随笔/杂谈已合并：`/talk` redirects to `/learn`.

### Routing

- `/` - Home: hero (avatar + name + signature + GitHub link)
- `/learn` - 随笔 list (Margaret API, paginated + category filter), inside `windowFrame` (wide)
- `/learn/[slug]` - 随笔 detail (Margaret API -> `parseMarkdown` -> `markdownRenderer`), `windowFrame` (narrow)
- `/talk`, `/talk/**` - Redirected to `/learn` via `routeRules` (杂谈已合并入随笔)
- `/myfriends` - Friend links from `app/data/friendLink.ts`
- `/about` - About page
- `/[...slug]` - Catch-all -> 404 page (local markdown content has migrated to Margaret)

`/learn/[slug]` is a client-side dynamic route (slugs come from the API at runtime, `server: false`); the static build emits an SPA fallback, and the host Nginx must serve `index.html` for deep-link refreshes.

### Key components

- `components/navbar.vue` - Responsive nav (desktop: centered pill bar with SVG icons; mobile: hamburger drawer). Breakpoint at 768px.
- `components/articleCard.vue` - 随笔 list card: cover thumbnail, title, date·category, summary. Links via `<NuxtLink :to="/learn/${slug}">`.
- `components/friendCard.vue` - External-link card for friend links.
- `components/markdownRenderer.vue` - `MDCRenderer` (`:prose="false"`) with the 24-entry `Prose*.vue` mapping; the bridge between `parseMarkdown` and the styled prose components.
- `components/windowFrame.vue` - Content card (`#FDFDF2`, rounded, shadow) wrapping `<NuxtPage />`; `narrow` prop for detail pages.
- `components/content/Prose*.vue` (24 files) - Custom overrides for every markdown element rendered by `MDCRenderer` (wired in `markdownRenderer.vue`). Styled in the site's purple theme (`#7E6AD0` / `#AC9EE5` / `#5B4B9E` / `#FBF5FE` on the `#FDFDF2` content card). `ProseA` is purple with a purple->pink color-shift hover and **no underline**; `ProsePre` is a purple-tinted dark code block (`#2A2438` bg) with Shiki syntax highlighting (see SSG configuration). Customize markdown styling by editing these.

### Styling

- **TailwindCSS** via `@nuxtjs/tailwindcss`. `tailwind.config.js` extends the theme with `fontFamily.sans` set to 站酷快乐体 (ZCOOL KuaiLe) so Preflight applies it site-wide, plus a custom width utility `w-full-no-scrollbar` (`calc(100dvw - 8px)`) to account for scrollbar width. The `content` glob includes `vue`.
- **Global font** 站酷快乐体 (ZCOOL KuaiLe) is self-hosted: `app/assets/fontstyle.css` defines `@font-face` (loading `./fonts/ZCOOLKuaiLe.ttf` with `font-display: swap`) and sets `body { font-family }` with a CJK fallback stack (`PingFang SC`, `Microsoft YaHei`, `system-ui`); it is registered globally via `nuxt.config.ts` `css: ['~/assets/fontstyle.css']`. List-page heading color/letter-spacing use Tailwind classes (`text-[#7E6AD0]` = `#7E6AD0`, `tracking-[0.15em]`). `app/assets/animates.css` holds slide-down/fade-up keyframes (still per-page `@import`ed where needed).
- **Background** is a fixed, full-viewport decorative layer rendered by `app/components/siteBackground.vue` (mounted in `app/app.vue`), `pointer-events:none`, `z-index:-1`, white base. It has three stacked sub-layers:
  - **SVG coordinate axes** (inline `<svg>`): a 4-quadrant 2D axis centered at the viewport center. A fixed-pixel square grid (`GRID_PX = 64`) is drawn over the whole viewport - non-axis grid lines are lighter dashed (`stroke-dasharray="4 6"`, `stroke-opacity:0.4`), and the x/y axes (the `k=0` lines) are heavier dashed (`stroke-dasharray="16 10"`, color `#AC9EE5`, `stroke-opacity:0.9`). Every grid intersection (including on the axes) gets a small darker dot (`#7E6AD0`, `r=2`, slightly larger than the 1px stroke). Axis tick labels are small (`10px`, every `LABEL_EVERY = 2` cells plus the four axis ends; y is flipped so up is positive). The grid is computed client-side from measured viewport dimensions (reactive `viewW`/`viewH` set in `setupCanvas` and re-derived on resize) - SSR/first frame render nothing to avoid hydration mismatch. The whole axis group breathes via a CSS `@keyframes` opacity animation (`0.95 ↔ 0.35`, 7s, scoped to the component).
  - **SVG floating symbols** (inline `<svg class="symbols">`, sits above the axes, below the pig canvas): a small fixed pool (`SYMBOL_COUNT = 5`) of math symbols and Greek letters (~60-char set) drift slowly from bottom-left to top-right while self-rotating and swaying side-to-side (leaf-like). Each symbol is three nested `<g>/<text>` driven by pure CSS `@keyframes` (`drift` translate+fade, `sway` alternate `translateX`, `spin-cw`/`spin-ccw` rotate) with per-symbol randomness injected via inline CSS custom properties; seeded-pseudo-random (`symRng`, decoupled from pigs). The initial batch spawns with negative `animation-delay` so the screen is populated mid-flight immediately; when a symbol's drift ends (off-screen top-right) it is recycled - each symbol carries an `expireAt` timestamp, and the shared pig rAF loop replaces it with a fresh bottom-left spawn when elapsed (a new `:key` id restarts the drift animation). Recycling is time-driven (not `animationend`, which proved unreliable here), so it is deterministic and stays in sync with the CSS animations' pause/resume on tab hide. SSR/first frame renders nothing (`symbols` starts `[]`, filled in `onMounted`); respects `prefers-reduced-motion` (layer omitted). Slow: drift 22–36s, sway 4–8s half-cycle, spin 8–18s/turn; low opacity (0.45–0.7) in `#AC9EE5`/`#7E6AD0`; serif math font stack (`'Cambria Math', 'Segoe UI Symbol', 'Times New Roman', Georgia, serif`).
  - **Canvas pig trajectories** (client-only, `requestAnimationFrame`): ~8 pigs (`/pigs/pigrun.webp`, pixelated) each follow one of five parametric curves - 玫瑰线 (rose), 心形线 (cardioid), 双纽线 (lemniscate), 星形线 (astroid, all closed loops), or 对数螺线 (logarithmic spiral, open). Each leaves a dashed trail (`#AC9EE5`, `setLineDash`) that fades by age (retention ~2.6s, alpha-banded) and is pruned by length. Pigs are seeded-pseudo-randomly distributed across the viewport (overlap allowed) and mirror to face their travel direction. Any pig about to leave the viewport (or, for the spiral, breaching its r bounds) reverses direction (`dir *= -1`). DPR-aware; pauses on tab hide; respects `prefers-reduced-motion` (static single frame). The canvas is transparent and sits above the SVG axes.
  - Custom scrollbar styling remains global in `app/app.vue`.

### SSG configuration

`nuxt.config.ts` sets `ssr: true` with `nitro.preset: 'static'`. Modules: `@nuxtjs/tailwindcss`, `@nuxtjs/mdc`. Devtools are enabled in dev and disabled under `$production`. `app.head` configures the site title (`lestine个人站`), viewport, theme-color, and a full PWA icon set plus `manifest.json`.

**Code syntax highlighting (Shiki)** - configured under `mdc.highlight` in `nuxt.config.ts`:

- `theme: 'github-dark'` - provides token colors only; the code block background is owned by `ProsePre` (`#2A2438`), since `wrapperStyle` defaults to `false` (Shiki does not inject a background onto the `<pre>`).
- `noApiRoute: true` - the static site has no Nitro runtime, so the client highlighter (`#mdc-highlighter`) is used directly instead of `$fetch('/api/_mdc/highlight')` (avoids a 404 round-trip + fallback on every first code block).
- `shikiEngine: 'javascript'` - pure-JS regex engine, no oniguruma WASM fetch (more reliable for a mainland-China static deployment).
- Highlighting runs **client-side** (articles are fetched at runtime via `server: false`), so Shiki + the configured langs/themes are bundled into async client chunks and loaded on demand when a fenced code block with a language is rendered. `ProsePre` binds the Shiki-generated `class` (the `shiki` class, carried via its `class` prop) onto `<pre>` so the injected `html .shiki span { color: var(--shiki-default) }` rule applies, and exposes `:deep(.line){display:block}` so Shiki's per-line `<span class="line">` output renders correctly. Code blocks without a language (or `` ```text ``) are not highlighted and fall back to `ProsePre`'s base color.

### TypeScript

Nuxt-managed TypeScript - `tsconfig.json` delegates to generated configs in `.nuxt/`. No manual TS config is needed; Nuxt discovers `.ts` and `.vue` files automatically throughout the `app/` directory.

## Coding Style & Naming Conventions

- Use UTF-8 for source files, Markdown, configs, and terminal output to avoid Chinese text corruption.
- TypeScript and Vue follow the existing Nuxt + Vue 3 style: 2-space indentation. Component files are lowercase camelCase (`articleCard.vue`, `friendCard.vue`, `navbar.vue`); data/composable files are camelCase (`friendLink.ts`, `useMargaret.ts`). Nuxt auto-imports components, composables, and `app/utils` - prefer auto-imports over explicit `~/` imports.
- Article content (title/summary/category/tags/date/Markdown body) is defined by the Margaret API schema (`app/types/margaret.ts`), not by local frontmatter.
- For markdown rendering styling, prefer editing the `Prose*.vue` overrides rather than working around `@nuxtjs/mdc` defaults.

## Deployment

`deploy/Dockerfile` is a two-stage build (no native dependencies - `@nuxt/content` and `better-sqlite3` were removed):

1. **builder** (`node:20-alpine`) - switches apk to Aliyun mirrors, enables pnpm via corepack, `pnpm install --no-frozen-lockfile`, then `pnpm run generate` to produce `.output/public/`.
2. **runner** (`nginx:alpine`) - copies `.output/public/` to `/usr/share/nginx/html` and serves it on port 80.

`deploy/docker-compose.yml` builds the image, maps `8080:80`, and adds a healthcheck (`wget --spider http://localhost:80`). `deploy/deploy.sh` is the production deploy flow: `git pull` -> `docker compose up -d --build --force-recreate` -> `docker cp` the built html from the container to `/www/wwwroot/ilestine.cn/` -> `docker compose down`. The container is used as a build/temp-serve vehicle; production ultimately serves static files from `/www/wwwroot/ilestine.cn/` on the host.

**Host Nginx (not in repo)** must additionally: (1) reverse-proxy `/api/` to the Margaret API backend, and (2) serve `index.html` (SPA fallback) for `/learn/<slug>` deep-link refreshes, since article routes are client-side only.

## Testing Guidelines

No test framework is configured yet. When tests are added:

- Use **Vitest** with Vue Test Utils, placing unit tests as `*.test.ts(x)` next to the source.
- Add a `test` script to `package.json` and run `pnpm test` before committing.
- Keep tests deterministic and offline - no live network calls or real filesystem state outside Vitest temp dirs.

Until then, verify changes with `pnpm dev` (visual check) and `pnpm generate` (build-time correctness) before committing.

## Commit & Pull Request Guidelines

- Prefer Conventional Commits: `type(scope): summary`. Examples: `feat(content): add learnpost on bitwise ops`, `fix(navbar): correct mobile drawer breakpoint`, `docs: update CLAUDE.md`, `chore(deploy): switch runner to nginx`. Common types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`.
- Keep each commit focused on one logical change. PRs should explain the change, list verification commands (`pnpm generate`, `pnpm dev`, etc.), link related issues, and include UI screenshots when frontend behavior is affected.

## Security & Configuration Tips

- Never commit secrets, `.env`, generated build artifacts (`.output/`, `.nuxt/`, `.nitro`, `.cache`, `dist/`), `node_modules/`, or local runtime data (`.data/`). All are gitignored.
- `public/` is **not** gitignored (static assets are tracked). Article markdown lives in the Margaret API, not in this repo. Do **not** `git add -f` anything unless intentionally bringing new content under version control; confirm with the user first.
- When introducing new configuration keys, update `nuxt.config.ts` (and `tailwind.config.js` for styling) and document them here. Prefer `NUXT_PUBLIC_*` env vars for environment-specific values (e.g. `NUXT_PUBLIC_MARGARET_API_BASE`).
- The Docker build switches apk to Aliyun mirrors; keep this when editing the Dockerfile unless the build environment changes.
