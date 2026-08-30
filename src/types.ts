import type { ComponentType } from 'react';

// Registered user credential format
export interface UserCredentialRecord {
  id: string;
  username: string;
  displayName: string;
  saltHex: string;
  hashHex: string;
  iterations: number;
  role: string;
}

// Signed session token stored in localStorage
export interface AuthSession {
  username: string;
  displayName: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

// Authentication context state and methods
export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (name: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

// Unified view definition with routing metadata and component
export interface ViewDefinition {
  id: string;
  title: string;
  hash: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
  hideInSidebar?: boolean;
}

