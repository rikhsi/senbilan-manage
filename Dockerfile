# Web admin SPA. One image, environment picked at container start via assets/config.json.
FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV HUSKY=0 \
  NX_DAEMON=false \
  CI=true \
  NODE_OPTIONS=--max-old-space-size=4096

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npx nx build web --configuration=production

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
COPY --from=build /app/dist/apps/web/browser /usr/share/nginx/html

RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
