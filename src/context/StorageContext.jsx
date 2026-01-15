import React, { createContext, useContext, useState, useEffect } from 'react';

// ----------------------
// Schemas
// ----------------------
export const MetricType = Object.freeze({
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  PERCENTAGE: 'percentage',
});

export const WidgetType = Object.freeze({
  RING: 'ring',
  SPARKLINE: 'sparkline',
  BAR: 'bar',
  GENERIC: 'generic',
});

export class MetricConfig {
  constructor({ id, label, type, goal, color, widgetType }) {
    this.id = id; // unique string
    this.label = label; // string
    this.type = type; // MetricType
    this.goal = goal; // number
    this.color = color; // hex or string
    this.widgetType = widgetType; // WidgetType
  }
}

export class LogEntry {
  constructor({ id, metricId, value, timestamp }) {
    this.id = id; // unique string
    this.metricId = metricId; // MetricConfig id
    this.value = value; // number or boolean
    this.timestamp = timestamp || new Date().toISOString();
  }
}

export class TimeLog {
  constructor({ id, metricId, dailyValues }) {
    this.id = id; // unique string
    this.metricId = metricId; // MetricConfig id
    this.dailyValues = dailyValues || {}; // { '2026-01-15': value }
  }
}

// ----------------------
// Storage Context
// ----------------------
export const StorageContext = createContext();

export const useStorage = () => {
  return useContext(StorageContext);
};

export const StorageProvider = ({ children }) => {
  // 1. Core State
  // We use 'logEntries' to match the variable name expected by Horizon.jsx
  const [metrics, setMetrics] = useState([]);
  const [logEntries, setLogEntries] = useState([]); 
  const [widgetLayout, setWidgetLayout] = useState({});

  // 2. Load from LocalStorage on Mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('orbit_db');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.metrics) setMetrics(parsed.metrics);
        if (parsed.logEntries) setLogEntries(parsed.logEntries);
        if (parsed.widgetLayout) setWidgetLayout(parsed.widgetLayout);
      }
    } catch (e) {
      console.error("Failed to load ORBIT data", e);
    }
  }, []);

  // 3. Save to LocalStorage on Change
  useEffect(() => {
    const dataToSave = {
      metrics,
      logEntries,
      widgetLayout
    };
    localStorage.setItem('orbit_db', JSON.stringify(dataToSave));
  }, [metrics, logEntries, widgetLayout]);

  // ----------------------
  // Actions: Metrics
  // ----------------------
  const addMetric = (metricData) => {
    const newMetric = {
      ...metricData,
      id: metricData.id || crypto.randomUUID(),
      created: new Date().toISOString()
    };
    setMetrics(prev => [...prev, newMetric]);
  };

  const updateMetric = (updatedMetric) => {
    setMetrics(prev => prev.map(m => m.id === updatedMetric.id ? updatedMetric : m));
  };

  const deleteMetric = (id) => {
    // Delete the metric
    setMetrics(prev => prev.filter(m => m.id !== id));
    // Optional: Delete associated logs to clean up DB
    setLogEntries(prev => prev.filter(l => l.metricId !== id));
  };

  // ----------------------
  // Actions: Logging
  // ----------------------
  const addLogEntry = (entryData) => {
    const newEntry = new LogEntry({
      id: crypto.randomUUID(),
      metricId: entryData.metricId || entryData.metricKey, // Handle potential inconsistent naming
      value: entryData.value,
      timestamp: entryData.timestamp
    });
    setLogEntries(prev => [...prev, newEntry]);
  };

  // ----------------------
  // Actions: Data Management
  // ----------------------
  const importData = (jsonData) => {
    if (!jsonData) return;
    if (Array.isArray(jsonData.metrics)) setMetrics(jsonData.metrics);
    if (Array.isArray(jsonData.logEntries)) setLogEntries(jsonData.logEntries);
    if (jsonData.widgetLayout) setWidgetLayout(jsonData.widgetLayout);
  };

  const exportData = () => {
    return {
      metrics,
      logEntries,
      widgetLayout,
      exportedAt: new Date().toISOString()
    };
  };

  const clearAllData = () => {
    setMetrics([]);
    setLogEntries([]);
    setWidgetLayout({});
    localStorage.removeItem('orbit_db');
  };

  return (
    <StorageContext.Provider value={{
      // State
      metrics,
      logEntries,
      logs: logEntries, // Alias for older components
      widgetLayout,

      // Metric Actions
      addMetric,
      updateMetric,
      deleteMetric,

      // Log Actions
      addLogEntry,
      
      // Data Management
      // We provide aliases because System.jsx and DataManagement.jsx 
      // used slightly different names in your previous files.
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
