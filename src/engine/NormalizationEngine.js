// src/engine/NormalizationEngine.js
import { MetricType } from '../context/StorageContext';

/**
 * NormalizationEngine
 * Provides methods to normalize metric values for analytics and visualization
 */
export const NormalizationEngine = {
  /**
   * Normalize a single value according to metric type
   * Returns a number between 0 and 1
   */
  normalizeValue: (metricConfig, value) => {
    if (!metricConfig || value == null) return 0;

    switch (metricConfig.type) {
      case MetricType.BOOLEAN:
        return value ? 1 : 0;
      case MetricType.NUMBER:
      case MetricType.PERCENTAGE:
        if (metricConfig.goal === 0) return 0;
        return Math.min(1, value / metricConfig.goal);
      default:
        return 0;
    }
  },

  /**
   * Normalize an array of LogEntry values for a given metric
   * Returns array of normalized values (0–1)
   */
  normalizeLogs: (metricConfig, logs = []) => {
    return logs
      .filter(l => l.metricId === metricConfig.id)
      .map(l => NormalizationEngine.normalizeValue(metricConfig, l.value));
  },

  /**
   * Normalize multiple metrics at once
   * metrics: array of MetricConfig
   * logs: array of LogEntry
   * Returns object: { metricId: [normalizedValues] }
   */
  normalizeMultiple: (metrics = [], logs = []) => {
    const normalized = {};
    metrics.forEach(metric => {
      normalized[metric.id] = NormalizationEngine.normalizeLogs(metric, logs);
    });
    return normalized;
  },
};
