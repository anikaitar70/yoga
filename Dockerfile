# Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . ./
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:20-bullseye AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/app/public/uploads

RUN apt-get update && apt-get install -y --no-install-recommends wget postgresql-client ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
COPY scripts/consolidate-site-config.sh ./scripts/consolidate-site-config.sh
RUN chmod +x /docker-entrypoint.sh /scripts/consolidate-site-config.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
