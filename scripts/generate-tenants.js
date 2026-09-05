import fs from 'node:fs';
import path from 'node:path';

// Seed enterprise names and prefixes/suffixes to create 200 distinct enterprise tenants
const COMPANY_BASES = [
  'Contoso', 'Fabrikam', 'Woodgrove', 'Northwind', 'Tailspin', 'Adatum', 'Litware',
  'AdventureWorks', 'Trey Research', 'Lucerne', 'Coho', 'Alpine', 'VanArsdel',
  'Wide World Importers', 'Southridge', 'Consolidated Messenger', 'Graphic Design Institute',
  'Humongous Insurance', 'Datum Cyber', 'Blue Yonder', 'Lamna Healthcare', 'Relecloud',
  'Kudo Global', 'Fourth Coffee', 'Nod Publishers', 'Wingtip Toys', 'Margie\'s Travel',
  'Munson\'s Pickles', 'Proseware', 'City Power & Light', 'Parnell Aerospace', 'Terra Flora',
  'Bellows College', 'Baldwin Museum', 'Tosh Mondo', 'Finman Global', 'Skyline Networks',
  'Vanguard Medical', 'Apex Capital', 'Solstice Energy', 'Helios Robotics', 'Pinnacle Systems',
  'Aegis Logistics', 'Meridian Bio', 'Titan Industrial', 'Starlight Media', 'Echo Dynamics',
  'OmniCorp Global', 'Crestview Health', 'Falcon Defense', 'Ironclad Cloud', 'Horizon Financial'
];

const MODIFIERS = [
  'Global', 'Enterprises', 'Technologies', 'Systems', 'Holdings', 'Digital',
  'Cloud Services', 'Capital', 'Health', 'Aerospace', 'Security', 'Networks',
  'Consulting', 'International', 'Laboratories', 'Solutions', 'Logistics', 'Robotics'
];

const INDUSTRIES = [
  'Financial Services', 'Healthcare & Life Sciences', 'Manufacturing & Robotics',
  'Retail & E-Commerce', 'Technology & SaaS', 'Aerospace & Defense',
  'Energy & Utilities', 'Telecommunications', 'Higher Education',
  'Media & Entertainment', 'Logistics & Supply Chain', 'Government & Public Sector'
];

const REGIONS = [
  'East US', 'West US 2', 'Central US', 'North Europe', 'West Europe',
  'UK South', 'Southeast Asia', 'Australia East', 'Japan East',
  'Canada Central', 'Sweden Central', 'Switzerland North'
];

// Pseudo-random deterministic generator using linear congruential generator
let seed = 20260905;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min, max, decimals = 1) {
  const val = rand() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

// Generate 200 distinct tenant names
const tenantNames = [];
const usedNames = new Set();

let baseIdx = 0;
let modIdx = 0;
while (tenantNames.length < 200) {
  const base = COMPANY_BASES[baseIdx % COMPANY_BASES.length];
  const mod = MODIFIERS[modIdx % MODIFIERS.length];
  let name = `${base} ${mod}`;

  if (usedNames.has(name)) {
    const cycle = Math.floor(tenantNames.length / COMPANY_BASES.length) + 1;
    name = `${base} ${mod} ${cycle > 1 ? `Group ${cycle}` : 'Corp'}`;
  }

  if (!usedNames.has(name)) {
    usedNames.add(name);
    tenantNames.push(name);
  }

  baseIdx++;
  if (baseIdx % COMPANY_BASES.length === 0) {
    modIdx++;
  }
}

// Generate 200 tenant objects
const rawTenants = tenantNames.map((name, index) => {
  const cleanSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 18);
  const domain = `${cleanSlug}.onmicrosoft.com`;
  const industry = INDUSTRIES[randInt(0, INDUSTRIES.length - 1)];
  const region = REGIONS[randInt(0, REGIONS.length - 1)];
  const seatCount = randInt(1200, 95000);

  // Distribution tier factor (0 = lowest security posture, 1 = elite tier)
  const tierFactor = index < 30 ? randFloat(0.82, 0.98)
    : index < 90 ? randFloat(0.68, 0.86)
    : index < 150 ? randFloat(0.48, 0.72)
    : randFloat(0.24, 0.52);

  // Status bubbles: Sentinel, MDE, MDI, Log Analytics
  const hasSentinel = rand() < (tierFactor * 0.9 + 0.05);
  const hasMDE = rand() < (tierFactor * 0.95 + 0.1);
  const hasMDI = rand() < (tierFactor * 0.88 + 0.05);
  const hasAuditLogging = rand() < (tierFactor * 0.92 + 0.12);

  // Category scores (0 - 100)
  // Device score strongly driven by Defender XDR (MDE)
  const baseDevice = hasMDE ? randFloat(75, 99) : randFloat(25, 62);
  const device = Number(Math.min(99, Math.max(15, baseDevice * (0.85 + tierFactor * 0.15))).toFixed(1));

  // Identities score strongly driven by Entra (MDI)
  const baseIdentities = hasMDI ? randFloat(78, 99) : randFloat(30, 68);
  const identities = Number(Math.min(99, Math.max(18, baseIdentities * (0.85 + tierFactor * 0.15))).toFixed(1));

  // Apps score driven by Defender for Cloud Apps
  const baseApps = (hasSentinel && hasMDE) ? randFloat(70, 96) : randFloat(32, 72);
  const apps = Number(Math.min(98, Math.max(12, baseApps * (0.88 + tierFactor * 0.12))).toFixed(1));

  // Data score driven by Purview & Audit Logging
  const baseData = hasAuditLogging ? randFloat(68, 96) : randFloat(22, 58);
  const data = Number(Math.min(97, Math.max(10, baseData * (0.85 + tierFactor * 0.15))).toFixed(1));

  // Overall Score calculated via Microsoft standard weighted composite
  // Identities: 32%, Device: 28%, Apps: 22%, Data: 18%
  const overallScore = Number((identities * 0.32 + device * 0.28 + apps * 0.22 + data * 0.18).toFixed(1));

  return {
    id: `tenant-${String(index + 1).padStart(3, '0')}`,
    name,
    domain,
    industry,
    region,
    seatCount,
    statusBubbles: {
      sentinel: hasSentinel,
      mde: hasMDE,
      mdi: hasMDI,
      logAnalytics: hasAuditLogging,
    },
    categories: {
      device,
      identities,
      apps,
      data,
    },
    overallScore,
    rank: 0,
  };
});

// Sort by overallScore descending to assign official leaderboard ranks #1 to #200
rawTenants.sort((a, b) => b.overallScore - a.overallScore);
rawTenants.forEach((tenant, idx) => {
  tenant.rank = idx + 1;
});

const outDir = path.resolve('src/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'tenants.json');
fs.writeFileSync(outPath, JSON.stringify(rawTenants, null, 2), 'utf-8');

console.log(`Generated ${rawTenants.length} tenants successfully at ${outPath}`);
console.log(`Top Tenant: #${rawTenants[0].rank} ${rawTenants[0].name} (${rawTenants[0].overallScore}%)`);
console.log(`Lowest Tenant: #${rawTenants[199].rank} ${rawTenants[199].name} (${rawTenants[199].overallScore}%)`);

