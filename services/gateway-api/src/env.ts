// services/gateway-api/src/env.ts
import { loadEnvTyped, z } from "@bridgepoint/env";

export const env = loadEnvTyped(
    z.object({
        PORT: z.coerce.number().default(8181)
    })
);
