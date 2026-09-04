import { useState, useMemo, memo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Search,
  Download,
  Sparkles,
  Clock,
  Filter,
} from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { MSRC_CVE_DATASET } from '@/constants';
import { useSecurityIncidents } from '@/context/SecurityIncidentContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import type {
  ViewDefinition,
  IncidentSeverity,
  IncidentStatus,
  MsrcAdvisory,
} from '@/types';

const SEVERITY_COLORS: Record<IncidentSeverity, { bg: string; text: string; border: string }> = {
  critical: {
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900/60',
  },
  high: {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60',
  },
  medium: {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900/60',
  },
  low: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
  },
  info: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900/60',
  },
};

const STATUS_OPTIONS: { id: IncidentStatus; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'resolved', label: 'Resolved' },
];

// Renders the unified Microsoft Security operations and MSRC radar view
export const MicrosoftView = memo(() => {
  const {
    incidents,
    unresolvedCount,
    updateStatus,
    simulateThreatSignal,
    exportSentinelLog,
  } = useSecurityIncidents();

  const [activeTab, setActiveTab] = useState<'defender' | 'msrc'>('defender');

  // Defender filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // MSRC search and filters
  const [cveQuery, setCveQuery] = useState('');
  const [cveSeverity, setCveSeverity] = useState<string>('all');
  const [cveProduct, setCveProduct] = useState<string>('all');

  // Defender metrics
  const kpiMetrics = useMemo(() => {
    const active = incidents.filter((i) => i.status === 'active').length;
    const criticalOrHigh = incidents.filter(
      (i) => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved'
    ).length;
    const resolved = incidents.filter((i) => i.status === 'resolved').length;
    return { active, criticalOrHigh, resolved, total: incidents.length };
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [incidents, severityFilter, statusFilter]);

  // Filtered MSRC Advisories
  const filteredCves = useMemo(() => {
    const q = cveQuery.trim().toLowerCase();
    return MSRC_CVE_DATASET.filter((cve: MsrcAdvisory) => {
      if (cveSeverity !== 'all' && cve.severity.toLowerCase() !== cveSeverity.toLowerCase()) {
        return false;
      }
      if (cveProduct !== 'all' && !cve.affectedProduct.toLowerCase().includes(cveProduct.toLowerCase())) {
        return false;
      }
      if (q) {
        const matchesId = cve.cveId.toLowerCase().includes(q);
        const matchesTitle = cve.title.toLowerCase().includes(q);
        const matchesProduct = cve.affectedProduct.toLowerCase().includes(q);
        const matchesDesc = cve.description.toLowerCase().includes(q);
        if (!matchesId && !matchesTitle && !matchesProduct && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [cveQuery, cveSeverity, cveProduct]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card
        heading={APP_STRINGS.VIEWS.MICROSOFT.HEADING_PAGE}
        description={APP_STRINGS.VIEWS.MICROSOFT.TXT_DESCRIPTION}
        icon={Shield}
        headerRight={
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                unresolvedCount > 0
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              )}
            >
              {unresolvedCount > 0 ? (
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{unresolvedCount} Active Alerts</span>
            </span>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('defender')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors',
            activeTab === 'defender'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          <span>{APP_STRINGS.VIEWS.MICROSOFT.TAB_DEFENDER}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('msrc')}
          className={cn(
            'flex cursor-pointer select-none items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors',
            activeTab === 'msrc'
              ? 'border-accent text-accent font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Flame className="h-4 w-4" aria-hidden="true" />
          <span>{APP_STRINGS.VIEWS.MICROSOFT.TAB_MSRC}</span>
        </button>
      </div>

      {/* TAB 1: DEFENDER INCIDENT TRIAGE */}
      {activeTab === 'defender' && (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.HEADING_KPI_ACTIVE}
              </span>
              <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                {kpiMetrics.active}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.HEADING_KPI_CRITICAL}
              </span>
              <p className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                {kpiMetrics.criticalOrHigh}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.HEADING_KPI_RESOLVED}
              </span>
              <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {kpiMetrics.resolved}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.HEADING_KPI_TOTAL}
              </span>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {kpiMetrics.total}
              </p>
            </Card>
          </div>

          {/* Action Toolbar & Filters */}
          <Card className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">{APP_STRINGS.VIEWS.MICROSOFT.BTN_FILTER_ALL}</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={simulateThreatSignal} icon={Sparkles} variant="warning">
                  {APP_STRINGS.VIEWS.MICROSOFT.BTN_SIMULATE_ALERT}
                </Button>
                <Button onClick={exportSentinelLog} icon={Download} variant="secondary">
                  {APP_STRINGS.VIEWS.MICROSOFT.BTN_EXPORT_SENTINEL}
                </Button>
              </div>
            </div>
          </Card>

          {/* Incidents List */}
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.TXT_NO_INCIDENTS}
              </Card>
            ) : (
              filteredIncidents.map((incident) => {
                const colors = SEVERITY_COLORS[incident.severity];
                return (
                  <Card key={incident.id} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              'rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                              colors.bg,
                              colors.text,
                              colors.border
                            )}
                          >
                            {incident.severity}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {incident.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Source: {incident.source}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {incident.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {incident.description}
                        </p>
                        <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                          <strong className="text-slate-800 dark:text-slate-200">Defender Recommendation: </strong>
                          {incident.recommendation}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="flex shrink-0 items-center gap-1.5 pt-1 sm:pt-0">
                        {STATUS_OPTIONS.map((st) => {
                          const isSelected = incident.status === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => updateStatus(incident.id, st.id)}
                              className={cn(
                                'cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95',
                                isSelected
                                  ? st.id === 'resolved'
                                    ? 'bg-emerald-600 text-white'
                                    : st.id === 'investigating'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                              )}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MSRC CVE & VULNERABILITY RADAR */}
      {activeTab === 'msrc' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  value={cveQuery}
                  onChange={(e) => setCveQuery(e.target.value)}
                  placeholder={APP_STRINGS.VIEWS.MICROSOFT.INPUT_SEARCH_CVES}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={cveSeverity}
                  onChange={(e) => setCveSeverity(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>

                <select
                  value={cveProduct}
                  onChange={(e) => setCveProduct(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="all">All Products</option>
                  <option value="edge">Microsoft Edge</option>
                  <option value="entra">Azure Entra ID</option>
                  <option value="defense">Windows Web Defense</option>
                  <option value="365">Microsoft 365</option>
                </select>
              </div>
            </div>
          </Card>

          {/* CVE Cards Grid */}
          <div className="space-y-3">
            {filteredCves.length === 0 ? (
              <Card className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                {APP_STRINGS.VIEWS.MICROSOFT.TXT_NO_CVES}
              </Card>
            ) : (
              filteredCves.map((cve) => (
                <Card key={cve.cveId} className="p-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">
                          {cve.cveId}
                        </span>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                            cve.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : cve.severity === 'High'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          )}
                        >
                          {cve.severity}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          CVSS {cve.cvssScore}
                        </span>
                        {cve.isZeroDay && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
                            <Flame className="h-3 w-3" aria-hidden="true" />
                            {APP_STRINGS.VIEWS.MICROSOFT.TXT_ZERO_DAY_BADGE}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Published: {cve.publishedDate}</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cve.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {cve.description}
                    </p>

                    <div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800/60">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Recommended Mitigation:
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-400">{cve.mitigation}</span>
                      </div>
                      <span className="shrink-0 rounded bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-700 shadow-2xs dark:bg-slate-900 dark:text-slate-300">
                        {cve.kbArticle}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Colocated Microsoft view routing metadata
export const microsoftView: ViewDefinition = {
  id: APP_STRINGS.VIEWS.MICROSOFT.NAV_ID,
  title: APP_STRINGS.VIEWS.MICROSOFT.NAV_TITLE,
  hash: APP_STRINGS.VIEWS.MICROSOFT.NAV_HASH,
  icon: Shield,
  component: MicrosoftView,
};
