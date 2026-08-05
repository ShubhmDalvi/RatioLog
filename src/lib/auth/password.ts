import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/**
 * Hash a plaintext password using Node's built-in scrypt (memory-hard KDF).
 * No external crypto dependency is required and the stored value is
 * self-contained: `salt:hash` in hex.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString("hex")}`;
}

/**
 * Verify a plaintext password against a stored `salt:hash` value using a
 * constant-time comparison.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) {
    return false;
  }

  const hash = Buffer.from(hashHex, "hex");
  const candidate = await scrypt(password, salt, KEY_LENGTH);

  return hash.length === candidate.length && timingSafeEqual(hash, candidate);
}
