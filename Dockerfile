FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

RUN pnpm config set deploy-all-versions true 2>/dev/null; true

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm config set minimum-release-age 0 && \
    pnpm install --no-frozen-lockfile --ignore-scripts && \
    pnpm rebuild esbuild sharp unrs-resolver

COPY . .

# Build WITHOUT secret env vars (Clerk keys via Coolify runtime)
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["/app/start.sh"]