import type { UserCredentialRecord, AccentOption, AccentColor, MsrcAdvisory, SecurityIncident } from '@/types';

// Extensible client-side credential registry for authorized users
export const AUTH_USER_REGISTRY: UserCredentialRecord[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    displayName: 'Admin',
    saltHex: '87b880683d1e1c14f6358c000f55dbd4',
    hashHex: 'e22f996854f8d016166257a91a47df5da5d7708dc49e4e05914675568f48f4d9',
    iterations: 100000,
    role: 'admin',
  }
];

// Fallback salt and iteration count used to simulate derivation on unknown usernames
export const DUMMY_SALT_HEX = 'e0d1b4c798a2f356417b809cfdae1234';
export const DUMMY_ITERATIONS = 100000;

// Session validity duration configured for 7 days (1 week) in milliseconds
export const AUTH_SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

// Theme configuration constants
export const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  MODE_DARK: 'dark',
  MODE_LIGHT: 'light',
  QUERY_PREFERS_DARK: '(prefers-color-scheme: dark)',
} as const;

// Accent palette definitions
export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'blue', label: 'Classic Blue', colorHex: '#2563eb', activeClass: 'border-blue-600 ring-blue-600' },
  { id: 'violet', label: 'Vibrant Violet', colorHex: '#7c3aed', activeClass: 'border-violet-600 ring-violet-600' },
  { id: 'emerald', label: 'Fresh Emerald', colorHex: '#059669', activeClass: 'border-emerald-600 ring-emerald-600' },
  { id: 'rose', label: 'Radiant Rose', colorHex: '#e11d48', activeClass: 'border-rose-600 ring-rose-600' },
  { id: 'amber', label: 'Warm Amber', colorHex: '#d97706', activeClass: 'border-amber-600 ring-amber-600' },
];

// Accent theme storage constants
export const ACCENT_CONFIG = {
  STORAGE_KEY: 'app_accent_color',
  DEFAULT_ACCENT: 'blue' as AccentColor,
} as const;

// Toast notification timeout constants
export const TOAST_CONFIG = {
  DEFAULT_DURATION_MS: 3500,
} as const;

// Authentication storage constants
export const AUTH_CONFIG = {
  STORAGE_KEY_SESSION: 'app_auth_session',
} as const;

// Microsoft Security Response Center (MSRC) curated vulnerability dataset
export const MSRC_CVE_DATASET: MsrcAdvisory[] = [
  {
    cveId: 'CVE-2025-21345',
    title: 'Microsoft Edge Chromium V8 Remote Code Execution Vulnerability',
    severity: 'Critical',
    cvssScore: 9.8,
    affectedProduct: 'Microsoft Edge (Chromium)',
    publishedDate: '2025-02-11',
    description: 'An integer overflow flaw in the V8 WebAssembly runtime allows arbitrary memory write via crafted web payloads.',
    mitigation: 'Update Microsoft Edge to build 133.0.3065.59 or later immediately.',
    kbArticle: 'KB5051280',
    isZeroDay: true,
  },
  {
    cveId: 'CVE-2025-24081',
    title: 'Microsoft Entra ID OAuth Token Replay and Scope Escalation',
    severity: 'High',
    cvssScore: 8.5,
    affectedProduct: 'Azure Entra ID',
    publishedDate: '2025-01-14',
    description: 'Improper validation of refresh token binding in client applications could permit token replay across unauthorized tenants.',
    mitigation: 'Enforce Continuous Access Evaluation (CAE) and device-bound refresh tokens in tenant Conditional Access.',
    kbArticle: 'KB5049301',
    isZeroDay: false,
  },
  {
    cveId: 'CVE-2024-49033',
    title: 'Windows Web Threat Defense Security Feature Bypass Vulnerability',
    severity: 'High',
    cvssScore: 7.8,
    affectedProduct: 'Windows Web Defense',
    publishedDate: '2024-11-12',
    description: 'Malicious web assets can evade Mark-of-the-Web (MotW) inspection by exploiting an alternate data stream handling issue.',
    mitigation: 'Deploy Microsoft Security Update KB5046613 and enable SmartScreen Network Protection.',
    kbArticle: 'KB5046613',
    isZeroDay: true,
  },
  {
    cveId: 'CVE-2025-21298',
    title: 'Microsoft 365 Web Apps Cross-Origin Isolation Policy Bypass',
    severity: 'Medium',
    cvssScore: 6.5,
    affectedProduct: 'Microsoft 365 Web Apps',
    publishedDate: '2025-02-04',
    description: 'A missing Cross-Origin-Opener-Policy (COOP) enforcement check permits cross-context document inspection in shared tabs.',
    mitigation: 'Verify hosting container transmits COOP: same-origin and COEP: require-corp headers.',
    kbArticle: 'KB5050442',
    isZeroDay: false,
  },
  {
    cveId: 'CVE-2024-38112',
    title: 'MSHTML Platform Spoofing and Remote Code Execution Zero-Day',
    severity: 'Critical',
    cvssScore: 8.8,
    affectedProduct: 'Windows Internet Platform',
    publishedDate: '2024-07-09',
    description: 'Attackers can redirect execution through legacy MSHTML wrappers to bypass Microsoft Edge browser isolation defenses.',
    mitigation: 'Apply July Cumulative Update KB5040442; block .url files pointing to non-standard protocols.',
    kbArticle: 'KB5040442',
    isZeroDay: true,
  },
  {
    cveId: 'CVE-2025-21319',
    title: 'Microsoft Defender for Cloud Client-Side Telemetry Tampering',
    severity: 'Medium',
    cvssScore: 5.9,
    affectedProduct: 'Microsoft Defender XDR',
    publishedDate: '2025-01-28',
    description: 'Flawed input sanitization in client-side telemetry collectors can lead to suppressed incident alert events.',
    mitigation: 'Update Microsoft Defender sensor agents and audit client script verification hash integrity.',
    kbArticle: 'KB5048820',
    isZeroDay: false,
  },
];

// Seed security incidents for client-side Microsoft Defender triage telemetry
export const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [
  {
    id: 'inc-101',
    title: 'Suspicious Credential Velocity on Client Login',
    severity: 'high',
    status: 'active',
    category: 'Identity & Access',
    source: 'Auth PBKDF2 Engine',
    timestamp: Date.now() - 1000 * 60 * 18,
    description: 'Multiple rapid cryptographic derivation attempts detected without matching registered salt parameters.',
    recommendation: 'Enforce exponential derivation delay and inspect origin IP reputation.',
  },
  {
    id: 'inc-102',
    title: 'Local Storage Security Boundary Reset',
    severity: 'medium',
    status: 'investigating',
    category: 'Data Integrity',
    source: 'Storage Management API',
    timestamp: Date.now() - 1000 * 60 * 65,
    description: 'Complete cache flush invoked via client administration trigger outside of scheduled maintenance windows.',
    recommendation: 'Verify authenticated administrator audit trail and validate session token signature.',
  },
  {
    id: 'inc-103',
    title: 'Unauthorized Protected Anchor Navigation Trapped',
    severity: 'low',
    status: 'resolved',
    category: 'Route Authorization Guard',
    source: 'Client Hash Router',
    timestamp: Date.now() - 1000 * 60 * 180,
    description: 'Unauthenticated browser navigation to #debug route intercepted and redirected to guest access notice.',
    recommendation: 'Route guard functioning normally; no further administrative action required.',
  },
];


