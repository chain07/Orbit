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
const StorageContext = createContext();

export const useStorage = () => {
  return useContext(StorageContext);
};

export const StorageProvider = ({ children }) => {
  // Metrics & Logs
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);

  // Dashboard layout/visibility
  const [widgetLayout, setWidgetLayout] = useState({})
