# ---- 1) prune את המונורפו לשירות ----
FROM node:20-slim AS prune
WORKDIR /repo
RUN corepack enable
COPY . .
RUN npm i -g turbo@2.5.5
RUN turbo prune @bridgepoint/db-service --docker

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
RUN pnpm -w turbo run build --filter @bridgepoint/db-service

# ---- 4) deploy ל-runtime ----
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
RUN corepack enable

# להביא את ה-workspace כדי ש-deploy יעבוד
COPY --from=install /repo/ ./

# פריסה מדויקת של prod deps וקבצי החבילה אל /app
RUN pnpm deploy --filter @bridgepoint/db-service --legacy /app

# עכשיו מעבירים את ה-dist שנבנה לשם
WORKDIR /app
COPY --from=build /repo/services/db-service/dist ./dist

EXPOSE 8184
CMD ["node", "dist/index.js"]
