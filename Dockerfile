# Build stage
FROM node:20-bullseye AS builder

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . ./
RUN mkdir -p tessdata \
  && node -e "fetch('https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz').then((r)=>{if(!r.ok)throw new Error(r.statusText);return r.arrayBuffer()}).then((b)=>require('fs').writeFileSync('tessdata/eng.traineddata.gz',Buffer.from(b))).catch((e)=>{console.error(e);process.exit(1)})"
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:20-bullseye AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOAD_DIR=/app/public/uploads

RUN apt-get update && apt-get install -y --no-install-recommends wget postgresql-client ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
# Image processing (gallery uploads) — required at runtime; not always traced into standalone.
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img
COPY --from=builder /app/node_modules/tesseract.js ./node_modules/tesseract.js
COPY --from=builder /app/node_modules/tesseract.js-core ./node_modules/tesseract.js-core
COPY --from=builder /app/node_modules/regenerator-runtime ./node_modules/regenerator-runtime
COPY --from=builder /app/node_modules/wasm-feature-detect ./node_modules/wasm-feature-detect
COPY --from=builder /app/node_modules/bmp-js ./node_modules/bmp-js
COPY --from=builder /app/node_modules/zlibjs ./node_modules/zlibjs
COPY --from=builder /app/node_modules/is-url ./node_modules/is-url
COPY --from=builder /app/node_modules/is-electron ./node_modules/is-electron
COPY --from=builder /app/node_modules/node-fetch ./node_modules/node-fetch
COPY --from=builder /app/node_modules/whatwg-url ./node_modules/whatwg-url
COPY --from=builder /app/node_modules/tr46 ./node_modules/tr46
COPY --from=builder /app/node_modules/webidl-conversions ./node_modules/webidl-conversions
COPY --from=builder /app/tessdata ./tessdata
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
COPY scripts/consolidate-site-config.sh ./scripts/consolidate-site-config.sh
RUN chmod +x /docker-entrypoint.sh ./scripts/consolidate-site-config.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
