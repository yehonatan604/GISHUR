import jwt from "jsonwebtoken";
import { TokenTypes } from "@bridgepoint/types";
import { env } from "../env.js";

const { JWT_SECRET, MAIL_SECRET, PASSWORD_RESET_KEY, SECURITY_KEY } = env;

const getSecret = (type: TokenTypes = "auth"): string => {
    switch (type) {
        case "register":
            if (!MAIL_SECRET) throw new Error("MAIL_SECRET is undefined");
            return MAIL_SECRET;
        case "security":
            if (!SECURITY_KEY) throw new Error("SECURITY_KEY is undefined");
            return SECURITY_KEY;
        case "passwordReset":
            if (!PASSWORD_RESET_KEY) throw new Error("PASSWORD_RESET_KEY is undefined");
            return PASSWORD_RESET_KEY;
        case "auth":
        default:
            if (!JWT_SECRET) throw new Error("JWT_SECRET is undefined");
            return JWT_SECRET;
    }
};

const generateToken = (
    _id: string,
    type: TokenTypes = "auth",
    expiresIn: jwt.SignOptions["expiresIn"] = "15m"
): string => {
    const secret = getSecret(type) as jwt.Secret;
    const options: jwt.SignOptions = { expiresIn };
    return jwt.sign({ _id }, secret, options);
};

const verifyToken = (tokenFromClient: string, type: TokenTypes = "auth") => {
    try {
        return jwt.verify(tokenFromClient, getSecret(type));
    } catch (error) {
        return null;
    }
};

const generateRefreshToken = (
    _id: string,
    type: TokenTypes = "auth"
): string => {
    const secret = getSecret(type) as jwt.Secret;
    const options: jwt.SignOptions = { expiresIn: "7d" };
    return jwt.sign({ _id }, secret, options);
};

const refreshToken = (tokenFromClient: string, type: TokenTypes = "auth") => {
    const payload = verifyToken(tokenFromClient, type);
    if (!payload) return null;

    const { _id } = payload as { _id: string };
    return generateToken(_id, type);
};


export { generateToken, verifyToken, refreshToken, generateRefreshToken };