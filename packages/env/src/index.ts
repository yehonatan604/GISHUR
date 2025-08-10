import { buildEnv, z } from "./core.js";
import { BaseEnvSchema } from "./schemas.zod.js";

// 1) env מוכן מהסכמה הבסיסית בלבד (לרוב השירותים מספיק)
export const env = buildEnv(BaseEnvSchema);

// 2) הרחבה לשירות: מאחד עם סכמה ייחודית ומחזיר env טיפוסי
export function withServiceEnv<T extends z.ZodRawShape>(
    serviceSchema: z.ZodObject<T>
) {
    return buildEnv(BaseEnvSchema.merge(serviceSchema));
}

export { z };