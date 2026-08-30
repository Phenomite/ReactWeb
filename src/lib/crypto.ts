import type { UserCredentialRecord, AuthSession } from '@/types/auth';
import { AUTH_USER_REGISTRY, DUMMY_SALT_HEX, DUMMY_ITERATIONS, AUTH_SESSION_DURATION_MS } from '@/constants/auth';

// Converts a hex string into a Uint8Array byte buffer
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  return bytes;
}

// Compares two byte buffers in constant time using bitwise XOR to prevent timing attacks
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// Derives a PBKDF2-HMAC-SHA256 key from a raw password and salt buffer
export async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as unknown as ArrayBuffer, iterations, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}

// Verifies credentials via PBKDF2 and dummy key derivation to mitigate timing leakage & user enumeration
export async function verifyCredentials(
  userInput: string,
  passInput: string,
  registry = AUTH_USER_REGISTRY
): Promise<UserCredentialRecord | null> {
  const user = registry[userInput.trim().toLowerCase()] || null;
  const salt = hexToBytes(user ? user.saltHex : DUMMY_SALT_HEX);
  const iters = user ? user.iterations : DUMMY_ITERATIONS;
  const derived = await deriveKey(passInput, salt, iters);

  return user && constantTimeEqual(derived, hexToBytes(user.hashHex)) ? user : null;
}

// Generates a SHA-256 signature for session verification
export async function generateSessionSignature(user: UserCredentialRecord, issuedAt: number, expiresAt: number): Promise<string> {
  const payload = `${user.username}:${user.saltHex}:${user.hashHex}:${issuedAt}:${expiresAt}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constructs an AuthSession object signed with a 7-day expiration timestamp
export async function createSession(user: UserCredentialRecord, durationMs = AUTH_SESSION_DURATION_MS): Promise<AuthSession> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + durationMs;
  const signature = await generateSessionSignature(user, issuedAt, expiresAt);
  return { username: user.username, displayName: user.displayName, issuedAt, expiresAt, signature };
}

// Validates session signature and expiration to prevent localStorage tampering
export async function validateSession(sessionJson: string | null, registry = AUTH_USER_REGISTRY): Promise<AuthSession | null> {
  if (!sessionJson) return null;
  try {
    const s = JSON.parse(sessionJson) as AuthSession;
    if (!s?.username || !s?.signature || !s?.expiresAt || !s?.issuedAt || Date.now() >= s.expiresAt) return null;
    const user = registry[s.username.trim().toLowerCase()];
    if (!user) return null;
    const expected = await generateSessionSignature(user, s.issuedAt, s.expiresAt);
    return constantTimeEqual(hexToBytes(s.signature), hexToBytes(expected)) ? s : null;
  } catch {
    return null;
  }
}
