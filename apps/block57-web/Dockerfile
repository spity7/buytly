# syntax=docker.io/docker/dockerfile:1
# Build from repo root: docker compose build block57-web

FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/block57-web
COPY apps/block57-web/package.json apps/block57-web/package-lock.json ./
# Plain RUN (no BuildKit cache mount) so classic `docker compose build` works on VPS without buildx
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm ci --no-audit --no-fund

FROM base AS builder
WORKDIR /app/apps/block57-web
COPY --from=deps /app/apps/block57-web/node_modules ./node_modules
COPY apps/block57-web/ .

ARG NEXT_PUBLIC_API_URL=https://api.buytly.com/api/v1
ARG NEXT_PUBLIC_SITE_SLUG=block57
ARG NEXT_PUBLIC_SITE_NAME="Block 57"
ARG NEXT_PUBLIC_SITE_PUBLIC_URL=https://block-57.com
ARG NEXT_PUBLIC_BLOCK57_PROJECT_SLUG=block-57
ARG NEXT_PUBLIC_SHOW_PRICES=false
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
ARG NEXT_PUBLIC_SUPPORT_PHONE=+233244777772
ARG NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY="+233 244 777 772"
ARG NEXT_PUBLIC_SUPPORT_EMAIL=info@block-57.com

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_SLUG=${NEXT_PUBLIC_SITE_SLUG}
ENV NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
ENV NEXT_PUBLIC_SITE_PUBLIC_URL=${NEXT_PUBLIC_SITE_PUBLIC_URL}
ENV NEXT_PUBLIC_BLOCK57_PROJECT_SLUG=${NEXT_PUBLIC_BLOCK57_PROJECT_SLUG}
ENV NEXT_PUBLIC_SHOW_PRICES=${NEXT_PUBLIC_SHOW_PRICES}
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

COPY --from=builder /app/apps/block57-web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/block57-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/block57-web/.next/static ./.next/static

USER nextjs

EXPOSE 3027

ENV PORT=3027
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3027').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
