# syntax=docker/dockerfile:1.6
#
# Multi-stage Dockerfile for safephone-frontend.
#   - `dev`   : `npm run dev` with the project bind-mounted; hot reload works
#               via Turbopack file watching (WATCHPACK_POLLING=true in compose).
#   - `build` : production build artefact.
#   - `prod`  : minimal runtime serving the built output.
#
# docker-compose at repo root targets `dev`. For prod (Railway / Vercel
# typically use their own builders, but if you ever self-host) target `prod`.

FROM node:22-alpine AS base
WORKDIR /app
# libc6-compat: Next.js requires libc compat on Alpine for sharp / SWC.
RUN apk add --no-cache libc6-compat

# ── dev ────────────────────────────────────────────────────────────────────
FROM base AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
EXPOSE 3001
# Bind to 0.0.0.0 so the port is reachable from the host through Docker's
# port-forward. `next dev` is Turbopack by default in Next 16.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3001"]

# ── build ──────────────────────────────────────────────────────────────────
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ── prod ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
RUN addgroup -S nextjs -g 1001 && adduser -S nextjs -u 1001 -G nextjs
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
