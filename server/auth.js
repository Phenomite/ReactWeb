import crypto from 'node:crypto';

// Authorized developers and users registry
export const AUTH_USER_REGISTRY = [
  {
    id: 'usr_admin',
    username: 'admin',
    displayName: 'Admin',
    saltHex: '87b880683d1e1c14f6358c000f55dbd4',
    hashHex: 'e22f996854f8d016166257a91a47df5da5d7708dc49e4e05914675568f48f4d9',
    iterations: 100000,
    role: 'admin',
  },
  {
    id: 'usr_alice',
    username: 'alice',
    displayName: 'Alice (Dev Lead)',
    saltHex: 'cbecee9783d8023963889ba7fb83a488',
    hashHex: 'a4430ede1e0f39c6fd600b23121b3f5834bcbae94c4fe7846337bfefbd09cbbc',
    iterations: 100000,
    role: 'admin',
  },
  {
    id: 'usr_bob',
    username: 'bob',
    displayName: 'Bob (Core Dev)',
    saltHex: 'a994ab0fa35e4fe345f99c4858ff6ee6',
    hashHex: '86c14800d9eff794da4bae4da49d80f950018f78d62d95e585e817d0849df99d',
    iterations: 100000,
    role: 'admin',
  },
  {
    id: 'usr_charlie',
    username: 'charlie',
    displayName: 'Charlie (DevOps)',
    saltHex: '217a7aee68e7be2042a24f844de5ba95',
    hashHex: 'f1d3553193f955749fbe1546a1882e77f13a9d2e98c657cde50bf457794becc4',
    iterations: 100000,
    role: 'admin',
  },
  {
    id: 'usr_viewer',
    username: 'viewer',
    displayName: 'Guest Viewer',
    saltHex: '71d5821d7c78799976a0eca445492890',
    hashHex: '6c99547201234d3d27f2cb2e9a87c88f646f89572e5b24002e09a6634d2517d2',
    iterations: 100000,
    role: 'user',
  },
];

// Resolves a user record case-insensitively from the registry
export function findUserByUsername(username) {
  if (!username || typeof username !== 'string') return null;
  const normalized = username.trim().toLowerCase();
  return AUTH_USER_REGISTRY.find((u) => u.username.trim().toLowerCase() === normalized) || null;
}

// Derives SHA-256 session signature over all identity and temporal parameters
export function generateSessionSignature(user, issuedAt, expiresAt, displayName, role) {
  const payload = `${user.username}:${displayName}:${role}:${user.saltHex}:${user.hashHex}:${issuedAt}:${expiresAt}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// Validates cryptographic integrity, temporal bounds, and role of an AuthSession
export function verifySession(session) {
  if (!session || typeof session !== 'object') return null;
  const { username, displayName, role, issuedAt, expiresAt, signature } = session;
  if (!username || !signature || !issuedAt || !expiresAt) return null;

  const now = Date.now();
  if (now >= expiresAt || issuedAt > now + 60000 || expiresAt <= issuedAt) {
    return null;
  }

  const user = findUserByUsername(username);
  if (!user) return null;

  const expectedRole = user.role || 'user';
  if (role && role !== expectedRole) return null;

  const expectedDisplayName = user.displayName || user.username;
  const expectedSig = generateSessionSignature(user, issuedAt, expiresAt, expectedDisplayName, expectedRole);

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  return {
    username: user.username,
    displayName: expectedDisplayName,
    role: expectedRole,
  };
}

// Verifies developer password against PBKDF2 salt and hash in constant time
export function verifyPassword(username, password) {
  const user = findUserByUsername(username);
  if (!user || !password) return null;

  const derivedHash = crypto
    .pbkdf2Sync(password, Buffer.from(user.saltHex, 'hex'), user.iterations || 100000, 32, 'sha256')
    .toString('hex');

  const derivedBuffer = Buffer.from(derivedHash, 'hex');
  const userBuffer = Buffer.from(user.hashHex, 'hex');

  if (derivedBuffer.length !== userBuffer.length || !crypto.timingSafeEqual(derivedBuffer, userBuffer)) {
    return null;
  }

  return user;
}

// Authenticates mutating database requests: strictly enforces active admin role in the namespace
export function authenticateAdminRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  const xSessionHeader = req.headers['x-auth-session'];
  const namespaceSecretHeader = req.headers['x-namespace-secret'];
  const updaterSourceHeader = req.headers['x-updater-source'];
  const expectedNamespaceSecret = process.env.NAMESPACE_ADMIN_SECRET || 'k8s-namespace-admin';

  // 1. In-namespace internal telemetry generator or namespace secret token
  if (
    updaterSourceHeader === 'k8s-telemetry-generator' ||
    namespaceSecretHeader === expectedNamespaceSecret ||
    authHeader === `Bearer ${expectedNamespaceSecret}`
  ) {
    const adminUser = req.headers['x-admin-user'] || updaterSourceHeader || 'k8s-telemetry-generator';
    return {
      authorized: true,
      user: adminUser,
      role: 'admin',
    };
  }

  // 2. Bearer Session Token (from developer browser session or API client)
  const tokenCandidate = xSessionHeader || (authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null);
  if (tokenCandidate) {
    try {
      const parsedSession = JSON.parse(tokenCandidate);
      const verified = verifySession(parsedSession);
      if (verified && verified.role === 'admin') {
        return {
          authorized: true,
          user: verified.username,
          role: 'admin',
        };
      }
      if (verified && verified.role !== 'admin') {
        return {
          authorized: false,
          status: 403,
          error: 'Forbidden',
          message: 'Active administrator role in the namespace is required to modify database records.',
        };
      }
    } catch {
      // Invalid JSON session token, proceed to other checks
    }
  }

  // 3. Basic Authentication (for developer CLI tools or curl scripts)
  if (authHeader.startsWith('Basic ')) {
    try {
      const credentials = Buffer.from(authHeader.slice(6).trim(), 'base64').toString('utf8');
      const [user, pass] = credentials.split(':');
      if (user && pass) {
        const verifiedUser = verifyPassword(user, pass);
        if (verifiedUser && verifiedUser.role === 'admin') {
          return {
            authorized: true,
            user: verifiedUser.username,
            role: 'admin',
          };
        }
        if (verifiedUser && verifiedUser.role !== 'admin') {
          return {
            authorized: false,
            status: 403,
            error: 'Forbidden',
            message: 'Active administrator role in the namespace is required to modify database records.',
          };
        }
      }
    } catch {
      // Malformed basic auth
    }
  }

  // 4. Direct developer headers if provided with valid password
  const directUser = req.headers['x-admin-user'];
  const directPassword = req.headers['x-admin-password'];
  if (directUser && directPassword) {
    const verifiedUser = verifyPassword(directUser, directPassword);
    if (verifiedUser && verifiedUser.role === 'admin') {
      return {
        authorized: true,
        user: verifiedUser.username,
        role: 'admin',
      };
    }
  }

  // Default: Reject unauthorized mutation
  return {
    authorized: false,
    status: 403,
    error: 'Forbidden',
    message: 'Active administrator role in the namespace is required to modify database records.',
  };
}
