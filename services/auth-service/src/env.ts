// services/gateway-api/src/env.ts
import { loadEnvTyped, z } from "@bridgepoint/env";

export const env = loadEnvTyped(
    z.object({
        SECURITY_KEY: z.string().min(1, "SECURITY_KEY is required"),
        PASSWORD_RESET_KEY: z.string().min(1, "PASSWORD_RESET_KEY is required"),
        JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
        MAIL_SECRET: z.string().min(1, "MAIL_SECRET is required")
    })
);
