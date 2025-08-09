import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

function hydrateProcessEnv() {
    const repoRoot = process.cwd().includes(`${path.sep}services${path.sep}`)
        ? path.resolve(process.cwd(), "..", "..")
        : process.cwd();

    // shared files at repo root
    for (const name of [".env.shared.local", ".env.shared"]) {
        const p = path.join(repoRoot, name);
        if (fs.existsSync(p)) {
            loadEnv({ path: p, override: false });
        }
    }

    // local service .env (אם יש), מותר לדרוס
    loadEnv({ override: true });
}

/** סכמת בסיס משותפת לכל השירותים */
export const BaseEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    MESSAGE_BROKER_URL: z.string().min(1, "MESSAGE_BROKER_URL is required"),
    CACHE_URL: z.string().min(1, "REDIS_URL is required"),
    DB_URL: z.string().min(1).optional(), // לא כל שירות צריך Mongo
    PORT: z.coerce.number().default(3000),
    MAIL_HOST: z.string().default("localhost"),
    MAIL_PASS: z.string().default("pass"),
    MAIL_PORT: z.coerce.number().default(587),
    MAIL_PROVIDER: z.string().default("smtp"),
    MAIL_USER: z.string().default("user"),
    MAIL_SECRET: z.string().default("secret"),
    API_URL: z.string().default("http://localhost:3000"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    PASSWORD_RESET_KEY: z.string().min(1, "PASSWORD_RESET_KEY is required"),
    SECURITY_KEY: z.string().min(1, "SECURITY_KEY is required")
});

/**
 * טוען env ומחזיר אובייקט טיפוסי מאומת.
 * ניתן להעביר סכמת הרחבה לשירות (שדות ייחודיים).
 *
 * שימוש:
 *   const env = loadEnv(z.object({ JWT_SECRET: z.string(), PORT: z.coerce.number().default(8181) }));
 */
export function loadEnvTyped<T extends z.ZodRawShape>(
    serviceSchema?: z.ZodObject<T>
) {
    hydrateProcessEnv();

    const schema = serviceSchema
        ? BaseEnvSchema.merge(serviceSchema)
        : BaseEnvSchema;

    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
        // הודעת שגיאה נעימה
        const issues = parsed.error.issues
            .map((i) => `- ${i.path.join(".")}: ${i.message}`)
            .join("\n");
        throw new Error(`Invalid environment configuration:\n${issues}`);
    }
    return parsed.data as z.infer<typeof schema>;
}

export { z };
