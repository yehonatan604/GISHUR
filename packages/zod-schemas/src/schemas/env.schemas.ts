import { z } from "zod";

export const BaseEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // תשתיות
    MESSAGE_BROKER_URL: z.string().min(1, "MESSAGE_BROKER_URL is required")
        .default("amqp://admin:admin@localhost:5672"),
    CACHE_URL: z.string().min(1, "CACHE_URL is required")
        .default("redis://localhost:6379"),
    DB_URL: z.string().optional()
        .default("mongodb://localhost:27017/bridgepoint"),

    // אפליקציה
    PORT: z.coerce.number().default(3000),
    API_URL: z.string().default("http://localhost:3000"),

    // מייל
    MAIL_PROVIDER: z.string().default("smtp"),
    MAIL_HOST: z.string().default("localhost"),
    MAIL_PORT: z.coerce.number().default(587),
    MAIL_USER: z.string().default("user"),
    MAIL_PASS: z.string().default("pass"),
    MAIL_SECRET: z.string().default("secret"),

    // אבטחה
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    PASSWORD_RESET_KEY: z.string().min(1, "PASSWORD_RESET_KEY is required"),
    SECURITY_KEY: z.string().min(1, "SECURITY_KEY is required"),
});
