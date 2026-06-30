FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Desactivar minimumReleaseAge para build en Docker
RUN pnpm config set deploy-all-versions true 2>/dev/null; true

# Dependencies
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm config set minimum-release-age 0 && \
    pnpm install --no-frozen-lockfile --ignore-scripts && \
    pnpm rebuild esbuild sharp unrs-resolver

# Build
COPY . .

# NEXT_PUBLIC_ vars must be present at BUILD time
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZ2VuZXJhaWEub3JnJA
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
ENV NEXT_PUBLIC_APP_URL=https://app.generaia.org

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
