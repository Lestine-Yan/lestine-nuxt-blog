#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "=== 拉取最新代码 ==="
git pull

echo "=== 构建静态文件 ==="
cd deploy
docker compose up -d --build --force-recreate

echo "=== 拷贝构建产物到网站目录 ==="
docker cp lestine-nuxt-blog:/usr/share/nginx/html/. /www/wwwroot/ilestine.cn/

echo "=== 关闭容器释放资源 ==="
docker compose down

echo "=== 部署完成 ==="
ls /www/wwwroot/ilestine.cn/
