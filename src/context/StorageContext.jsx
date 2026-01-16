import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MetricConfig,
  LogEntry,
  MetricType,
  WidgetType,
  createLog,
  createMetric,
  validateMetrics,
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

        // Phase 1: Migrate Data
        parsed = migrateData(parsed);

        if (parsed.metrics) {
            validateMetrics(parsed.metrics);
            setMetrics(parsed.metrics);
        }
        if (parsed.logEntries) {
            validateLogEntries(parsed.logEntries, parsed.metrics || []);
            setLogEntries(parsed.logEntries);
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
    
    // Audit Fix: Add error handling for localStorage quota exceeded
    try {
      localStorage.setItem('orbit_db', JSON.stringify(dataToSave));
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        alert("Storage Quota Exceeded! ORBIT cannot save new data. Please export your data and clear space.");
        console.error("LocalStorage Quota Exceeded", e);
      } else {
        console.error("Failed to save to localStorage", e);
      }
    }
  }, [metrics, logEntries, widgetLayout, onboardingComplete]);

  const addMetric = (metricData) => {
    try {
      const newMetric = createMetric(metricData);
      setMetrics(prev => [...prev, newMetric]);
    } catch (e) {
      console.error("Failed to add metric", e);
    }
  };

  const updateMetric = (updatedMetric) => {
    setMetrics(prev => prev.map(m => m.id === updatedMetric.id ? updatedMetric : m));
  };

  const deleteMetric = (id) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    setLogEntries(prev => prev.filter(l => l.metricId !== id));
  };

  const addLogEntry = (entryData) => {
    try {
      const newEntry = createLog({
        metricId: entryData.metricId, // Strict, no fallback
        value: entryData.value,
        timestamp: entryData.timestamp
      });
      setLogEntries(prev => [...prev, newEntry]);
    } catch (e) {
      console.error("Failed to add log entry", e);
    }
  };

  const completeOnboarding = () => {
    setOnboardingComplete(true);
  };

  // Audit Fix: Add Data validation on import to prevent corrupted state
  const importData = (jsonData) => {
    if (!jsonData) return;

    // Validate Metrics: Must be array and have IDs
    if (Array.isArray(jsonData.metrics)) {
      const validMetrics = jsonData.metrics.filter(m => 
        m && typeof m === 'object' && m.id && m.name
      );
      setMetrics(validMetrics);
    }

    // Validate Logs: Must be array and have metricId + value
    if (Array.isArray(jsonData.logEntries)) {
      const validLogs = jsonData.logEntries.filter(l => 
        l && typeof l === 'object' && l.metricId && (l.value !== undefined)
      );
      setLogEntries(validLogs);
    }

    if (jsonData.widgetLayout && typeof jsonData.widgetLayout === 'object') {
      setWidgetLayout(jsonData.widgetLayout);
    }

    if (typeof jsonData.onboardingComplete !== 'undefined') {
        setOnboardingComplete(jsonData.onboardingComplete);
    }
  };

  const exportData = () => {
    return {
      metrics,
      logEntries,
      widgetLayout,
      onboardingComplete,
      exportedAt: new Date().toISOString()
    };
  };

  const clearAllData = () => {
    setMetrics([]);
    setLogEntries([]);
    setWidgetLayout({});
    setOnboardingComplete(false);
    localStorage.removeItem('orbit_db');
  };

  return (
    <StorageContext.Provider value={{
      metrics,
      logEntries,
      // Audit Fix: Removed duplicate 'logs: logEntries' export
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
    }}>
      {children}
    </StorageContext.Provider>
  );
};
