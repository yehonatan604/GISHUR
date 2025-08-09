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
            MESSAGE_BROKER_URL: env.MESSAGE_BROKER_URL,
            PORT: Number(env.PORT),
        } as EnvVars;

        for (const [key, val] of Object.entries(vars)) {
            if (!val) throw new Error(`Environment variable ${key} is not set`);
        }

        return vars;
    }

}

export const envService = EnvService.getInstance();
