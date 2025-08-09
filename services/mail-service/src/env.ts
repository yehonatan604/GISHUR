// services/gateway-api/src/env.ts
import { loadEnvTyped, z } from "@bridgepoint/env";

export const env = loadEnvTyped(
    z.object({
        MAIL_PROVIDER: z.string().default("smtp"),
        MAIL_HOST: z.string().default("localhost"),
        MAIL_PORT: z.coerce.number().default(587),
        MAIL_USER: z.string().default("user"),
        MAIL_PASS: z.string().default("pass"),
        MAIL_SECRET: z.string().default("secret"),
        API_URL: z.string().default("http://localhost:3000")
    })
);
