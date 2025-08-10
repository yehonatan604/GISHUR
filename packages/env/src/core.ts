import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";

let hydrated = false;

function repoRootFromCwd(cwd = process.cwd()) {
    return cwd.includes(`${path.sep}services${path.sep}`)
        ? path.resolve(cwd, "..", "..")
        : cwd;
}

function hydrateProcessEnv() {
    if (hydrated) return;
    hydrated = true;

    const root = repoRootFromCwd();
    for (const name of [".env.shared.local", ".env.shared"]) {
        const p = path.join(root, name);
        if (fs.existsSync(p)) loadEnv({ path: p, override: false });
    }
    loadEnv({ override: true });
}

export function buildEnv<T extends z.ZodRawShape>(
    schema: z.ZodObject<T>
): z.infer<typeof schema> {
    hydrateProcessEnv();
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
        const issues = parsed.error.issues
            .map(i => `- ${i.path.join(".")}: ${i.message}`)
            .join("\n");
        throw new Error(`Invalid environment configuration:\n${issues}`);
    }
    return Object.freeze(parsed.data) as z.infer<typeof schema>;
}

export { z };
