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
            MAIL_PROVIDER: env.MAIL_PROVIDER,
            MAIL_HOST: env.MAIL_HOST,
            MAIL_PORT: +env.MAIL_PORT!,
            MAIL_USER: env.MAIL_USER,
            MAIL_PASS: env.MAIL_PASS,
            MAIL_SECRET: env.MAIL_SECRET,
            API_URL: env.API_URL,
            MESSAGE_BROKER_URL: env.MESSAGE_BROKER_URL
        };

        for (const [key, val] of Object.entries(vars)) {
            if (!val) throw new Error(`Environment variable ${key} is not set`);
        }

        return vars;
    }

}

export const envService = EnvService.getInstance();
