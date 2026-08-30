import type { UserCredentialRecord, UserRegistry, AuthSession } from '@/types';
import { AUTH_USER_REGISTRY, DUMMY_SALT_HEX, DUMMY_ITERATIONS, AUTH_SESSION_DURATION_MS } from '@/constants';

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
  for (let i = 0; i < a.length; i++) {
    const byteA = a[i] ?? 0;
    const byteB = b[i] ?? 0;
    diff |= byteA ^ byteB;
  }
  return diff === 0;
}

// Derives a PBKDF2-HMAC-SHA256 key from a raw password and salt buffer
export async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt as unknown as ArrayBuffer, iterations, hash: 'SHA-256' }, key, 256);
  return new Uint8Array(bits);
}

// Safely finds a user in the registry supporting array, dictionary, case-insensitivity, symbols, and numbers
export function findUserByUsername(
  usernameInput: string,
  registry: UserRegistry = AUTH_USER_REGISTRY
): UserCredentialRecord | null {
  if (!usernameInput || typeof usernameInput !== 'string') return null;
  const normalized = usernameInput.trim().toLowerCase();
  if (Array.isArray(registry)) {
    return registry.find((u) => u?.username?.trim().toLowerCase() === normalized) ?? null;
  }
  if (typeof registry === 'object' && registry !== null) {
    if (normalized in registry && registry[normalized]?.username?.trim().toLowerCase() === normalized) {
      return registry[normalized] ?? null;
    }
    return Object.values(registry).find((u) => u?.username?.trim().toLowerCase() === normalized) ?? null;
  }
  return null;
}

// Verifies credentials via PBKDF2 and dummy key derivation to mitigate timing leakage & user enumeration
export async function verifyCredentials(
  userInput: string,
  passInput: string,
  registry: UserRegistry = AUTH_USER_REGISTRY
): Promise<UserCredentialRecord | null> {
  const user = findUserByUsername(userInput, registry);
  const salt = hexToBytes(user ? user.saltHex : DUMMY_SALT_HEX);
  const iters = user ? user.iterations : DUMMY_ITERATIONS;
  const derived = await deriveKey(passInput, salt, iters);

  return user && constantTimeEqual(derived, hexToBytes(user.hashHex)) ? user : null;
}

// Generates a SHA-256 signature binding username, displayName, role, credentials, issuedAt, and expiresAt
export async function generateSessionSignature(
  user: UserCredentialRecord,
  issuedAt: number,
  expiresAt: number,
  displayName: string,
  role: string = user.role || 'user'
): Promise<string> {
  const payload = `${user.username}:${displayName}:${role}:${user.saltHex}:${user.hashHex}:${issuedAt}:${expiresAt}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Constructs a tamper-proof AuthSession object signed with user identity, display name, role, and expiration
export async function createSession(user: UserCredentialRecord, durationMs = AUTH_SESSION_DURATION_MS): Promise<AuthSession> {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + durationMs;
  const displayName = user.displayName || user.username;
  const role = user.role || 'user';
  const signature = await generateSessionSignature(user, issuedAt, expiresAt, displayName, role);
  return Object.freeze({ username: user.username, displayName, role, issuedAt, expiresAt, signature });
}

// Validates session signature, user integrity, and expiration to prevent any localStorage tampering
export async function validateSession(sessionJson: string | null, registry: UserRegistry = AUTH_USER_REGISTRY): Promise<AuthSession | null> {
  if (!sessionJson) return null;
  try {
    const s = JSON.parse(sessionJson) as AuthSession;
    const now = Date.now();

    // Verify presence and strict types of all session properties
    if (
      typeof s?.username !== 'string' ||
      typeof s?.displayName !== 'string' ||
      typeof s?.signature !== 'string' ||
      typeof s?.issuedAt !== 'number' ||
      typeof s?.expiresAt !== 'number' ||
      Number.isNaN(s.issuedAt) ||
      Number.isNaN(s.expiresAt)
    ) {
      return null;
    }

    // Verify timestamp bounds: not expired, issued not in future, and validity within max duration
    if (now >= s.expiresAt || s.issuedAt > now + 60000 || s.expiresAt <= s.issuedAt || s.expiresAt > s.issuedAt + AUTH_SESSION_DURATION_MS + 1000) {
      return null;
    }

    // Look up registered user identity case-insensitively
    const user = findUserByUsername(s.username, registry);
    if (!user || user.username.trim().toLowerCase() !== s.username.trim().toLowerCase()) return null;

    // Verify displayName matches registry definition
    const expectedDisplayName = user.displayName || user.username;
    if (s.displayName !== expectedDisplayName) return null;

    const expectedRole = user.role || 'user';
    if (typeof s?.role === 'string' && s.role !== expectedRole) return null;

    // Cryptographically verify signature over all fields (supporting role-aware and legacy signatures)
    const expectedSig = await generateSessionSignature(user, s.issuedAt, s.expiresAt, expectedDisplayName, expectedRole);
    const legacySigPayload = `${user.username}:${expectedDisplayName}:${user.saltHex}:${user.hashHex}:${s.issuedAt}:${s.expiresAt}`;
    const legacyDigest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(legacySigPayload));
    const legacySig = Array.from(new Uint8Array(legacyDigest)).map((b) => b.toString(16).padStart(2, '0')).join('');

    const sigMatches = constantTimeEqual(hexToBytes(s.signature), hexToBytes(expectedSig)) ||
      constantTimeEqual(hexToBytes(s.signature), hexToBytes(legacySig));

    if (!sigMatches) return null;

    return Object.freeze({
      username: user.username,
      displayName: expectedDisplayName,
      role: expectedRole,
      issuedAt: s.issuedAt,
      expiresAt: s.expiresAt,
      signature: s.signature,
    });
  } catch {
    return null;
  }
}
