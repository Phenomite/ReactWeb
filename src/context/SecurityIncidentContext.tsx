import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { INITIAL_SECURITY_INCIDENTS, SIMULATED_ALERTS } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { useRealtime } from '@/context/RealtimeContext';
import { APP_STRINGS } from '@/strings';
import type { SecurityIncident, SecurityIncidentContextType, IncidentStatus } from '@/types';

const SecurityIncidentContext = createContext<SecurityIncidentContextType | undefined>(undefined);

// Manages Microsoft Defender security incidents with real-time backend synchronization and Sentinel exports
export function SecurityIncidentProvider({ children }: { children: ReactNode }) {
  const {
    incidents: realtimeIncidents,
    simulateThreatSignal: realtimeSimulate,
    updateData,
  } = useRealtime();
  const [localIncidents, setLocalIncidents] = useState<SecurityIncident[]>(INITIAL_SECURITY_INCIDENTS);
  const { showToast } = useToast();

  const incidents = realtimeIncidents.length > 0 ? realtimeIncidents : localIncidents;

  const unresolvedCount = useMemo(
    () => incidents.filter((i) => i.status !== 'resolved').length,
    [incidents]
  );

  const logIncident = useCallback(async (incident: Omit<SecurityIncident, 'id' | 'timestamp'>) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      });
      if (res.ok) return;
    } catch {
      // Local fallback
    }
    const record: SecurityIncident = {
      ...incident,
      id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setLocalIncidents((prev) => [record, ...prev]);
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: IncidentStatus) => {
      const res = await updateData<SecurityIncident>('incidents', id, { status });
      if (!res.success) {
        setLocalIncidents((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    },
    [updateData]
  );

  const simulateThreatSignal = useCallback(async () => {
    const success = await realtimeSimulate();
    if (!success) {
      const template = SIMULATED_ALERTS[Math.floor(Math.random() * SIMULATED_ALERTS.length)];
      if (!template) return;

      const record: SecurityIncident = {
        ...template,
        id: `inc-${Date.now()}`,
        status: 'active',
        timestamp: Date.now(),
      };

      setLocalIncidents((prev) => [record, ...prev]);
      showToast(APP_STRINGS.VIEWS.MICROSOFT.TXT_THREAT_SIMULATED, {
        type: record.severity === 'critical' ? 'error' : 'warning',
        description: `${record.title} (${record.severity.toUpperCase()})`,
      });
    }
  }, [realtimeSimulate, showToast]);

  const exportSentinelLog = useCallback(() => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      schema: 'Microsoft.SecurityInsights/incidents@2025',
      generator: 'ReactWeb-MicrosoftDefender-Client',
      incidentCount: incidents.length,
      incidents: incidents.map((i) => ({
        ...i,
        isoTimestamp: new Date(i.timestamp).toISOString(),
        cefSeverity: i.severity === 'critical' ? 10 : i.severity === 'high' ? 8 : i.severity === 'medium' ? 5 : 2,
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${APP_STRINGS.VIEWS.MICROSOFT.FILE_EXPORT_SENTINEL_JSON_PREFIX}${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(APP_STRINGS.VIEWS.MICROSOFT.TXT_EXPORT_SUCCESS, { type: 'success' });
  }, [incidents, showToast]);

  const contextValue = useMemo<SecurityIncidentContextType>(
    () => ({
      incidents,
      unresolvedCount,
      logIncident,
      updateStatus,
      simulateThreatSignal,
      exportSentinelLog,
    }),
    [incidents, unresolvedCount, logIncident, updateStatus, simulateThreatSignal, exportSentinelLog]
  );

  return (
    <SecurityIncidentContext.Provider value={contextValue}>
      {children}
    </SecurityIncidentContext.Provider>
  );
}

export function useSecurityIncidents(): SecurityIncidentContextType {
  const context = useContext(SecurityIncidentContext);
  if (!context) {
    throw new Error('useSecurityIncidents must be used within a SecurityIncidentProvider');
  }
  return context;
}
