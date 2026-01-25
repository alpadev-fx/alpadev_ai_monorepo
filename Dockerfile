FROM node:22-alpine AS base

# 1. Prune necessary files
FROM base AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install turbo --global
COPY . .
RUN turbo prune --scope=next-app-template --docker

# 2. Build the project
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lockfile and package.json's of isolated subworkspace
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Copy prisma schema so postinstall works
COPY --from=pruner /app/out/full/packages/db/prisma/schema.prisma /app/packages/db/prisma/schema.prisma

# Install dependencies using pnpm
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Copy source code of isolated subworkspace
COPY --from=pruner /app/out/full/ .

# Build the project
RUN pnpm turbo build --filter=next-app-template

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Don't run production as root
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

# Copy public folder explicitly to correct location with permissions
# Bypass turbo prune by copying directly from source in pruner stage
COPY --from=pruner --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public
COPY --from=pruner --chown=nextjs:nodejs /app/apps/frontend/public ./public

# Environment variables must be redefined at run time
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "apps/frontend/server.js"]
