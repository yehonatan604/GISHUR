import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6).max(128),
}).strict();

export const RegisterSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    email: z
        .string()
        .trim()
        .email("Invalid email")
        .transform((v) => v.toLowerCase()),
    password: z.string().min(6, "Password must be at least 6 characters").max(128),
}).strict();

export const LoginMsg = z.object({
    type: z.literal("login"),
    email: z.string().email(),
    password: z.string().min(6),
});

export const RegisterMsg = RegisterSchema.extend({
    type: z.literal("register"),
});

export const AuthActionSchema = z.discriminatedUnion("type", [LoginMsg, RegisterMsg]);
export type AuthAction = z.infer<typeof AuthActionSchema>;

export type RegisterBody = z.infer<typeof RegisterSchema>;

export type RegisterMsg = z.infer<typeof RegisterMsg>;