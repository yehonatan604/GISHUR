# ---- 1) prune את המונורפו לשירות ----
FROM node:20-slim AS prune
WORKDIR /repo
RUN corepack enable
COPY . .
RUN npm i -g turbo@2.5.5
RUN turbo prune @bridgepoint/gateway-api --docker

# ---- 2) התקנות על בסיס ה-prune ----
FROM node:20-slim AS install
WORKDIR /repo
RUN corepack enable
COPY --from=prune /repo/out/json/ ./
RUN pnpm install --frozen-lockfile
COPY --from=prune /repo/out/full/ ./

# ---- 3) build לשירות בלבד ----
FROM node:20-slim AS build
WORKDIR /repo
RUN corepack enable
COPY --from=install /repo/ ./
RUN pnpm -w turbo run build --filter @bridgepoint/gateway-api

# ---- 4) deploy ל-runtime ----
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
RUN corepack enable

# יש לנו את כל ה־workspace מהשלב install
COPY --from=install /repo/ ./

# פריסת תלויות prod וקבצי חבילה ל-/app
RUN pnpm deploy --filter @bridgepoint/gateway-api --legacy /app

# העברת קבצי build לשם
WORKDIR /app
COPY --from=build /repo/services/gateway-api/dist ./dist

EXPOSE 8181
CMD ["node", "dist/index.js"]
