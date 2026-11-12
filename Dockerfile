FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install ffmpeg for optional MKV/duration probing on container
RUN apk add --no-cache ffmpeg

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.json ./drizzle.config.json
COPY --from=builder /app/src/db ./src/db

RUN mkdir -p /data/KaraokeKZ/videos /data/KaraokeKZ/thumbnails /data/KaraokeKZ/database /data/KaraokeKZ/backups /data/KaraokeKZ/logs /data/KaraokeKZ/temp

EXPOSE 3000

CMD ["sh", "-c", "npx drizzle-kit push --force && npm run start -- -H 0.0.0.0 -p 3000"]
