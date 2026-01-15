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
   * MASTER AGGREGATOR: Generates full widget structures for Views
   * Used by: Horizon.jsx, Intel.jsx
   */
  generateWidgets: (metrics = [], logs = [], segment = 'Weekly') => {
    // Filter out metrics explicitly hidden from dashboard
    const visibleMetrics = metrics.filter(m => m.dashboardVisible !== false);

    return visibleMetrics.map(metric => {
      let widgetData = null;
      const metricLogs = logs || [];

      try {
        switch (metric.widgetType) {
          case 'ring':
            widgetData = WidgetEngine.ringData(metric, metricLogs);
            break;
            
          case 'heatmap':
            // Heatmaps generally show longer history; wrapping in 'values' object for View compatibility
            widgetData = { 
              values: WidgetEngine.heatmapData(metric, metricLogs),
              start: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(), // Default ~2 months back
              end: new Date().toISOString()
            };
            break;
            
          case 'sparkline':
            // Adjust window based on segment if needed, default to 14 days for sparklines
            const window = segment === 'Monthly' ? 30 : 14; 
            widgetData = { 
              values: WidgetEngine.sparklineData(metric, metricLogs, window) 
            };
            break;
            
          case 'stackedbar':
            // Wraps single metric data to fit the stacked bar format
            widgetData = {
              entries: WidgetEngine.stackedBarData([metric], metricLogs),
              colors: { [metric.label]: metric.color || '#4f46e5' }
            };
            break;
            
          default:
            // Fallback for 'number' or undefined types
            widgetData = WidgetEngine.summaryData(metric, metricLogs);
            break;
        }

        return {
          id: metric.id,
          type: metric.widgetType || 'number', // Default to generic number widget
          title: metric.label,
          data: widgetData
        };

      } catch (err) {
        console.warn(`Widget generation failed for ${metric.label}`, err);
        return null;
      }
    }).filter(w => w !== null); // Filter out any failed widgets
  },

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
        // Robust date parsing
        try {
            const dateKey = new Date(l.timestamp).toISOString().slice(0, 10);
            heatmap[dateKey] = l.value ? 1 : 0;
        } catch (e) {
            // Skip invalid dates
        }
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
