import dotenv from 'dotenv';
import { EnvVars } from '../types/EnvVars.js';
dotenv.config();
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

    get vars(): EnvVars {
        const vars = {
            MAIL_PROVIDER: env.MAIL_PROVIDER,
            MAIL_HOST: env.MAIL_HOST,
            MAIL_PORT: +env.MAIL_PORT!,
            MAIL_USER: env.MAIL_USER,
            MAIL_PASS: env.MAIL_PASS,
            MAIL_SECRET: env.MAIL_SECRET,
            API_URL: env.API_URL,
            MESSAGE_BROKER_URL: env.MESSAGE_BROKER_URL
        } as EnvVars;

        for (const [key, val] of Object.entries(vars)) {
            if (!val) throw new Error(`Environment variable ${key} is not set`);
        }

        return vars;
    }

}

export const envService = EnvService.getInstance();
