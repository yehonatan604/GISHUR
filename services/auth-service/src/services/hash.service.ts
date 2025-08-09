import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const hashPassword = async (password: string) => {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
}

const verifyPassword = async (password: string, storedHash: string) => {
    const [salt, key] = storedHash.split(':');
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    return key === derivedKey.toString('hex');
}

export { hashPassword, verifyPassword };