# ---- 1) prune ----
FROM node:20-slim AS prune
WORKDIR /repo
RUN corepack enable
COPY . .
RUN npm i -g turbo@2.5.5
RUN turbo prune @bridgepoint/mail-service --docker

# ---- 2) install על בסיס ה-prune ----
FROM node:20-slim AS install
WORKDIR /repo
RUN corepack enable
COPY --from=prune /repo/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ ./

# ---- 3) build ----
FROM node:20-slim AS build
WORKDIR /repo
RUN corepack enable
COPY --from=install /repo/ ./
RUN pnpm -w turbo run build --filter @bridgepoint/mail-service

# ---- 4) deploy ל-runtime ----
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
RUN corepack enable
# יש לנו את ה-workspace מהשלב install
COPY --from=install /repo/ ./
# פריסת prod deps וקבצי חבילה ל-/app
RUN pnpm deploy --filter @bridgepoint/mail-service --legacy /app

# העברת קבצי build ל-/app
WORKDIR /app
COPY --from=build /repo/services/mail-service/dist ./dist

EXPOSE 8185
CMD ["node", "dist/index.js"]
