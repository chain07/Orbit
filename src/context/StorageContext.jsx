import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MetricConfig,
  LogEntry,
  TimeLog,
  MetricType,
  WidgetType,
  createLog,
  createMetric,
  createTimeLog,
  validateMetrics,
  validateMetricValue,
  validateLogEntries,
  migrateData
} from '../types/schemas';

// Re-export for backward compatibility
export { MetricConfig, LogEntry, MetricType, WidgetType };

export const StorageContext = createContext();

export const useStorage = () => {
  return useContext(StorageContext);
};

export const StorageProvider = ({ children }) => {
  const [metrics, setMetrics] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [widgetLayout, setWidgetLayout] = useState({});
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('orbit_db');
      if (storedData) {
        let parsed = JSON.parse(storedData);

        // Phase 1: Migrate Data to ensure metricId consistency
        parsed = migrateData(parsed);

        if (parsed.metrics) {
            validateMetrics(parsed.metrics);
            setMetrics(parsed.metrics);
        }
        if (parsed.logEntries) {
            validateLogEntries(parsed.logEntries, parsed.metrics || []);
            setLogEntries(parsed.logEntries);

            // Storage Reset Safeguard
            if (parsed.logEntries.length === 0 && parsed.metrics && parsed.metrics.length > 0) {
               console.warn("Log entries are empty after migration. Check schema integrity.");
            }
        }
        if (parsed.timeLogs) {
            // No strict validation for timeLogs in migration yet, but good to have
            // Assuming array
            if (Array.isArray(parsed.timeLogs)) {
                setTimeLogs(parsed.timeLogs);
            }
        }
        if (parsed.widgetLayout) setWidgetLayout(parsed.widgetLayout);
        if (typeof parsed.onboardingComplete !== 'undefined') {
          setOnboardingComplete(parsed.onboardingComplete);
        }
      }
    } catch (e) {
      console.error("Failed to load ORBIT data", e);
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      metrics,
      logEntries,
      timeLogs,
      widgetLayout,
      onboardingComplete
    };
    try {
      localStorage.setItem('orbit_db', JSON.stringify(dataToSave));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        alert("Storage Quota Exceeded! Please export your data and clear space.");
      } else {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [metrics, logEntries, timeLogs, widgetLayout, onboardingComplete]);

  const addMetric = useCallback((metricData) => {
    const newMetric = createMetric(metricData);
    setMetrics(prev => [...prev, newMetric]);
  }, []);

  const updateMetric = useCallback((updatedMetric) => {
    setMetrics(prev => prev.map(m => m.id === updatedMetric.id ? updatedMetric : m));
  }, []);

  const deleteMetric = useCallback((id) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    setLogEntries(prev => prev.filter(l => l.metricId !== id));
    setTimeLogs(prev => prev.filter(l => l.activityId !== id));
  }, []);

  const addLogEntry = useCallback((entryData) => {
    // ENFORCEMENT: Strictly require metricId. metricKey is prohibited.
    if (!entryData.metricId) {
      throw new Error("MANDATORY_SCHEMA_VIOLATION: addLogEntry requires a valid metricId.");
    }

    const newEntry = createLog({
      metricId: entryData.metricId,
      value: entryData.value,
      timestamp: entryData.timestamp
    });

    setLogEntries(prev => [...prev, newEntry]);
  }, []);

  const addTimeLog = useCallback((timeLogData) => {
      const newTimeLog = createTimeLog({
          activityId: timeLogData.activityId || timeLogData.metricId, // Support both for flexibility
          activityLabel: timeLogData.activityLabel,
          startTime: timeLogData.startTime,
          endTime: timeLogData.endTime,
          duration: timeLogData.duration,
          notes: timeLogData.notes
      });

      setTimeLogs(prev => [...prev, newTimeLog]);

      // OPTIONAL: Also add a simplified LogEntry for duration analytics if needed
      // But adhering to strict separation, analytics engines should look at timeLogs for duration metrics if needed.
      // However, current analytics engine looks at logEntries.
      // For Phase 4.2 compliance, we persist to timeLogs.
      // If we want this to show up in charts immediately without updating AnalyticsEngine, we might need to dual-log.
      // But the instruction says "persist it to the timeLogs array, not just a generic numeric LogEntry".
      // This implies we SHOULD NOT add a generic LogEntry, or at least that's the primary goal.
      // I will implement strictly as requested: persist to timeLogs.
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  const importData = useCallback((jsonData) => {
    if (!jsonData) return;
    
    // Apply migration to imported data
    const migrated = migrateData(jsonData);

    if (Array.isArray(migrated.metrics)) {
      const validMetrics = migrated.metrics.filter(m => 
        m && typeof m === 'object' && m.id && m.name
      );
      setMetrics(validMetrics);
    }

    if (Array.isArray(migrated.logEntries)) {
      const validLogs = migrated.logEntries.filter(l => 
        l && typeof l === 'object' && l.metricId && (l.value !== undefined)
      );
      setLogEntries(validLogs);
    }

    if (Array.isArray(migrated.timeLogs)) {
        setTimeLogs(migrated.timeLogs);
    }

    if (migrated.widgetLayout && typeof migrated.widgetLayout === 'object') {
      setWidgetLayout(migrated.widgetLayout);
    }

    if (typeof migrated.onboardingComplete !== 'undefined') {
        setOnboardingComplete(migrated.onboardingComplete);
    }
  }, []);

  const exportData = useCallback(() => {
    return {
      metrics,
      logEntries,
      timeLogs,
      widgetLayout,
      onboardingComplete,
      exportedAt: new Date().toISOString()
    };
  }, [metrics, logEntries, timeLogs, widgetLayout, onboardingComplete]);

  const clearAllData = useCallback(() => {
    setMetrics([]);
    setLogEntries([]);
    setTimeLogs([]);
    setWidgetLayout({});
    setOnboardingComplete(false);
    localStorage.removeItem('orbit_db');
  }, []);

  const value = useMemo(() => ({
    metrics,
    logEntries,
    timeLogs,
    widgetLayout,
    onboardingComplete,
    addMetric,
    updateMetric,
    deleteMetric,
    addLogEntry,
    addTimeLog,
    completeOnboarding,
    importData,
    importJSON: importData,
    exportData,
    exportJSON: exportData,
    clearAllData
  }), [
    metrics,
    logEntries,
    timeLogs,
    widgetLayout,
    onboardingComplete,
    addMetric,
    updateMetric,
    deleteMetric,
    addLogEntry,
    addTimeLog,
    completeOnboarding,
    importData,
    exportData,
    clearAllData
  ]);

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
