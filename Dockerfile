# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first to leverage Docker cache.
COPY package*.json ./
RUN npm ci

# Copy sources and build Next.js app.
COPY . ./
RUN npx prisma generate
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
