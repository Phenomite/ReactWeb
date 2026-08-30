export interface UserCredentialRecord {
  id: string;
  username: string;
  displayName: string;
  saltHex: string;
  hashHex: string;
  iterations: number;
  role: string;
}

export interface AuthSession {
  username: string;
  displayName: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (name: string, pass: string) => Promise<boolean>;
  logout: () => void;
}
