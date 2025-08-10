import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(6).max(128),
}).strict();

export type LoginInput = z.infer<typeof LoginSchema>;
