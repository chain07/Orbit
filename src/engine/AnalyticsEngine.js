// src/engine/AnalyticsEngine.js
import { MetricEngine } from './MetricEngine.js';
import { MetricType } from '../types/schemas.js';

/**
 * AnalyticsEngine
 * Provides advanced multi-metric analytics for ORBIT
 */
export const AnalyticsEngine = {
  // ----------------------
  // NEW: Calculate Trend (Percentage Change)
  // Input: Array of numbers (e.g. last 7 days values)
  // Output: Integer percentage (e.g. 15 for +15%, -10 for -10%)
  // ----------------------
  calculateTrend: (values = []) => {
    if (!values || values.length < 2) return 0;

    // Split data into two halves to compare recent vs previous performance
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid); // If odd length, second half includes the middle/extra item

    // Calculate averages
    const getAvg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
    const avgFirst = getAvg(firstHalf);
    const avgSecond = getAvg(secondHalf);

    // Prevent divide by zero
    if (avgFirst === 0) {
      return avgSecond > 0 ? 100 : 0;
    }

    // Calculate percentage change
    const percentChange = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    return Math.round(percentChange);
  },

  // ----------------------
  // Rolling averages per metric
  // ----------------------
  rollingAverages: (metrics = [], logs = [], windowDays = 7) => {
    const results = {};

    // Pre-group logs by metricId
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];
      // Pass only the logs for this metric to MetricEngine
      // MetricEngine will filter by metric.id again, but since we pass only relevant logs, it's efficient
      results[metric.id] = MetricEngine.rollingAverage(metricLogs, metric.id, windowDays);
    });
    return results;
  },

  // ----------------------
  // Momentum Calculation (formerly Trend Deltas)
  // Compares current 7-day window vs previous 7-day window
  // Input: metrics, logs
  // Output: Object { metricId: number (delta) }
  // ----------------------
  calculateMomentum: (metrics = [], logs = []) => {
    const results = {};
    const windowDays = 7;
    const today = new Date();

    // Normalize dates to start of day for cleaner comparison?
    // Or just use timestamps. Timestamps are fine for rolling windows.

    const currentWindowStart = new Date(today.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const previousWindowStart = new Date(today.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

    // Pre-group logs by metricId for O(1) lookup
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];

      // Sort logs by timestamp ascending
      metricLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const currentWindowLogs = metricLogs.filter(l => new Date(l.timestamp) >= currentWindowStart);
      const previousWindowLogs = metricLogs.filter(l => {
        const ts = new Date(l.timestamp);
        return ts >= previousWindowStart && ts < currentWindowStart;
      });

      const currentAvg =
        currentWindowLogs.reduce((acc, l) => acc + l.value, 0) / (currentWindowLogs.length || 1);
      const previousAvg =
        previousWindowLogs.reduce((acc, l) => acc + l.value, 0) / (previousWindowLogs.length || 1);

      results[metric.id] = currentAvg - previousAvg; // positive = upward momentum
    });

    return results;
  },

  // Alias for backward compatibility if needed, but we should remove "trendDeltas" calls
  trendDeltas: (metrics = [], logs = [], windowDays = 7) => {
      // Mapping old call to new Momentum logic, ignoring windowDays argument for strict 7-day momentum
      return AnalyticsEngine.calculateMomentum(metrics, logs);
  },

  // ----------------------
  // Multi-metric normalization
  // ----------------------
  normalizedMetrics: (metrics = [], logs = []) => {
    const results = {};

    // Pre-group logs by metricId
    const logsByMetric = new Map();
    logs.forEach(l => {
      if (!logsByMetric.has(l.metricId)) logsByMetric.set(l.metricId, []);
      logsByMetric.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
      const metricLogs = logsByMetric.get(metric.id) || [];
      results[metric.id] = metricLogs.map(l => MetricEngine.normalizeValue(metric, l.value));
    });
    return results;
  },

  // ----------------------
  // Lagged correlations (Pearson) between pairs of metrics
  // OPTIMIZED: Pre-calculates sorted values to avoid inner loop filtering/sorting
  // ----------------------
  laggedCorrelations: (metrics = [], logs = [], lagDays = 0) => {
    const correlations = {};

    // 1. Pre-calculate sorted values for all metrics
    const valuesCache = {};

    // Group first to avoid repeated filters on big logs array
    const groupedLogs = new Map();
    logs.forEach(l => {
        if (!groupedLogs.has(l.metricId)) groupedLogs.set(l.metricId, []);
        groupedLogs.get(l.metricId).push(l);
    });

    metrics.forEach(metric => {
        const mLogs = groupedLogs.get(metric.id) || [];
        mLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        valuesCache[metric.id] = mLogs.map(l => l.value);
    });

    // 2. Pairwise loop
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const idA = metrics[i].id;
        const idB = metrics[j].id;

        const valuesA = valuesCache[idA] ? valuesCache[idA].slice(0, -lagDays || undefined) : [];
        const valuesB = valuesCache[idB] ? valuesCache[idB].slice(lagDays) : [];

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

  // ----------------------
  // System Health / Intel Stats
  // ----------------------
  calculateSystemHealth: (metrics = [], logs = [], segment = 'Weekly') => {
    if (!metrics.length) return { reliability: 0, trend: '0%', intensity: 'None', status: 'Offline' };

    // Determine window size in days
    let days = 7;
    if (segment === 'Daily') days = 1;
    if (segment === 'Monthly') days = 30;

    const now = new Date();

    // Filter logs for current window
    const currentLogs = logs.filter(l => {
      const d = new Date(l.timestamp);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= days;
    });

    // Filter logs for previous window (for trend comparison)
    const prevLogs = logs.filter(l => {
      const d = new Date(l.timestamp);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff > days && diff <= (days * 2);
    });

    // 1. Reliability (Average Goal Completion)
    let totalCompletion = 0;
    metrics.forEach(m => {
       // MetricEngine.goalCompletion handles 0-100 logic
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, currentLogs) : 0;
       totalCompletion += Math.min(comp, 100); // Cap individual impact at 100%
    });
    const reliability = Math.round(totalCompletion / (metrics.length || 1));

    // 2. Trend Calculation
    let prevTotal = 0;
    metrics.forEach(m => {
       const comp = MetricEngine.goalCompletion ? MetricEngine.goalCompletion(m, prevLogs) : 0;
       prevTotal += Math.min(comp, 100);
    });
    const prevReliability = Math.round(prevTotal / (metrics.length || 1));
    const trendVal = reliability - prevReliability;
    const trend = trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`;

    // 3. Intensity (Log Volume Heuristic)
    // Baseline: We expect roughly 1 log per metric per day (very rough heuristic)
    const expectedVolume = metrics.length * (days > 1 ? days : 1);
    const ratio = currentLogs.length / (expectedVolume || 1);

    let intensity = 'Low';
    if (ratio > 0.4) intensity = 'Moderate';
    if (ratio > 0.8) intensity = 'High';
    if (ratio > 1.2) intensity = 'Peak';

    // 4. Operational Baseline Status
    const status = reliability > 80 ? 'Optimal' : reliability > 50 ? 'Functional' : 'Degraded';

    return { reliability, trend, intensity, status };
  }
};
