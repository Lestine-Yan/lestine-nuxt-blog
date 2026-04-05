FROM node:20-alpine AS builder

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk add --no-cache python3 make g++ sqlite-dev

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile

COPY . .

ENV BETTER_SQLITE3_BINARY_SITE=https://npmmirror.com/mirrors/better-sqlite3 \
    better_sqlite3_binary_host=https://registry.npmmirror.com/-/binary/better-sqlite3 \
    npm_config_disturl=https://npmmirror.com/mirrors/node \
    npm_config_registry=https://registry.npmmirror.com

RUN pnpm rebuild better-sqlite3

RUN pnpm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache sqlite-libs

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

RUN chown -R nuxt:nodejs /app

USER nuxt

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
