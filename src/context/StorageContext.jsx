import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { OrbitDB } from '../lib/db';
import {
  MetricConfig,
  LogEntry,
  TimeLog,
  MetricType,
  WidgetType,
  createLog,
  createMetric,
  createTimeLog,
  validateMetricValue,
  migrateData,
  validateMetrics,
  validateLogEntries
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize DB and Load Data
  useEffect(() => {
    const init = async () => {
      try {
        await OrbitDB.init();

        // Check for legacy localStorage data
        const legacyData = localStorage.getItem('orbit_db');
        if (legacyData) {
          console.log("Migrating legacy data to IndexedDB...");
          let parsed = JSON.parse(legacyData);
          parsed = migrateData(parsed);

          // Bulk Insert Migration
          if (parsed.metrics) {
              for (const m of parsed.metrics) await OrbitDB.put('metrics', m);
          }
          if (parsed.logEntries) {
              for (const l of parsed.logEntries) await OrbitDB.add('logs', l);
          }
          if (parsed.timeLogs) {
              for (const t of parsed.timeLogs) await OrbitDB.add('timeLogs', t);
          }

          // Keep lightweight config in localStorage
          if (parsed.widgetLayout) localStorage.setItem('orbit_widget_layout', JSON.stringify(parsed.widgetLayout));
          if (typeof parsed.onboardingComplete !== 'undefined') localStorage.setItem('orbit_onboarding', JSON.stringify(parsed.onboardingComplete));

          // Clear legacy key
          localStorage.removeItem('orbit_db');
          console.log("Migration complete.");
        }

        // Load data from DB
        const dbMetrics = await OrbitDB.getAll('metrics');
        const dbLogs = await OrbitDB.getAll('logs');
        const dbTimeLogs = await OrbitDB.getAll('timeLogs');

        setMetrics(dbMetrics || []);
        setLogEntries(dbLogs || []);
        setTimeLogs(dbTimeLogs || []);

        // Load lightweight config from localStorage
        const layout = localStorage.getItem('orbit_widget_layout');
        if (layout) setWidgetLayout(JSON.parse(layout));

        const onboarding = localStorage.getItem('orbit_onboarding');
        if (onboarding) setOnboardingComplete(JSON.parse(onboarding));

        setIsInitialized(true);

      } catch (e) {
        console.error("Failed to initialize OrbitDB:", e);
      }
    };

    init();
  }, []);

  // Persist Lightweight Config to LocalStorage
  useEffect(() => {
      if (isInitialized) {
          localStorage.setItem('orbit_widget_layout', JSON.stringify(widgetLayout));
          localStorage.setItem('orbit_onboarding', JSON.stringify(onboardingComplete));
      }
  }, [widgetLayout, onboardingComplete, isInitialized]);

  // Optimistic Updates + Async DB Operations

  const addMetric = useCallback((metricData) => {
    const newMetric = createMetric(metricData);
    setMetrics(prev => [...prev, newMetric]); // Optimistic
    OrbitDB.put('metrics', newMetric).catch(e => console.error("DB Error (addMetric):", e));
  }, []);

  const updateMetric = useCallback((updatedMetric) => {
    setMetrics(prev => prev.map(m => m.id === updatedMetric.id ? updatedMetric : m)); // Optimistic
    OrbitDB.put('metrics', updatedMetric).catch(e => console.error("DB Error (updateMetric):", e));
  }, []);

  const deleteMetric = useCallback((id) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
    setLogEntries(prev => prev.filter(l => l.metricId !== id));
    setTimeLogs(prev => prev.filter(l => l.activityId !== id));

    // DB Deletion
    OrbitDB.delete('metrics', id).catch(e => console.error("DB Error (deleteMetric):", e));
    // Note: Deleting related logs in DB requires filtering/iterating or specific cleanup logic.
    // We leave this as a future cleanup task or implement a bulk delete helper.
  }, []);

  const addLogEntry = useCallback((entryData) => {
    if (!entryData.metricId) {
      throw new Error("MANDATORY_SCHEMA_VIOLATION: addLogEntry requires a valid metricId.");
    }

    const newEntry = createLog({
      metricId: entryData.metricId,
      value: entryData.value,
      timestamp: entryData.timestamp
    });

    setLogEntries(prev => [...prev, newEntry]); // Optimistic
    OrbitDB.add('logs', newEntry).catch(e => console.error("DB Error (addLogEntry):", e));
  }, []);

  const addTimeLog = useCallback((timeLogData) => {
      const newTimeLog = createTimeLog({
          activityId: timeLogData.activityId || timeLogData.metricId,
          activityLabel: timeLogData.activityLabel,
          startTime: timeLogData.startTime,
          endTime: timeLogData.endTime,
          duration: timeLogData.duration,
          notes: timeLogData.notes
      });

      setTimeLogs(prev => [...prev, newTimeLog]); // Optimistic
      OrbitDB.add('timeLogs', newTimeLog).catch(e => console.error("DB Error (addTimeLog):", e));
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  const importData = useCallback(async (jsonData) => {
    if (!jsonData) return;
    
    try {
      const migrated = migrateData(jsonData);

      // Validate
      if (migrated.metrics) validateMetrics(migrated.metrics);
      if (migrated.logEntries) validateLogEntries(migrated.logEntries, migrated.metrics || []);

      // DB Bulk Insert
      if (migrated.metrics) {
          await OrbitDB.clear('metrics');
          for (const m of migrated.metrics) await OrbitDB.put('metrics', m);
      }
      if (migrated.logEntries) {
          await OrbitDB.clear('logs');
          for (const l of migrated.logEntries) await OrbitDB.add('logs', l);
      }
      if (migrated.timeLogs) {
          await OrbitDB.clear('timeLogs');
          for (const t of migrated.timeLogs) await OrbitDB.add('timeLogs', t);
      }

      // Reload State from DB to ensure sync
      const dbMetrics = await OrbitDB.getAll('metrics');
      const dbLogs = await OrbitDB.getAll('logs');
      const dbTimeLogs = await OrbitDB.getAll('timeLogs');

      setMetrics(dbMetrics || []);
      setLogEntries(dbLogs || []);
      setTimeLogs(dbTimeLogs || []);

      if (migrated.widgetLayout) setWidgetLayout(migrated.widgetLayout);
      if (typeof migrated.onboardingComplete !== 'undefined') setOnboardingComplete(migrated.onboardingComplete);

    } catch (error) {
      console.error("Import failed:", error);
      alert(`Import failed: ${error.message}`);
    }
  }, []);

  // Note: exportData still reads from state (memory), which is fine as it is kept in sync.
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

  const clearAllData = useCallback(async () => {
    setMetrics([]);
    setLogEntries([]);
    setTimeLogs([]);
    setWidgetLayout({});
    setOnboardingComplete(false);

    await OrbitDB.clear('metrics');
    await OrbitDB.clear('logs');
    await OrbitDB.clear('timeLogs');
    localStorage.removeItem('orbit_widget_layout');
    localStorage.removeItem('orbit_onboarding');
  }, []);

  // Consolidate logs for analytics
  const allLogs = useMemo(() => {
      const timeLogEntries = timeLogs.map(t => ({
          id: t.id,
          metricId: t.activityId,
          value: t.duration,
          timestamp: t.startTime,
          isTimeLog: true
      }));
      return [...logEntries, ...timeLogEntries];
  }, [logEntries, timeLogs]);

  const value = useMemo(() => ({
    metrics,
    logEntries,
    timeLogs,
    allLogs, // Exposed for Analytics
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
    allLogs,
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
