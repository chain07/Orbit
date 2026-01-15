// src/engine/MetricEngine.js
import { MetricType } from '../context/StorageContext';

/**
 * MetricEngine
 * Provides all core metric calculations for ORBIT
 */
export const MetricEngine = {
  // ----------------------
  // Current streak calculation
  // ----------------------
  currentStreak: (logs = [], metricId) => {
    const metricLogs = logs
      .filter(l => l.metricId === metricId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (metricLogs.length === 0) return 0;

    let streak = 0;
    let lastDate = null;

    for (const log of metricLogs) {
      const logDate = new Date(log.timestamp).toDateString();
      if (!lastDate) {
        // first entry in loop
        streak = 1;
      } else {
        const prev = new Date(lastDate);
        const curr = new Date(logDate);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak += 1; // consecutive day
        else break;
      }
      lastDate = logDate;
    }

    return streak;
  },

  // ----------------------
  // Goal completion %
  // ----------------------
  goalCompletion: (metricConfig, logs = []) => {
    const metricLogs = logs.filter(l => l.metricId === metricConfig.id);
    if (metricLogs.length === 0) return 0;

    const type = metricConfig.type;

    switch (type) {
      case MetricType.BOOLEAN:
        const trueCount = metricLogs.filter(l => l.value).length;
        return Math.min(100, (trueCount / metricLogs.length) * 100);
      case MetricType.NUMBER:
      case MetricType.PERCENTAGE:
        const sum = metricLogs.reduce((acc, l) => acc + l.value, 0);
        return Math.min(100, (sum / (metricLogs.length * metricConfig.goal)) * 100);
      default:
        return 0;
    }
  },

  // ----------------------
  // Rolling averages
  // ----------------------
  rollingAverage: (logs = [], metricId, windowDays = 7) => {
    const metricLogs = logs
      .filter(l => l.metricId === metricId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (metricLogs.length === 0) return 0;

    const today = new Date();
    const startDate = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);

    const windowLogs = metricLogs.filter(l => new Date(l.timestamp) >= startDate);
    const sum = windowLogs.reduce((acc, l) => acc + l.value, 0);
    return sum / (windowLogs.length || 1);
  },

  // ----------------------
  // Normalization across metric types
  // ----------------------
  normalizeValue: (metricConfig, value) => {
    switch (metricConfig.type) {
      case MetricType.BOOLEAN:
        return value ? 1 : 0;
      case MetricType.NUMBER:
      case MetricType.PERCENTAGE:
        return value / metricConfig.goal;
      default:
        return 0;
    }
  },

  // ----------------------
  // Example aggregated stats
  // ----------------------
  stats: (metricConfig, logs = []) => {
    const values = logs
      .filter(l => l.metricId === metricConfig.id)
      .map(l => l.value);

    if (values.length === 0) return {};

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { sum, avg, min, max, count: values.length };
  },
};
