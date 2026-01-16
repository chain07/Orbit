import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MetricConfig,
  LogEntry,
  MetricType,
  WidgetType,
  createLog,
  createMetric,
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
  }, [metrics, logEntries, widgetLayout, onboardingComplete]);

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
      widgetLayout,
      onboardingComplete,
      exportedAt: new Date().toISOString()
    };
  }, [metrics, logEntries, widgetLayout, onboardingComplete]);

  const clearAllData = useCallback(() => {
    setMetrics([]);
    setLogEntries([]);
    setWidgetLayout({});
    setOnboardingComplete(false);
    localStorage.removeItem('orbit_db');
  }, []);

  const value = useMemo(() => ({
    metrics,
    logEntries,
    widgetLayout,
    onboardingComplete,
    addMetric,
    updateMetric,
    deleteMetric,
    addLogEntry,
    completeOnboarding,
    importData,
    importJSON: importData,
    exportData,
    exportJSON: exportData,
    clearAllData
  }), [
    metrics,
    logEntries,
    widgetLayout,
    onboardingComplete,
    addMetric,
    updateMetric,
    deleteMetric,
    addLogEntry,
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
