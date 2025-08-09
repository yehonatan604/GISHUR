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
            JWT_SECRET: env.JWT_SECRET,
            SECURITY_KEY: env.SECURITY_KEY,
            PASSWORD_RESET_KEY: env.PASSWORD_RESET_KEY,
            MESSAGE_BROKER_URL: env.MESSAGE_BROKER_URL,
            MAIL_SECRET: env.MAIL_SECRET
        };

        for (const [key, val] of Object.entries(vars)) {
            if (!val) throw new Error(`Environment variable ${key} is not set`);
        }

        return vars;
    }

}

export const envService = EnvService.getInstance();
