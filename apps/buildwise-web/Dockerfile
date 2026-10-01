# syntax=docker.io/docker/dockerfile:1
# Build from repo root: docker compose build buildwise-web

FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/buildwise-web
COPY apps/buildwise-web/package.json apps/buildwise-web/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm ci --no-audit --no-fund

FROM base AS builder
WORKDIR /app/apps/buildwise-web
COPY --from=deps /app/apps/buildwise-web/node_modules ./node_modules
COPY apps/buildwise-web/ .

ARG NEXT_PUBLIC_API_URL=https://api.buytly.com/api/v1
ARG NEXT_PUBLIC_SITE_SLUG=buildwise
ARG NEXT_PUBLIC_SITE_NAME=Buildwise Engineering
ARG NEXT_PUBLIC_SITE_PUBLIC_URL=https://buildwise-engineering.com
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ARG NEXT_PUBLIC_SUPPORT_PHONE=+96171703703
ARG NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY=+961 71 703 703
ARG NEXT_PUBLIC_SUPPORT_EMAIL=info@buildwise-engineering.com

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_SLUG=${NEXT_PUBLIC_SITE_SLUG}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
ENV NEXT_PUBLIC_SITE_PUBLIC_URL=${NEXT_PUBLIC_SITE_PUBLIC_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
ENV NEXT_PUBLIC_SUPPORT_PHONE=${NEXT_PUBLIC_SUPPORT_PHONE}
ENV NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY=${NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY}
ENV NEXT_PUBLIC_SUPPORT_EMAIL=${NEXT_PUBLIC_SUPPORT_EMAIL}

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/buildwise-web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/buildwise-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/buildwise-web/.next/static ./.next/static

USER nextjs

EXPOSE 3026

ENV PORT=3026
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3026').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
