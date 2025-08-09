import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot =
    process.cwd().includes(`${path.sep}services${path.sep}`)
        ? path.resolve(process.cwd(), '..', '..')
        : process.cwd();

for (const name of ['.env.shared.local', '.env.shared']) {
    const p = path.join(repoRoot, name);
    if (fs.existsSync(p)) {
        loadEnv({ path: p, override: false });
    }
}

const env = process.env;

class EnvService {
    private static instance: EnvService;
    private constructor() { }

    public static getInstance(): EnvService {
        if (!EnvService.instance) {
            EnvService.instance = new EnvService();
        }
        return EnvService.instance;
    }

    get vars() {
        const vars = {
            MESSAGE_BROKER_URL: env.MESSAGE_BROKER_URL,
            CACHE_URL: env.CACHE_URL,
        };

        for (const [key, val] of Object.entries(vars)) {
            if (!val) throw new Error(`Environment variable ${key} is not set`);
        }

        return vars;
    }

}

export const envService = EnvService.getInstance();
