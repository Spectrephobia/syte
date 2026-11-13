# BALAND — Production Docker image
# Multi-stage build for smaller final image

# ---- Builder stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app
RUN npm run build

# ---- Runner stage ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.ts ./

# Create data directory for SQLite
RUN mkdir -p /app/db /app/public/uploads

# Expose port
EXPOSE 3000

# Set port
ENV PORT=3000

# Run database setup + start
CMD sh -c "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npm run start"
