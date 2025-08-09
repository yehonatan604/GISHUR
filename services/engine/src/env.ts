// services/gateway-api/src/env.ts
import { loadEnvTyped, z } from "@bridgepoint/env";

export const env = loadEnvTyped(
    z.object({
        MESSAGE_BROKER_URL: z.string().default("amqp://localhost"),
        CACHE_URL: z.string().default("redis://localhost:6379")
    })
);
