import { findUserByEmail } from "../services/dbRequest.service.js";
import { verifyPassword } from "../services/hash.service.js";
import { generateToken } from "../services/jwt.service.js";

export async function handleLogin(ch: any, email: string, password: string) {
    const user = await findUserByEmail(ch, email);
    if (!user || typeof user.password !== "string") return { ok: false, error: "User not found" };

    const ok = await verifyPassword(password, user.password);
    if (!ok) return { ok: false, error: "Invalid password" };

    const token = generateToken(user._id);
    return { ok: true, token, userId: user._id };
}
