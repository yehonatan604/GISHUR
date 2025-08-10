import { findUserByEmail, createUser } from "../services/dbRequest.service.js";
import { hashPassword } from "../services/hash.service.js";
import { generateToken } from "../services/jwt.service.js";

export async function handleRegister(ch: any, email: string, password: string, firstName?: string, lastName?: string) {
    const exists = await findUserByEmail(ch, email);
    if (exists) return { ok: false, error: "Email already in use" };

    const hashed = await hashPassword(password);
    const userId = await createUser(ch, { email, password: hashed, firstName, lastName });
    if (!userId) return { ok: false, error: "Failed to create user" };

    const token = generateToken(userId, "register", "15m");

    return { ok: true, userId, token };
}
