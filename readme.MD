# GISHUR Monorepo

A **pnpm + Turborepo** microservices monorepo for the BridgePoint system.
Services share **TypeScript config**, a **central env loader**, and **shared types**.

---

## 📂 Project Structure

``` bash
GISHUR/
├─ packages/
│  ├─ env/        # Shared env loader (@bridgepoint/env)
│  ├─ tsconfig/   # Shared TS configs (@bridgepoint/tsconfig)
│  └─ types/      # Shared TypeScript types (@bridgepoint/types)
│
├─ services/
│  ├─ auth-service     # Auth & JWT
│  ├─ db-service       # Mongo/Mongoose access
│  ├─ engine           # Core workflow engine
│  ├─ gateway-api      # HTTP API gateway
│  └─ mail-service     # Email sender
│
├─ docker-compose.yml
├─ pnpm-workspace.yaml
├─ turbo.json
└─ package.json
```

---

## ✅ Prerequisites

* Node.js 20+
* pnpm 9/10 (Corepack is fine)
* Docker Desktop (for local infra: Redis/Mongo/Rabbit)

---

## 🚀 Quick Start

### 1) Install

```bash
pnpm install
```

### 2) Environment files

* Shared (Docker/internal): `./.env.shared`
* Shared (local dev): `./.env.shared.local`
  Example:

  ``` bash
  MESSAGE_BROKER_URL=amqp://admin:admin@localhost:5672
  REDIS_URL=redis://localhost:6379
  DB_URL=mongodb://localhost:27017/bridgepoint
  NODE_ENV=development
  ```
  
* Service overrides (optional): `services/<svc>/.env`

> `@bridgepoint/env` loads **.env.shared.local → .env.shared → services/`<svc>`/.env** (later files override earlier).

### 3) Start infra (Redis/Mongo/Rabbit) in Docker

```bash
docker compose --profile infra up -d
```

### 4) Run all services locally (hot-reload)

```bash
pnpm dev
```

---

## 🐳 Run everything in Docker (optional)

Build app images (uses turbo prune + pnpm deploy):

```bash
docker compose --profile app build
```

Run infra + apps:

```bash
docker compose --profile infra --profile app up -d
```

Stop:

```bash
docker compose down
```

---

## 🧩 Shared Packages

### `@bridgepoint/env`

* Loads shared env from repo root and merges the service `.env`.
* Validates with **Zod**; each service can extend the base schema.

### `@bridgepoint/tsconfig`

* Central TypeScript config (ESM/NodeNext, strict).
* Services extend via: `../../packages/tsconfig/tsconfig.base.json`.

### `@bridgepoint/types`

* Central type definitions (DTOs, domain models).
* Uses **type-only imports** for Mongoose; declares `mongoose` as a **peerDependency**.

Build shared types:

```bash
pnpm --filter @bridgepoint/types build
```

---

## 🔧 Root Scripts

```bash
pnpm dev         # turbo run dev --parallel (all services)
pnpm build       # turbo run build
```

Per service:

```bash
pnpm --filter @bridgepoint/gateway-api dev
pnpm --filter @bridgepoint/gateway-api build
```

---

## 🔌 Tech

* Node.js (TypeScript, ESM / NodeNext)
* pnpm + Turborepo
* MongoDB + Mongoose
* RabbitMQ
* Redis
* Docker Compose (profiles: `infra`, `app`)

---

## 📝 Notes

* Only **gateway-api** exposes an HTTP port; other services are internal.
* `.env.shared.local` is for **local dev**; never commit secrets.
* Dockerfiles use `pnpm deploy --legacy` for pnpm v10 compatibility (safe for prod).
* Healthchecks exist for Redis/Mongo/Rabbit; consider `/healthz` endpoints per service.

---

## 🧭 Troubleshooting

* **TS can’t find shared tsconfig** → use relative `extends: ../../packages/tsconfig/tsconfig.base.json` and restart TS server.
* **Imports show “.js” errors** → ensure `module` & `moduleResolution` are `NodeNext` in each service.
* **Shared types not found** → make sure `@bridgepoint/types` is a dependency of the service and run `pnpm --filter @bridgepoint/types build`.

---

## 📈 Roadmap (v2)

* Service-level READMEs (endpoints, env, examples)
* CI build & remote turbo cache
* Local LLaMA service (GPU/CPU)
* Observability (logs/metrics/tracing)
