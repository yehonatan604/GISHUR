// services/gateway-api/src/env.ts
import { loadEnvTyped, z } from "@bridgepoint/env";

export const env = loadEnvTyped(
    z.object({
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        DB_URL: z.string().min(1, "DB_URL is required"),
        MESSAGE_BROKER_URL: z.string().min(1, "MESSAGE_BROKER_URL is required"),
        CACHE_URL: z.string().min(1, "CACHE_URL is required")
    })
);
