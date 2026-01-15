// src/engine/WidgetEngine.js
import { MetricEngine } from './MetricEngine';
import { AnalyticsEngine } from './AnalyticsEngine';
import { NormalizationEngine } from './NormalizationEngine';

/**
 * WidgetEngine
 * Prepares data for widgets (rings, sparklines, heatmaps, stacked bars)
 */
export const WidgetEngine = {
  /**
   * Prepare data for a ring chart (goal completion)
   * Returns: { value: 0-100, color, label }
   */
  ringData: (metricConfig, logs = []) => {
    const completion = MetricEngine.goalCompletion(metricConfig, logs);
    return {
      value: completion,
      color: metricConfig.color || '#4f46e5',
      label: metricConfig.label,
    };
  },

  /**
   * Prepare data for a sparkline chart (rolling window)
   * Returns array of normalized values 0-1
   */
  sparklineData: (metricConfig, logs = [], windowDays = 30) => {
    const recentLogs = logs
      .filter(l => l.metricId === metricConfig.id)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const normalized = NormalizationEngine.normalizeLogs(metricConfig, recentLogs);

    // Optionally, limit to windowDays most recent
    return normalized.slice(-windowDays);
  },

  /**
   * Prepare heatmap data (boolean metrics over time)
   * Returns object: { 'YYYY-MM-DD': value }
   */
  heatmapData: (metricConfig, logs = []) => {
    const heatmap = {};
    logs
      .filter(l => l.metricId === metricConfig.id)
      .forEach(l => {
        const dateKey = new Date(l.timestamp).toISOString().slice(0, 10);
        heatmap[dateKey] = l.value ? 1 : 0;
      });
    return heatmap;
  },

  /**
   * Prepare stacked bar data for multiple metrics
   * Returns array of { label, value, normalized }
   */
  stackedBarData: (metricConfigs = [], logs = []) => {
    return metricConfigs.map(metric => {
      const total = logs
        .filter(l => l.metricId === metric.id)
        .reduce((acc, l) => acc + l.value, 0);
      const normalized = NormalizationEngine.normalizeValue(metric, total);
      return {
        label: metric.label,
        value: total,
        normalized,
        color: metric.color,
      };
    });
  },

  /**
   * Prepare summary data for widgets like Current Streak or Generic Number
   * Returns object: { streak, total, average }
   */
  summaryData: (metricConfig, logs = []) => {
    const streak = MetricEngine.currentStreak(logs, metricConfig.id);
    const total = logs
      .filter(l => l.metricId === metricConfig.id)
      .reduce((acc, l) => acc + l.value, 0);
    const avg = logs.filter(l => l.metricId === metricConfig.id).length
      ? total / logs.filter(l => l.metricId === metricConfig.id).length
      : 0;

    return { streak, total, average: avg };
  },
};
