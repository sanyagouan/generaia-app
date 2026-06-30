FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Desactivar minimumReleaseAge para build en Docker
RUN pnpm config set deploy-all-versions true 2>/dev/null; true

# Dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

# Build
COPY . .
RUN pnpm build

# Production image
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Copy standalone output
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
