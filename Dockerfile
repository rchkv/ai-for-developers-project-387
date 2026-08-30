# syntax=docker/dockerfile:1

# --- Stage 1: собрать статический UI ---
FROM node:20-alpine AS ui-build
WORKDIR /app/ui
# postinstall-скрипт (copy-shoelace-assets.mjs) должен уже присутствовать на
# момент `npm ci`, поэтому копируем весь исходный код UI перед установкой.
COPY ui/ ./
RUN npm ci
RUN npm run build

# --- Stage 2: собрать backend и приложить к нему готовый UI ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev

COPY backend/ ./
# Собранный UI кладём в backend/public — server.js сам обнаружит его
# и будет отдавать вместе с API на одном и том же порту (PORT).
COPY --from=ui-build /app/ui/dist ./public

# Порт приложение читает из переменной окружения PORT (см. backend/src/server.js).
# Значение по умолчанию используется только если PORT не задан при запуске контейнера.
ENV PORT=4010
EXPOSE 4010

CMD ["node", "src/server.js"]
