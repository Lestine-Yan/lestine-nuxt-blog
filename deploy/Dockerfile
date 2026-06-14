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

RUN pnpm run generate

FROM nginx:alpine AS runner

COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
