import rawTenantsData from '@/data/tenants.json';
import type { AccentColor, AccentOption, MsrcAdvisory, SecurityIncident, TenantRecord, TenantScoreTier } from '@/types';

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

// Default toast notification display duration of 5000 milliseconds
export const TOAST_CONFIG = {
	DEFAULT_DURATION_MS: 5000,
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
		description:
			'An integer overflow flaw in the V8 WebAssembly runtime allows arbitrary memory write via crafted web payloads.',
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
		description:
			'Improper validation of refresh token binding in client applications could permit token replay across unauthorized tenants.',
		mitigation:
			'Enforce Continuous Access Evaluation (CAE) and device-bound refresh tokens in tenant Conditional Access.',
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
		description:
			'Malicious web assets can evade Mark-of-the-Web (MotW) inspection by exploiting an alternate data stream handling issue.',
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
		description:
			'A missing Cross-Origin-Opener-Policy (COOP) enforcement check permits cross-context document inspection in shared tabs.',
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
		description:
			'Attackers can redirect execution through legacy MSHTML wrappers to bypass Microsoft Edge browser isolation defenses.',
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
		description:
			'Flawed input sanitization in client-side telemetry collectors can lead to suppressed incident alert events.',
		mitigation: 'Update Microsoft Defender sensor agents and audit client script verification hash integrity.',
		kbArticle: 'KB5048820',
		isZeroDay: false,
	},
];

// Seed security incidents for client-side Microsoft Defender triage telemetry
export const INITIAL_SECURITY_INCIDENTS: SecurityIncident[] = [
	{
		id: 'inc-101',
		title: 'Anomalous API Rate Threshold Exceeded',
		severity: 'high',
		status: 'active',
		category: 'Traffic Anomaly',
		source: 'Rate Limiter Service',
		timestamp: Date.now() - 1000 * 60 * 18,
		description: 'Multiple rapid mutation requests detected from external IP violating rate limit threshold.',
		recommendation: 'Inspect source IP address and verify rate-limiting rules.',
	},
	{
		id: 'inc-102',
		title: 'Local Storage Security Boundary Reset',
		severity: 'medium',
		status: 'investigating',
		category: 'Data Integrity',
		source: 'Storage Management API',
		timestamp: Date.now() - 1000 * 60 * 65,
		description:
			'Complete cache flush invoked via client administration trigger outside of scheduled maintenance windows.',
		recommendation: 'Verify administrator audit trail and inspect state persistence.',
	},
	{
		id: 'inc-103',
		title: 'Ingress TLS Certificate Renewal Scheduled',
		severity: 'low',
		status: 'resolved',
		category: 'Transport Security',
		source: 'Certificate Manager',
		timestamp: Date.now() - 1000 * 60 * 180,
		description: 'Edge TLS certificate renewal automatically negotiated via ACME challenge before 30-day window.',
		recommendation: 'Certificate successfully renewed; no further administrative action required.',
	},
];

// Application runtime version metadata
export const APP_VERSION = '0.0.2';

// Canonical active tenants dataset imported from JSON
export const ALL_TENANTS: TenantRecord[] = rawTenantsData as TenantRecord[];

// Total number of discrete security telemetry signals
export const TOTAL_TELEMETRY_SIGNALS = 4;

// Score tier threshold definitions with corresponding styling classes
export interface ScoreTierDefinition {
	id: Exclude<TenantScoreTier, 'all'>;
	min: number;
	badgeClass: string;
	barColor: string;
}

export const TIER_CONFIG: readonly ScoreTierDefinition[] = [
	{
		id: 'diamond',
		min: 90,
		badgeClass:
			'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
		barColor: 'bg-emerald-500',
	},
	{
		id: 'gold',
		min: 80,
		badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
		barColor: 'bg-blue-500',
	},
	{
		id: 'silver',
		min: 70,
		badgeClass:
			'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
		barColor: 'bg-violet-500',
	},
	{
		id: 'bronze',
		min: 50,
		badgeClass:
			'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
		barColor: 'bg-amber-500',
	},
	{
		id: 'critical',
		min: 0,
		badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
		barColor: 'bg-rose-500',
	},
] as const;

// Simulated threat signals for client-side adversary alert ingestion
export const SIMULATED_ALERTS = [
	{
		title: 'Anomalous Cross-Origin PostMessage Telemetry Probe',
		severity: 'high' as const,
		category: 'Cross-Context Isolation',
		source: 'Browser Window Messaging Guard',
		description:
			'An untrusted origin attempted to post structured messages without meeting COOP same-origin constraints.',
		recommendation: 'Verify targetOrigin validation on window.addEventListener handlers.',
	},
	{
		title: 'Anomalous API Rate Threshold Exceeded',
		severity: 'critical' as const,
		category: 'Traffic Anomaly',
		source: 'Rate Limiter Service',
		description: 'Automated rapid mutation requests flagged from external IP violating rate limit window.',
		recommendation: 'Inspect source IP address and verify edge rate-limiting rules.',
	},
	{
		title: 'Local Storage State Manipulation Flagged',
		severity: 'medium' as const,
		category: 'Data Integrity',
		source: 'Storage Event Listener',
		description: 'Direct console modification of local storage keys detected outside normal application hooks.',
		recommendation: 'Audit client-side state transitions and verify stored preference schema.',
	},
] as const;
