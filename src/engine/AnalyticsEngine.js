// src/engine/AnalyticsEngine.js
import { MetricEngine } from './MetricEngine';
import { MetricType } from '../context/StorageContext';

/**
 * AnalyticsEngine
 * Provides advanced multi-metric analytics for ORBIT
 */
export const AnalyticsEngine = {
  // ----------------------
  // Rolling averages per metric
  // ----------------------
  rollingAverages: (metrics = [], logs = [], windowDays = 7) => {
    const results = {};
    metrics.forEach(metric => {
      results[metric.id] = MetricEngine.rollingAverage(logs, metric.id, windowDays);
    });
    return results;
  },

  // ----------------------
  // Trend delta calculation
  // Compares average of current window vs previous window
  // ----------------------
  trendDeltas: (metrics = [], logs = [], windowDays = 7) => {
    const results = {};
    const today = new Date();

    metrics.forEach(metric => {
      const currentWindowStart = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);
      const previousWindowStart = new Date(today.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

      const metricLogs = logs
        .filter(l => l.metricId === metric.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const currentWindowLogs = metricLogs.filter(l => new Date(l.timestamp) >= currentWindowStart);
      const previousWindowLogs = metricLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= previousWindowStart && ts < currentWindowStart;
      });

      const currentAvg =
        currentWindowLogs.reduce((acc, l) => acc + l.value, 0) / (currentWindowLogs.length || 1);
      const previousAvg =
        previousWindowLogs.reduce((acc, l) => acc + l.value, 0) / (previousWindowLogs.length || 1);

      results[metric.id] = currentAvg - previousAvg; // positive = upward trend
    });

    return results;
  },

  // ----------------------
  // Multi-metric normalization
  // ----------------------
  normalizedMetrics: (metrics = [], logs = []) => {
    const results = {};
    metrics.forEach(metric => {
      const metricLogs = logs.filter(l => l.metricId === metric.id);
      results[metric.id] = metricLogs.map(l => MetricEngine.normalizeValue(metric, l.value));
    });
    return results;
  },

  // ----------------------
  // Lagged correlations (Pearson) between pairs of metrics
  // ----------------------
  laggedCorrelations: (metrics = [], logs = [], lagDays = 0) => {
    const correlations = {};

    const getValues = (metricId) =>
      logs
        .filter(l => l.metricId === metricId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map(l => l.value);

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const idA = metrics[i].id;
        const idB = metrics[j].id;
        const valuesA = getValues(idA).slice(0, -lagDays || undefined);
        const valuesB = getValues(idB).slice(lagDays);

        if (valuesA.length !== valuesB.length || valuesA.length === 0) {
          correlations[`${idA}-${idB}`] = null;
          continue;
        }

        const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
        const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;

        let numerator = 0,
          denomA = 0,
          denomB = 0;

        for (let k = 0; k < valuesA.length; k++) {
          numerator += (valuesA[k] - meanA) * (valuesB[k] - meanB);
          denomA += Math.pow(valuesA[k] - meanA, 2);
          denomB += Math.pow(valuesB[k] - meanB, 2);
        }

        correlations[`${idA}-${idB}`] = numerator / (Math.sqrt(denomA * denomB) || 1);
      }
    }

    return correlations;
  },

  // ----------------------
  // Time-window comparison summaries
  // ----------------------
  windowComparisons: (metrics = [], logs = [], windowDays = 7) => {
    const comparisons = {};
    metrics.forEach(metric => {
      const avgCurrent = AnalyticsEngine.rollingAverages([metric], logs, windowDays)[metric.id];
      const avgPrevious = AnalyticsEngine.rollingAverages([metric], logs, 2 * windowDays)[metric.id];
      comparisons[metric.id] = {
        current: avgCurrent,
        previous: avgPrevious,
        delta: avgCurrent - avgPrevious,
      };
    });
    return comparisons;
  },
};
