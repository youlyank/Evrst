# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
<<<<<<< HEAD
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
=======
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
<<<<<<< HEAD
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi
=======
RUN npm ci --only=production
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

<<<<<<< HEAD
# Create non-root user
=======
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

<<<<<<< HEAD
# Copy Prisma files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create necessary directories
RUN mkdir -p uploads logs
RUN chown -R nextjs:nodejs uploads logs

# Install additional dependencies for production
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
=======
# Copy Prisma schema and generate client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

<<<<<<< HEAD
# Start the application
=======
>>>>>>> 3e6010f31bad40bef18ce5f8790f80e2506e21ef
CMD ["node", "server.js"]