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

// Extensible user registry format (array list or dictionary map)
export type UserRegistry = UserCredentialRecord[] | Record<string, UserCredentialRecord>;

// Signed session token stored in localStorage
export interface AuthSession {
  username: string;
  displayName: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
  signature: string;
}

// Authentication context state and methods
export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: string | null;
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

// Toast notification message format
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string | undefined;
  type: ToastType;
  durationMs?: number | undefined;
}

// Toast notification context state and triggers
export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, options?: { description?: string; type?: ToastType; durationMs?: number }) => string;
  dismissToast: (id: string) => void;
}

// Curated accent color identifiers
export type AccentColor = 'blue' | 'violet' | 'emerald' | 'rose' | 'amber';

export interface AccentOption {
  id: AccentColor;
  label: string;
  colorHex: string;
  activeClass: string;
}

// Command palette searchable action item
export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

